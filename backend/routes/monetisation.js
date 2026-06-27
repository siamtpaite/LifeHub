const express = require("express");
const crypto = require("crypto");
const gumroadLinks = require("../services/gumroadPayment");
const { verifyCryptoPayment } = require("../services/cryptoPayment");
const { upgradePlanByEmail, upgradePlanByUid } = require("../services/planUpgrade");

const router = express.Router();

const pricing = {
  monthly: 6.99,
  yearly: 69.99
};

// Allowed networks for crypto payments
const ALLOWED_NETWORKS = new Set(["SOL", "BASE", "TRON"]);

// Tx hash format validators per network
const TX_HASH_PATTERNS = {
  SOL: /^[1-9A-HJ-NP-Za-km-z]{80,90}$/,   // Base58, ~88 chars
  BASE: /^0x[a-fA-F0-9]{64}$/,              // EVM: 0x + 64 hex
  TRON: /^[a-fA-F0-9]{64}$/,               // TRON: 64 hex
};

// Gumroad product permalink → plan name
const GUMROAD_PERMALINK_TO_PLAN = {
  [process.env.GUMROAD_PRODUCT_ID_MONTHLY || "pmlxwh"]: "monthly",
  [process.env.GUMROAD_PRODUCT_ID_YEARLY  || "ievmvi"]: "yearly"
};

