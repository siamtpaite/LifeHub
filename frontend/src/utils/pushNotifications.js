import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, arrayUnion } from "firebase/firestore";

const VAPID_KEY = "BNUcWO06pIDDpRojXViKltfOFpxIzGGW-iYmjpddykma0odoaFGz9IS63Yar3NiYQkwSmR9sQiDiOvgTMsCj9A8";

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  });
}

/**
 * Request push permission and save FCM token to Firestore.
 * Call this after the user logs in.
 */
export async function registerPushNotifications(uid) {
  if (!("Notification" in window)) {
    console.warn("[Push] Browser does not support notifications");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("[Push] Service workers not supported");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[Push] Notification permission denied");
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (!token) {
      console.warn("[Push] No FCM token received");
      return null;
    }

    // Save token to Firestore under users/{uid}
    const db = getFirestore(app);
    await setDoc(
      doc(db, "users", uid),
      { fcmTokens: arrayUnion(token) },
      { merge: true }
    );

    console.log("[Push] Token registered:", token.slice(0, 20) + "...");
    return token;
  } catch (err) {
    console.error("[Push] Registration error:", err);
    return null;
  }
}

/**
 * Listen for foreground messages and show a toast/alert.
 * Call this once after login.
 */
export function onForegroundMessage(callback) {
  try {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    return onMessage(messaging, callback);
  } catch (err) {
    console.error("[Push] onMessage error:", err);
    return () => {};
  }
}
