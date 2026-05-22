/**
 * usePlan.js
 * Custom hook — fetches the user's plan from Firestore.
 * Returns { plan, isPro, planExpiry, planLoading }
 */
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export function usePlan(user) {
  const [plan, setPlan] = useState("free");
  const [planExpiry, setPlanExpiry] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPlanLoading(false); return; }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const expiry = data.planExpiry?.toDate ? data.planExpiry.toDate() : null;
          const isExpired = expiry && expiry < new Date();
          if (data.plan === "pro" && !isExpired) {
            setPlan("pro");
            setPlanExpiry(expiry);
          } else {
            setPlan("free");
          }
        }
      } catch (e) {
        console.warn("[usePlan] Error fetching plan:", e.message);
      } finally {
        setPlanLoading(false);
      }
    })();
  }, [user]);

  return { plan, isPro: plan === "pro", planExpiry, planLoading };
}
