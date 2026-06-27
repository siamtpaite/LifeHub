/**
 * iap.js
 * In-App Purchase service using RevenueCat.
 * Only active on native platforms (iOS/Android).
 * Web continues to use Gumroad/Crypto — this file is a no-op there.
 *
 * RevenueCat entitlement: "pro"
 * Product IDs:
 *   lifehub_pro_monthly  — $6.99/month
 *   lifehub_pro_yearly   — $69.99/year
 */

const isNative = !!(window.Capacitor?.isNativePlatform?.());

let _Purchases = null;

async function getRC() {
  if (!isNative) return null;
  if (_Purchases) return _Purchases;
  try {
    const mod = await import(/* webpackIgnore: true */ "@revenuecat/purchases-capacitor");
    _Purchases = mod.Purchases;
    return _Purchases;
  } catch (e) {
    console.error("[IAP] Failed to load RevenueCat:", e);
    return null;
  }
}

/**
 * Call once after the user signs in.
 * app_user_id = Firebase UID so RevenueCat → backend webhook can identify the user.
 */
export async function initIAP(firebaseUid) {
  if (!isNative) return;
  const RC = await getRC();
  if (!RC) return;

  const platform = window.Capacitor.getPlatform?.() ?? "";
  const apiKey =
    platform === "ios"
      ? process.env.REACT_APP_REVENUECAT_APPLE_KEY
      : process.env.REACT_APP_REVENUECAT_GOOGLE_KEY;

  if (!apiKey) {
    console.warn("[IAP] RevenueCat API key not set for platform:", platform);
    return;
  }

  try {
    await RC.configure({ apiKey, appUserID: firebaseUid });
  } catch (e) {
    console.error("[IAP] configure error:", e);
  }
}

/**
 * Fetch current offerings from RevenueCat.
 * Returns the "default" offering or null.
 */
export async function getOfferings() {
  const RC = await getRC();
  if (!RC) return null;
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 10000)
    );
    const result = await Promise.race([RC.getOfferings(), timeout]);
    return result.current ?? null;
  } catch (e) {
    console.error("[IAP] getOfferings error:", e);
    return null;
  }
}

/**
 * Purchase a RevenueCat Package object.
 * Returns customerInfo on success.
 */
export async function purchasePackage(pkg) {
  const RC = await getRC();
  if (!RC) throw new Error("IAP not available on this platform");
  const { customerInfo } = await RC.purchasePackage({ aPackage: pkg });
  return customerInfo;
}

/**
 * Restore previous purchases (required by Apple guidelines).
 * Returns customerInfo on success.
 */
export async function restorePurchases() {
  const RC = await getRC();
  if (!RC) throw new Error("IAP not available on this platform");
  const { customerInfo } = await RC.restorePurchases();
  return customerInfo;
}

/**
 * Fetch the current subscriber's CustomerInfo from RevenueCat.
 * Used on app startup to immediately detect an active subscription even
 * before the RevenueCat → backend webhook has updated Firestore.
 */
export async function getCurrentCustomerInfo() {
  const RC = await getRC();
  if (!RC) return null;
  try {
    const { customerInfo } = await RC.getCustomerInfo();
    return customerInfo;
  } catch (e) {
    console.error("[IAP] getCustomerInfo error:", e);
    return null;
  }
}

/**
 * Check if customerInfo returned by RC shows an active "pro" entitlement.
 */
export function hasProEntitlement(customerInfo) {
  return !!customerInfo?.entitlements?.active?.["pro"];
}
