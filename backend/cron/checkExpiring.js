/**
 * checkExpiring.js
 * Vercel Cron Job — runs daily at 8am IST (2:30 UTC).
 * Scans Firestore for warranties and subscriptions expiring within 5 days.
 * Sends FCM push notifications to affected users.
 */

const admin = require("firebase-admin");
const { sendPushToTokens } = require("../services/fcmSender");

function getFirestore() {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  }
  return admin.firestore();
}

const DAYS_AHEAD = 5;

function daysUntil(dateValue) {
  const target = dateValue?.toDate ? dateValue.toDate() : new Date(dateValue);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function getUserTokens(db, uid) {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? (snap.data().fcmTokens || []) : [];
}

async function checkWarranties(db) {
  const now = admin.firestore.Timestamp.now();
  const cutoff = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + DAYS_AHEAD * 24 * 60 * 60 * 1000
  );

  // Query warranties expiring within 5 days from all users
  const snap = await db.collectionGroup("warranties")
    .where("expiryDate", ">=", now)
    .where("expiryDate", "<=", cutoff)
    .get();

  console.log(`[Cron] Found ${snap.size} expiring warranties`);

  const byUser = {};
  snap.forEach((doc) => {
    const data = doc.data();
    const uid = data.userId || doc.ref.parent.parent?.id;
    if (!uid) return;
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push({ name: data.productName || data.name || "a product", days: daysUntil(data.expiryDate) });
  });

  for (const [uid, items] of Object.entries(byUser)) {
    const tokens = await getUserTokens(db, uid);
    if (!tokens.length) continue;

    for (const item of items) {
      const days = item.days;
      const dayStr = days === 1 ? "tomorrow" : `in ${days} days`;
      await sendPushToTokens(
        tokens,
        {
          title: "⚠️ Warranty Expiring Soon",
          body: `Your warranty for ${item.name} expires ${dayStr}.`
        },
        { url: "https://www.lifehub.fit", type: "warranty" }
      );
    }
  }
}

async function checkSubscriptions(db) {
  const now = admin.firestore.Timestamp.now();
  const cutoff = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + DAYS_AHEAD * 24 * 60 * 60 * 1000
  );

  const snap = await db.collectionGroup("subscriptions")
    .where("nextBillingDate", ">=", now)
    .where("nextBillingDate", "<=", cutoff)
    .get();

  console.log(`[Cron] Found ${snap.size} expiring subscriptions`);

  const byUser = {};
  snap.forEach((doc) => {
    const data = doc.data();
    const uid = data.userId || doc.ref.parent.parent?.id;
    if (!uid) return;
    if (!byUser[uid]) byUser[uid] = [];
    byUser[uid].push({ name: data.name || data.serviceName || "a subscription", days: daysUntil(data.nextBillingDate) });
  });

  for (const [uid, items] of Object.entries(byUser)) {
    const tokens = await getUserTokens(db, uid);
    if (!tokens.length) continue;

    for (const item of items) {
      const days = item.days;
      const dayStr = days === 1 ? "tomorrow" : `in ${days} days`;
      await sendPushToTokens(
        tokens,
        {
          title: "💳 Subscription Renewal Coming Up",
          body: `${item.name} renews ${dayStr}. Make sure your payment is ready.`
        },
        { url: "https://www.lifehub.fit", type: "subscription" }
      );
    }
  }
}

/**
 * Main cron handler — called by Vercel Cron.
 */
async function handler(req, res) {
  // Verify cron secret to prevent unauthorized triggers (timing-safe to prevent brute-force)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = Buffer.from(req.headers["x-cron-secret"] || "");
    const expected = Buffer.from(cronSecret);
    const match = provided.length === expected.length &&
      require("crypto").timingSafeEqual(provided, expected);
    if (!match) return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const db = getFirestore();
    await Promise.all([
      checkWarranties(db),
      checkSubscriptions(db)
    ]);
    return res.json({ ok: true, ran: new Date().toISOString() });
  } catch (err) {
    console.error("[Cron] Error:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = handler;
