import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithRedirect,
  signInWithPopup,
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

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const appleProvider = new OAuthProvider("apple.com");

export function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/** Google: redirect everywhere (reliable cross-browser). */
export const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);

/**
 * Facebook: redirect on desktop; popup on mobile browsers.
 * Facebook redirect frequently bounces back to the homepage on mobile without
 * showing login (storage partitioning); popup keeps the flow in-tab.
 */
export const signInWithFacebook = () => {
  if (isMobileBrowser()) {
    facebookProvider.setCustomParameters({ display: "touch" });
    return signInWithPopup(auth, facebookProvider);
  }
  return signInWithRedirect(auth, facebookProvider);
};

export const signInWithApple = () => signInWithRedirect(auth, appleProvider);

/**
 * Resolve to the redirect result if present, or null. Wrapped with a hard
 * timeout so a slow/hanging Firebase auth call never blocks the splash screen.
 */
export function completeOAuthRedirect(timeoutMs = 4000) {
  const result = getRedirectResult(auth).catch(() => null);
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  return Promise.race([result, timeout]);
}

const AUTH_ERROR_MESSAGES = {
  "auth/unauthorized-domain": "This site is not authorized for sign-in. Contact support if this persists.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked": "Sign-in was blocked. Allow pop-ups or try again.",
  "auth/cancelled-popup-request": "Sign-in was interrupted. Please try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
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
