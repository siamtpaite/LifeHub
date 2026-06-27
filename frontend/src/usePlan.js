/**
 * usePlan.js
 * Custom hook — subscribes to the user's plan in real time via Firestore onSnapshot.
 *
 * proOverride: set by App.js after a successful App Store purchase (or on startup
 * when RevenueCat CustomerInfo confirms an active entitlement). This lets the UI
 * unlock Pro immediately while the RevenueCat → backend webhook propagates to
 * Firestore (typically a few seconds). Once the snapshot arrives with plan === "pro",
 * proOverride is redundant but harmless. If Firestore explicitly sets plan to "free"
 * (EXPIRATION webhook), that wins over a stale proOverride on next restart.
 */
import { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase";

export function usePlan(user, proOverride = false) {
  const [firestorePlan, setFirestorePlan] = useState("free");
  const [planExpiry, setPlanExpiry] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFirestorePlan("free");
      setPlanExpiry(null);
      setPlanLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const expiry = data.planExpiry?.toDate ? data.planExpiry.toDate() : null;
          const isExpired = expiry && expiry < new Date();
          if (data.plan === "pro" && !isExpired) {
            setFirestorePlan("pro");
            setPlanExpiry(expiry);
          } else {
            setFirestorePlan("free");
            setPlanExpiry(null);
          }
        } else {
          setFirestorePlan("free");
          setPlanExpiry(null);
        }
        setPlanLoading(false);
      },
      (e) => {
        console.warn("[usePlan] Firestore error:", e.message);
        setPlanLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const isPro = firestorePlan === "pro" || proOverride;
  return { plan: isPro ? "pro" : "free", isPro, planExpiry, planLoading };
}
