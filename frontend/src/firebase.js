import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
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

function initAuth() {
  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch (e) {
    if (e?.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw e;
  }
}

export const auth = initAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);

const OAUTH_PENDING_KEY = "lifehub_oauth_pending";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope("email");

const appleProvider = new OAuthProvider("apple.com");

export function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function configureFacebookProvider() {
  if (isMobileBrowser()) {
    facebookProvider.setCustomParameters({ display: "touch" });
  }
}

configureFacebookProvider();

export function markOAuthPending(provider) {
  try {
    sessionStorage.setItem(OAUTH_PENDING_KEY, provider);
  } catch (_) {
    /* private mode / blocked storage */
  }
}

export function clearOAuthPending() {
  try {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch (_) {
    /* ignore */
  }
}

function consumeOAuthPending() {
  try {
    const provider = sessionStorage.getItem(OAUTH_PENDING_KEY);
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    return provider;
  } catch (_) {
    return null;
  }
}

/** Google: redirect everywhere (works reliably on mobile Chrome). */
export const signInWithGoogle = () => {
  markOAuthPending("google");
  return signInWithRedirect(auth, googleProvider);
};

/**
 * Facebook: redirect on desktop; popup on mobile browsers.
 * Facebook redirect often bounces straight back on mobile without showing login
 * (sessionStorage partition / provider quirks). Popup keeps the flow in-tab.
 */
export const signInWithFacebook = () => {
  configureFacebookProvider();
  if (isMobileBrowser()) {
    return signInWithPopup(auth, facebookProvider);
  }
  markOAuthPending("facebook");
  return signInWithRedirect(auth, facebookProvider);
};

export const signInWithApple = () => {
  markOAuthPending("apple");
  return signInWithRedirect(auth, appleProvider);
};

export async function completeOAuthRedirect() {
  const result = await getRedirectResult(auth);
  const pending = consumeOAuthPending();

  if (result?.user) {
    return result;
  }

  if (pending && !auth.currentUser) {
    const err = new Error("OAuth redirect did not complete");
    err.code =
      pending === "facebook"
        ? "auth/facebook-redirect-incomplete"
        : "auth/redirect-incomplete";
    err.pendingProvider = pending;
    throw err;
  }

  return result;
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
  "auth/facebook-redirect-incomplete":
    "Facebook sign-in did not complete. Check that lifehub.fit is listed in your Facebook app settings, then try again.",
  "auth/redirect-incomplete": "Sign-in did not complete. Please try again.",
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
