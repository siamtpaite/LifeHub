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

// Gumroad product permalink → plan name
const GUMROAD_PERMALINK_TO_PLAN = {
  [process.env.GUMROAD_PRODUCT_ID_MONTHLY || "pmlxwh"]: "monthly",
  [process.env.GUMROAD_PRODUCT_ID_YEARLY  || "ievmvi"]: "yearly"
};

// ─── Redirect to Gumroad checkout ────────────────────────────────────────────

router.get("/gumroad/:plan", (req, res) => {
  const { plan } = req.params;
  if (!gumroadLinks[plan]) {
    return res.status(404).send("Invalid plan");
  }
  return res.redirect(gumroadLinks[plan]);
});

// ─── Gumroad Ping webhook ────────────────────────────────────────────────────
// Configure in Gumroad Dashboard → Settings → Advanced → Ping URL:
//   https://lifehub-bay.vercel.app/api/monetisation/gumroad/webhook

router.post("/gumroad/webhook", express.urlencoded({ extended: true }), async (req, res) => {
  try {
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
// so we know which user to upgrade.

router.post("/crypto/verify", async (req, res) => {
  try {
    const { network, txHash, plan } = req.body;

    if (!network || !txHash || !plan || !pricing[plan]) {
      return res.status(400).json({
        success: false,
        message: "network, txHash, and valid plan are required."
      });
    }

    // Verify Firebase ID token to get the user's UID
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return res.status(401).json({ success: false, message: "Authorization required" });
    }

    let uid;
    try {
      const admin = require("firebase-admin");
      const decoded = await admin.auth().verifyIdToken(idToken);
      uid = decoded.uid;
    } catch {
      return res.status(401).json({ success: false, message: "Invalid auth token" });
    }

    // Verify on-chain
    const valid = await verifyCryptoPayment(network, txHash, plan);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Payment not verified on-chain" });
    }

    // Upgrade plan in Firestore
    const result = await upgradePlanByUid(uid, plan, {
      source: "crypto",
      network,
      txHash
    });

    console.log(`[Crypto] Upgraded uid ${uid} to ${plan} via ${network} tx ${txHash}`);
    return res.json({ success: true, plan, planExpiry: result.planExpiry });
  } catch (err) {
    console.error("[Crypto] Verify error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
