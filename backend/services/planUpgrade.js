/**
 * planUpgrade.js
 * Shared helper to upgrade a user's plan in Firestore.
 * Used by both Gumroad webhook and crypto verification.
 */

const admin = require("firebase-admin");

function getFirestore() {
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON not set");
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  }
  return admin.firestore();
}

const PLAN_DURATIONS = {
  monthly: 30,
  yearly: 365
};

/**
 * Upgrade a user's plan by Firebase UID.
 * @param {string} uid
 * @param {string} plan  - "monthly" | "yearly"
 * @param {object} meta  - arbitrary metadata stored alongside the plan
 * @param {Date|null} expiryOverride - explicit expiry from RevenueCat; falls back to duration-based
 */
async function upgradePlanByUid(uid, plan, meta = {}, expiryOverride = null) {
  const db = getFirestore();
  const days = PLAN_DURATIONS[plan];
  if (!days) throw new Error(`Unknown plan: ${plan}`);

  const now = new Date();
  const expiry = expiryOverride instanceof Date
    ? expiryOverride
    : new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  await db.collection("users").doc(uid).set({
    plan: "pro",           // Always "pro" for any active subscription; usePlan checks plan === "pro"
    billingInterval: plan, // "monthly" | "yearly" — billing cadence
    planExpiry: admin.firestore.Timestamp.fromDate(expiry),
    planActivatedAt: admin.firestore.Timestamp.fromDate(now),
    planMeta: meta
  }, { merge: true });

  return { uid, plan, planExpiry: expiry.toISOString() };
}

/**
 * Find Firebase UID by email, then upgrade plan.
 */
async function upgradePlanByEmail(email, plan, meta = {}) {
  const normalizedEmail = email.trim().toLowerCase();

  // Look up Firebase Auth user by email
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(normalizedEmail);
  } catch (err) {
    throw new Error(`No Firebase user found for email: ${normalizedEmail}`);
  }

  return upgradePlanByUid(userRecord.uid, plan, meta);
}

module.exports = { upgradePlanByUid, upgradePlanByEmail };
