import React, { useEffect, useState } from "react";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasProEntitlement,
} from "../services/iap";

const isNative = !!(window.Capacitor?.isNativePlatform?.());
const platform = window.Capacitor?.getPlatform?.() ?? "web";

// ─── Native IAP panel (Android & iOS) ────────────────────────────────────────

function NativeUpgradePanel({ isPro, planExpiry, onProGranted }) {
  const [offering, setOffering] = useState(null);
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [purchasing, setPurchasing] = useState(null); // packageId being purchased
  const [restoring, setRestoring] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const storeName = platform === "ios" ? "App Store" : "Google Play";

  useEffect(() => {
    getOfferings()
      .then(setOffering)
      .catch((e) => console.warn("[IAP] offering load failed:", e))
      .finally(() => setLoadingOffering(false));
  }, []);

  const handlePurchase = async (pkg) => {
    setMsg("");
    setIsError(false);
    setPurchasing(pkg.identifier);
    try {
      const customerInfo = await purchasePackage(pkg);
      if (hasProEntitlement(customerInfo)) {
        setMsg("Payment successful! Pro is now active.");
        onProGranted?.();
      } else {
        setMsg("Purchase recorded — your Pro access will activate shortly.");
      }
    } catch (e) {
      // User cancelled = not an error worth showing
      if (e?.message?.toLowerCase().includes("cancel")) {
        setMsg("");
      } else {
        setIsError(true);
        setMsg(e.message || "Purchase failed. Please try again.");
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setMsg("");
    setIsError(false);
    setRestoring(true);
    try {
      const customerInfo = await restorePurchases();
      if (hasProEntitlement(customerInfo)) {
        setMsg("Pro restored successfully!");
        onProGranted?.();
      } else {
        setMsg("No active Pro subscription found on this account.");
        setIsError(true);
      }
    } catch (e) {
      setIsError(true);
      setMsg(e.message || "Restore failed.");
    } finally {
      setRestoring(false);
    }
  };

  const expiryStr = planExpiry
    ? new Date(planExpiry).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      <div className="panel-title">Upgrade to Pro</div>
      <div className="panel-sub">Unlock unlimited access to all LifeHub features.</div>

      {/* Current plan status */}
      <div style={{
        padding: "16px 20px", marginBottom: 24,
        background: isPro ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isPro ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Current plan</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: isPro ? "#4ade80" : "#fff" }}>
            {isPro ? "⚡ Pro" : "Free"}
          </div>
          {isPro && expiryStr && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Renews · {expiryStr}</div>
          )}
          {!isPro && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Subs ≤5 · Warranties ≤3 · Skills ≤5</div>
          )}
        </div>
        {isPro && <div style={{ fontSize: 28 }}>✅</div>}
      </div>

      {isPro ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          You're on the Pro plan — all features are unlocked. 🎉
        </div>
      ) : (
        <>
          {loadingOffering ? (
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
              Loading plans…
            </div>
          ) : !offering ? (
            <div style={{ color: "#f87171", fontSize: 13, padding: "24px 0", textAlign: "center" }}>
              Could not load plans. Check your connection and try again.
            </div>
          ) : (
            <div className="plan-grid">
              {offering.availablePackages.map((pkg) => {
                const isYearly = pkg.identifier.includes("annual") || pkg.packageType === "ANNUAL";
                const isBuying = purchasing === pkg.identifier;
                return (
                  <div key={pkg.identifier} className={`plan-card${isYearly ? " featured" : ""}`}>
                    {isYearly && <div className="plan-best">BEST VALUE</div>}
                    <div className="plan-name" style={{ marginTop: isYearly ? 8 : 0 }}>
                      {isYearly ? "Yearly" : "Monthly"}
                    </div>
                    <div className="plan-price">
                      {pkg.product.priceString}
                      <span>{isYearly ? " / yr" : " / mo"}</span>
                    </div>
                    {isYearly && (
                      <div className="plan-save">Save ~17% vs monthly</div>
                    )}
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={!!purchasing || restoring}
                      style={{
                        marginTop: 12, padding: "10px 16px",
                        background: "linear-gradient(135deg, #2979ff, #4f8ef7)",
                        border: "none", borderRadius: 8,
                        color: "#fff", fontSize: 13, fontWeight: 600,
                        cursor: purchasing || restoring ? "not-allowed" : "pointer",
                        opacity: purchasing && !isBuying ? 0.5 : 1,
                        width: "100%",
                      }}
                    >
                      {isBuying ? "Processing…" : `Subscribe via ${storeName}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {msg && (
            <p style={{ color: isError ? "#f87171" : "#4ade80", fontSize: 13, marginTop: 12, textAlign: "center" }}>
              {msg}
            </p>
          )}

          <button
            onClick={handleRestore}
            disabled={restoring || !!purchasing}
            style={{
              marginTop: 20, background: "none", border: "none",
              color: "rgba(255,255,255,0.35)", fontSize: 12,
              cursor: restoring ? "not-allowed" : "pointer",
              textDecoration: "underline", width: "100%",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {restoring ? "Restoring…" : "Restore previous purchase"}
          </button>

          <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6 }}>
            Subscriptions auto-renew until cancelled.{"\n"}
            Managed in your {storeName} account settings.
          </div>
        </>
      )}
    </>
  );
}

// ─── Web payment panel (PWA — Gumroad + Crypto) ───────────────────────────────

function WebUpgradePanel({ authContext }) {
  const { user, apiBaseUrl, isPro, planExpiry } = authContext;
  const [network, setNetwork] = useState("SOL");
  const [plan, setPlan] = useState("monthly");
  const [txHash, setTxHash] = useState("");
  const [msg, setMsg] = useState("");

  const verify = async () => {
    setMsg("");
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/monetisation/crypto/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ network, txHash, plan }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || "Verification failed");
      setMsg("✓ Payment verified! Your Pro plan is now active.");
    } catch (e) {
      setMsg(e.message);
    }
  };

  const cp = (btn, addr) => {
    navigator.clipboard.writeText(addr).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = orig), 1500);
    });
  };

  const expiryStr = planExpiry
    ? new Date(planExpiry).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <>
      <div className="panel-title">Upgrade to Pro</div>
      <div className="panel-sub">Unlock unlimited access to all LifeHub features.</div>

      <div style={{
        padding: "16px 20px", marginBottom: 24,
        background: isPro ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${isPro ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Current plan</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: isPro ? "#4ade80" : "#fff" }}>
            {isPro ? "⚡ Pro" : "Free"}
          </div>
          {isPro && expiryStr && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Renews · {expiryStr}</div>
          )}
          {!isPro && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Subs ≤5 · Warranties ≤3 · Skills ≤5</div>
          )}
        </div>
        {isPro && <div style={{ fontSize: 28 }}>✅</div>}
      </div>

      {!isPro && (
        <>
          <div className="plan-grid">
            <div className="plan-card">
              <div className="plan-name">Monthly</div>
              <div className="plan-price">$6.99 <span>/ mo</span></div>
              <a href="https://siamtpaite.gumroad.com/l/pmlxwh" target="_blank" rel="noreferrer">Buy on Gumroad</a>
            </div>
            <div className="plan-card featured">
              <div className="plan-best">BEST VALUE</div>
              <div className="plan-name" style={{ marginTop: 8 }}>Yearly</div>
              <div className="plan-price">$69.99 <span>/ yr</span></div>
              <div className="plan-save">Save ~$14 vs monthly</div>
              <a href="https://siamtpaite.gumroad.com/l/ievmvi" target="_blank" rel="noreferrer">Buy on Gumroad</a>
            </div>
          </div>

          <div className="section-label">Pay with crypto</div>
          <div className="addr-row"><div className="addr-net">SOL</div><div className="addr-val">A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3</div><button className="copy-btn" onClick={e => cp(e.target, "A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3")}>Copy</button></div>
          <div className="addr-row"><div className="addr-net">BASE</div><div className="addr-val">0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8</div><button className="copy-btn" onClick={e => cp(e.target, "0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8")}>Copy</button></div>
          <div className="addr-row"><div className="addr-net">TRON</div><div className="addr-val">TXE8UZejabi93ks73VzsgeBqXM4C3fEydX</div><button className="copy-btn" onClick={e => cp(e.target, "TXE8UZejabi93ks73VzsgeBqXM4C3fEydX")}>Copy</button></div>

          <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 10, flexWrap: "wrap" }}>
            <select value={plan} onChange={e => setPlan(e.target.value)} style={{ flex: 1 }}><option value="monthly">monthly</option><option value="yearly">yearly</option></select>
            <select value={network} onChange={e => setNetwork(e.target.value)} style={{ flex: 1 }}><option>SOL</option><option>BASE</option><option>TRON</option></select>
            <input value={txHash} placeholder="Transaction hash" onChange={e => setTxHash(e.target.value)} style={{ flex: 2 }} />
          </div>
          <button className="btn btn-light" style={{ width: "100%" }} onClick={verify}>Verify Crypto Payment</button>
          {msg && <p style={{ color: "#4ade80", fontSize: 13, marginTop: 8 }}>{msg}</p>}
        </>
      )}

      {isPro && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          You're on the Pro plan — all features are unlocked. 🎉<br />
          <a href="mailto:siam_t_paite@lifehub.fit" style={{ color: "#4f8ef7", marginTop: 8, display: "inline-block" }}>Contact support</a>
        </div>
      )}
    </>
  );
}

// ─── Root export — routes to the right panel ─────────────────────────────────

export default function Monetisation({ authContext }) {
  const { isPro, planExpiry, onProGranted } = authContext;

  if (isNative) {
    return (
      <NativeUpgradePanel
        isPro={isPro}
        planExpiry={planExpiry}
        onProGranted={() => {
          // Set rcProOverride in App.js so Pro panels unlock immediately.
          // Firestore will confirm via RevenueCat webhook + onSnapshot within seconds.
          onProGranted?.();
        }}
      />
    );
  }

  return <WebUpgradePanel authContext={authContext} />;
}
