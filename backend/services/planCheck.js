/**
 * planCheck.js
 * Express middleware factories for enforcing subscription plan limits.
 *
 * requireProOrLimit(collection, limit)
 *   — Free users: block creation once they reach `limit` docs in `collection`.
 *   — Pro users: always allowed through.
 *
 * requirePro()
 *   — Blocks non-Pro users with 403; used for entire Pro-only feature routes.
 *
 * Both middlewares read the user's plan from Firestore (set by the RevenueCat
 * / Gumroad / crypto webhook via planUpgrade.js). They must run AFTER requireAuth
 * so that req.user.uid is available.
 */

const admin = require("firebase-admin");

async function getUserPlan(uid) {
  const snap = await admin.firestore().collection("users").doc(uid).get();
  if (!snap.exists()) return { isPro: false };
  const data = snap.data();
  const expiry = data.planExpiry?.toDate ? data.planExpiry.toDate() : null;
  const isExpired = expiry && expiry < new Date();
  return { isPro: data.plan === "pro" && !isExpired };
}

function requireProOrLimit(collection, limit) {
  return async (req, res, next) => {
    try {
      const { isPro } = await getUserPlan(req.user.uid);
      if (isPro) return next();

      const snap = await admin.firestore()
        .collection(collection)
        .where("userId", "==", req.user.uid)
        .select("userId")
        .get();

      if (snap.size >= limit) {
        return res.status(403).json({
          message: `Free plan limit reached (${limit} ${collection}). Upgrade to Pro for unlimited access.`,
          code: "FREE_LIMIT_REACHED",
          limit,
        });
      }
      next();
    } catch (e) {
      console.error(`[planCheck] requireProOrLimit(${collection}):`, e.message);
      next(); // Don't block users on unexpected errors
    }
  };
}

function requirePro() {
  return async (req, res, next) => {
    try {
      const { isPro } = await getUserPlan(req.user.uid);
      if (!isPro) {
        return res.status(403).json({
          message: "This feature requires a Pro subscription.",
          code: "PRO_REQUIRED",
        });
      }
      next();
    } catch (e) {
      console.error("[planCheck] requirePro:", e.message);
      next();
    }
  };
}

module.exports = { requireProOrLimit, requirePro };