// Timing-safe string comparison to prevent timing attacks on secrets
function safeEqual(a, b) {
  try {
    const aBuf = Buffer.from(String(a));
    const bBuf = Buffer.from(String(b));
    if (aBuf.length !== bBuf.length) {
      // Still do the compare to avoid timing leak on length
      crypto.timingSafeEqual(aBuf, aBuf);
      return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

// ─── Redirect to Gumroad checkout ────────────────────────────────────────────

router.get("/gumroad/:plan", (req, res) => {
  const { plan } = req.params;
  // Strict whitelist — no dynamic strings from user input
  if (!["monthly", "yearly"].includes(plan) || !gumroadLinks[plan]) {
    return res.status(404).send("Invalid plan");
  }
  return res.redirect(gumroadLinks[plan]);
});

// ─── Gumroad Ping webhook ────────────────────────────────────────────────────
// Configure in Gumroad Dashboard → Settings → Advanced → Ping URL:
//   https://lifehub-bay.vercel.app/api/monetisation/gumroad/webhook
//
// Gumroad signs pings with HMAC-SHA256 if a webhook secret is configured.
// Set GUMROAD_WEBHOOK_SECRET in env to match the secret in Gumroad dashboard.

router.post("/gumroad/webhook", express.urlencoded({ extended: true, limit: "50kb" }), async (req, res) => {
  try {
    // Verify Gumroad webhook signature when secret is configured
    const gumroadSecret = process.env.GUMROAD_WEBHOOK_SECRET;
    if (gumroadSecret) {
      const sig = req.headers["x-gumroad-signature"] || "";
      // Gumroad sends the raw body as-is for HMAC; reconstruct from urlencoded body
      const rawBody = new URLSearchParams(req.body).toString();
      const expected = crypto
        .createHmac("sha256", gumroadSecret)
        .update(rawBody)
        .digest("hex");
      if (!safeEqual(sig, expected)) {
        console.warn("[Gumroad] Invalid webhook signature");
        return res.status(401).send("Unauthorized");
      }
    }

    const {
      email,
      product_permalink,
      sale_timestamp,
      order_number,
      refunded,
      chargebacked
    } = req.body;

    // Ignore refunds and chargebacks
    if (refunded === "true" || chargebacked === "true") {
      console.log(`[Gumroad] Ignoring refund/chargeback for order ${order_number}`);
      return res.status(200).send("ok");
    }

    if (!email || !product_permalink) {
      console.warn("[Gumroad] Missing email or product_permalink in ping");
      return res.status(400).send("Missing fields");
    }

    const plan = GUMROAD_PERMALINK_TO_PLAN[product_permalink];
    if (!plan) {
      console.warn(`[Gumroad] Unknown product_permalink: ${product_permalink}`);
      return res.status(200).send("ok"); // Return 200 so Gumroad doesn't retry
    }

    const result = await upgradePlanByEmail(email, plan, {
      source: "gumroad",
      orderNumber: order_number,
      saleTimestamp: sale_timestamp,
      productPermalink: product_permalink
    });

    console.log(`[Gumroad] Upgraded ${email} to ${plan} (uid: ${result.uid})`);
    return res.status(200).send("ok");
  } catch (err) {
    console.error("[Gumroad] Webhook error:", err.message);
    // Return 200 anyway — Gumroad retries on non-200 which could cause duplicate upgrades
    return res.status(200).send("ok");
  }
});

// ─── Crypto payment verify + upgrade ─────────────────────────────────────────
// Requires Firebase ID token in Authorization header (Bearer <token>)

router.post("/crypto/verify", async (req, res) => {
  try {
    const { network, txHash, plan } = req.body;

    // Validate plan
    if (!plan || !pricing[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan." });
    }

    // Validate network
    const normalizedNetwork = String(network || "").toUpperCase();
    if (!ALLOWED_NETWORKS.has(normalizedNetwork)) {
      return res.status(400).json({ success: false, message: "Invalid network." });
    }

    // Validate tx hash format to prevent ReDoS / expensive ops on garbage input
    const pattern = TX_HASH_PATTERNS[normalizedNetwork];
    if (!txHash || !pattern.test(String(txHash))) {
      return res.status(400).json({ success: false, message: "Invalid transaction hash format." });
    }

    // Verify Firebase ID token to get the user's UID
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return res.status(401).json({ success: false, message: "Authorization required." });
    }

    let uid;
    try {
      const admin = require("firebase-admin");
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return res.status(401).json({ success: false, message: "Invalid auth token." });
    }

    // Verify on-chain
    const valid = await verifyCryptoPayment(normalizedNetwork, txHash, plan);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Payment not verified on-chain." });
    }

    // Upgrade plan in Firestore
    const result = await upgradePlanByUid(uid, plan, {
      source: "crypto",
      network: normalizedNetwork,
      txHash
    });

    console.log(`[Crypto] Upgraded uid ${uid} to ${plan} via ${normalizedNetwork} tx ${txHash}`);
    return res.json({ success: true, plan, planExpiry: result.planExpiry });
  } catch (err) {
    console.error("[Crypto] Verify error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// ─── RevenueCat webhook ───────────────────────────────────────────────────────
// RevenueCat → Dashboard → Integrations → Webhooks → set Authorization header
// URL: https://lifehub-bay.vercel.app/api/monetisation/revenuecat/webhook
//
// Event types handled:
//   INITIAL_PURCHASE, RENEWAL, UNCANCELLATION, PRODUCT_CHANGE  → upgrade / extend
//   EXPIRATION                                                  → downgrade to free
//   CANCELLATION                                                → no-op (access runs to period end)

const RC_PURCHASE_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
]);

router.post("/revenuecat/webhook", express.json({ limit: "100kb" }), async (req, res) => {
  // Verify the shared secret RevenueCat sends in the Authorization header (timing-safe)
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret && !safeEqual(req.headers["authorization"] || "", secret)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const event = req.body?.event ?? req.body;
  const { type, app_user_id, product_id, expiration_at_ms } = event ?? {};

  if (!type || !app_user_id) {
    return res.status(400).json({ error: "Missing type or app_user_id" });
  }

  try {
    if (RC_PURCHASE_EVENTS.has(type)) {
      const plan = product_id?.includes("yearly") ? "yearly" : "monthly";
      const expiryOverride = expiration_at_ms
        ? new Date(Number(expiration_at_ms))
        : null;

      await upgradePlanByUid(app_user_id, plan, {
        source: "revenuecat",
        productId: product_id,
        store: event.store,
        rcEventType: type,
      }, expiryOverride);

      console.log(`[RevenueCat] ${type}: upgraded ${app_user_id} → ${plan}`);
    } else if (type === "EXPIRATION") {
      const admin = require("firebase-admin");
      const db = admin.firestore();
      await db.collection("users").doc(app_user_id).set({
        plan: "free",
        planExpiry: null,
        planMeta: { source: "revenuecat", rcEventType: type },
      }, { merge: true });
      console.log(`[RevenueCat] EXPIRATION: downgraded ${app_user_id} → free`);
    } else {
      console.log(`[RevenueCat] Unhandled event type: ${type}`);
    }
  } catch (err) {
    console.error("[RevenueCat] Webhook error:", err.message);
    // Return 200 so RevenueCat doesn't retry — failure is logged for investigation
    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ received: true });
});

module.exports = router;
