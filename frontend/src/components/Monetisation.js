import React, { useState } from "react";

export default function Monetisation({ authContext }) {
  const { user, apiBaseUrl, isPro, planExpiry } = authContext;
  const [network, setNetwork] = useState("SOL");
  const [plan, setPlan] = useState("monthly");
  const [txHash, setTxHash] = useState("");
  const [msg, setMsg] = useState("");

  const verify = async () => {
    setMsg("");
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/monetisation/crypto/verify`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({network,txHash,plan}),
      });
      const d=await r.json();
      if(!r.ok||!d.success) throw new Error(d.message||"Verification failed");
      setMsg(`✓ Payment verified! Your Pro plan is now active.`);
    } catch(e){ setMsg(e.message); }
  };

  const cp = (btn, addr) => {
    navigator.clipboard.writeText(addr).then(()=>{
      const orig=btn.textContent; btn.textContent="Copied!";
      setTimeout(()=>btn.textContent=orig,1500);
    });
  };

  const expiryStr = planExpiry ? new Date(planExpiry).toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" }) : null;

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
        {isPro && (
          <div style={{ fontSize: 28 }}>✅</div>
        )}
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
              <div className="plan-name" style={{marginTop:8}}>Yearly</div>
              <div className="plan-price">$69.99 <span>/ yr</span></div>
              <div className="plan-save">Save ~$14 vs monthly</div>
              <a href="https://siamtpaite.gumroad.com/l/ievmvi" target="_blank" rel="noreferrer">Buy on Gumroad</a>
            </div>
          </div>

          <div className="section-label">Pay with crypto</div>
          <div className="addr-row"><div className="addr-net">SOL</div><div className="addr-val">A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3</div><button className="copy-btn" onClick={e=>cp(e.target,"A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3")}>Copy</button></div>
          <div className="addr-row"><div className="addr-net">BASE</div><div className="addr-val">0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8</div><button className="copy-btn" onClick={e=>cp(e.target,"0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8")}>Copy</button></div>
          <div className="addr-row"><div className="addr-net">TRON</div><div className="addr-val">TXE8UZejabi93ks73VzsgeBqXM4C3fEydX</div><button className="copy-btn" onClick={e=>cp(e.target,"TXE8UZejabi93ks73VzsgeBqXM4C3fEydX")}>Copy</button></div>

          <div style={{display:"flex",gap:8,marginTop:12,marginBottom:10,flexWrap:"wrap"}}>
            <select value={plan} onChange={e=>setPlan(e.target.value)} style={{flex:1}}><option value="monthly">monthly</option><option value="yearly">yearly</option></select>
            <select value={network} onChange={e=>setNetwork(e.target.value)} style={{flex:1}}><option>SOL</option><option>BASE</option><option>TRON</option></select>
            <input value={txHash} placeholder="Transaction hash" onChange={e=>setTxHash(e.target.value)} style={{flex:2}}/>
          </div>
          <button className="btn btn-light" style={{width:"100%"}} onClick={verify}>Verify Crypto Payment</button>
          {msg && <p style={{color:"#4ade80",fontSize:13,marginTop:8}}>{msg}</p>}
        </>
      )}

      {isPro && (
        <div style={{ textAlign:"center", padding:"32px 0", color:"rgba(255,255,255,0.3)", fontSize:13 }}>
          You're on the Pro plan — all features are unlocked. 🎉<br/>
          <a href="mailto:siam_t_paite@lifehub.fit" style={{ color:"#4f8ef7", marginTop:8, display:"inline-block" }}>Contact support</a>
        </div>
      )}
    </>
  );
}
