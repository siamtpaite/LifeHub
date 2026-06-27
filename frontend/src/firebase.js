import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  inMemoryPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Capacitor bridge is injected before JS runs so this is safe at module load.
const isNative = !!(window.Capacitor?.isNativePlatform?.());
const isAndroid = isNative && window.Capacitor?.getPlatform?.() === "android";
const isIOS = isNative && window.Capacitor?.getPlatform?.() === "ios";

// On native (WKWebView / Android WebView), IndexedDB operations can hang indefinitely,
// blocking signInWithCredential forever. inMemoryPersistence avoids all storage I/O.
// Auth state survives backgrounding (the WebView process stays alive); only a full
// app kill requires re-login, which is acceptable for now.
export const auth = initializeAuth(app, {
  persistence: isNative ? inMemoryPersistence : browserLocalPersistence,
});
export const storage = getStorage(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider("apple.com");

const GOOGLE_WEB_CLIENT_ID = "457163791884-u8uidgh5bphik0fcffba77na1fne6rhd.apps.googleusercontent.com";

/**
 * Google Sign-In.
 * Android native: @codetrix-studio/capacitor-google-auth — native account picker.
 * iOS native:     NativeGoogleAuthPlugin — ASWebAuthenticationSession + PKCE.
 *                 signInWithPopup/Redirect both hang in WKWebView; ASWebAuthenticationSession
 *                 is a real Safari overlay that Google permits for OAuth.
 * Web/PWA:        redirect-based flow via Firebase Auth.
 */
export async function signInWithGoogle() {
  if (isAndroid) {
    const { GoogleAuth } = await import(/* webpackIgnore: true */ "@codetrix-studio/capacitor-google-auth");
    await GoogleAuth.initialize({
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: "profile,email",
      grantOfflineAccess: true,
    });
    const googleUser = await GoogleAuth.signIn();
    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
    return signInWithCredential(auth, credential);
  }

  if (isIOS) {
    const { registerPlugin } = await import(/* webpackIgnore: true */ "@capacitor/core");
    const NativeGoogleAuth = registerPlugin("NativeGoogleAuth");
    const result = await NativeGoogleAuth.signIn();
    if (result.error) {
      if (result.error === "cancelled") {
        throw Object.assign(new Error("Sign-in cancelled"), { code: "auth/popup-closed-by-user" });
      }
      throw Object.assign(new Error(result.error), { code: "auth/internal-error" });
    }
    const credential = GoogleAuthProvider.credential(result.idToken, result.accessToken || null);
    return signInWithCredential(auth, credential);
  }

  try { sessionStorage.setItem("lh_redirectPending", "1"); } catch (_) {}
  return signInWithRedirect(auth, googleProvider);
}

export const signInWithFacebook = () => {
  // Facebook OAuth requires window.opener postMessage communication which breaks
  // in Capacitor's WebView on both Android and iOS. Use Google or email instead.
  if (isNative) {
    return Promise.reject(
      Object.assign(new Error("Facebook Sign-In is not available in the mobile app."), {
        code: "auth/facebook-not-available-native",
      })
    );
  }
  try { sessionStorage.setItem("lh_redirectPending", "1"); } catch (_) {}
  return signInWithRedirect(auth, facebookProvider);
};

export const signInWithApple = () => {
  try { sessionStorage.setItem("lh_redirectPending", "1"); } catch (_) {}
  return signInWithRedirect(auth, appleProvider);
};

/**
 * Complete OAuth redirect when returning to the app. Rejects on real auth errors
 * so the UI can show them (e.g. failed Facebook scope / cancelled redirect).
 */
export function completeOAuthRedirect(timeoutMs = 8000) {
  const redirectResult = getRedirectResult(auth);
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  return Promise.race([redirectResult, timeout]);
}

const AUTH_ERROR_MESSAGES = {
  "auth/unauthorized-domain": "This site is not authorized for sign-in. Contact support if this persists.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Please use Google or email/password.",
  "auth/facebook-not-available-native": "Facebook Sign-In is not available in the mobile app. Please use Google or email/password.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked": "Sign-in was blocked. Allow pop-ups or try again.",
  "auth/cancelled-popup-request": "Sign-in was interrupted. Please try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/web-storage-unsupported":
    "Sign-in could not save session data. Turn off private browsing or allow site storage for lifehub.fit.",
};

export function getAuthErrorMessage(err, providerLabel) {
  if (err?.code && AUTH_ERROR_MESSAGES[err.code]) {
    return AUTH_ERROR_MESSAGES[err.code];
  }
  if (providerLabel) {
    return `${providerLabel} sign-in failed. Please try again.`;
  }
  return "Something went wrong. Please try again.";
}

export const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);
