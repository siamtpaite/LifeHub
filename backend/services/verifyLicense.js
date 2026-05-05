const admin = require("firebase-admin");

function getFirebaseApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set");
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const VAULTS = {
  TRON: "TXE8UZejabi93ks73VzsgeBqXM4C3fEydX",
  SOL: "A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3",
  BASE: "0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8"
};

const GUMROAD_MONTHLY = process.env.GUMROAD_PRODUCT_ID_MONTHLY || "pmlxwh";
const GUMROAD_YEARLY = process.env.GUMROAD_PRODUCT_ID_YEARLY || "ievmvi";
const GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN || "";

async function verifyGumroadLicense({ productId, licenseKey, email }) {
  const body = new URLSearchParams({
    product_id: productId,
    license_key: licenseKey,
    email
  });

  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (GUMROAD_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${GUMROAD_ACCESS_TOKEN}`;
  }

  const response = await fetch("https://api.gumroad.com/v2/licenses/verify", {
    method: "POST",
    headers,
    body
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok && data.success, data };
}

async function verifyLicense({ licenseKey, email, txHash, network }) {
  const key = String(licenseKey || "").trim().toUpperCase();
  const emailNorm = String(email || "").trim().toLowerCase();

  if (!key) {
    return { ok: false, error: "Missing licenseKey", status: 400 };
  }

  try {
    if (key.length === 19) {
      const app = getFirebaseApp();
      const firestore = admin.firestore(app);
      const snap = await firestore.collection("cryptoPurchases").doc(key).get();

      if (snap.exists) {
        const doc = snap.data();
        if (doc.active) {
          return {
            ok: true,
            plan: doc.planCode,
            purchase: {
              email: doc.email,
              license_key: doc.license,
              payment_method: "crypto",
              tx_hash: doc.txHash
            },
            status: 200
          };
        }
      }

      if (txHash && ["TRON", "SOL", "BASE"].includes(network)) {
        return {
          ok: true,
          plan: "monthly",
          purchase: {
            email: emailNorm,
            license_key: key,
            payment_method: "crypto",
            tx_hash: txHash,
            vault: VAULTS[network]
          },
          status: 200
        };
      }

      return { ok: false, error: "Invalid crypto license", status: 401 };
    }

    if (key.length === 35 || key.length === 36) {
      if (!emailNorm) {
        return { ok: false, error: "Missing email", status: 400 };
      }

      let { ok, data } = await verifyGumroadLicense({
        productId: GUMROAD_MONTHLY,
        licenseKey: key,
        email: emailNorm
      });
      let plan = "monthly";

      if (!ok) {
        ({ ok, data } = await verifyGumroadLicense({
          productId: GUMROAD_YEARLY,
          licenseKey: key,
          email: emailNorm
        }));
        plan = "yearly";
      }

      if (ok && data.purchase) {
        return {
          ok: true,
          plan,
          purchase: data.purchase,
          status: 200
        };
      }

      return { ok: false, error: "Invalid Gumroad license", status: 401 };
    }

    return { ok: false, error: "Unsupported license format", status: 400 };
  } catch (error) {
    console.error("verifyLicense error:", error);
    return { ok: false, error: "Server error", status: 500 };
  }
}

async function verifyLicenseHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const result = await verifyLicense(req.body || {});
  const status = result.status || (result.ok ? 200 : 400);
  const response = { ...result };
  delete response.status;
  return res.status(status).json(response);
}

module.exports = { verifyLicense, verifyLicenseHandler, verifyGumroadLicense };
