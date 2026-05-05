// ── SAVINGS ──────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";

export function Savings({ authContext, currency="INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [savings, setSavings] = useState(null);
  const fmt = v => new Intl.NumberFormat(undefined,{style:"currency",currency}).format(Number(v||0));

  useEffect(()=>{
    (async()=>{
      try {
        const t=await user.getIdToken();
        const r=await fetch(`${apiBaseUrl}/api/savings`,{headers:{Authorization:`Bearer ${t}`}});
        if(r.ok) setSavings(await r.json());
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  if(!savings) return <><div className="panel-title">Savings</div><p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p></>;

  return (
    <>
      <div className="panel-title">Savings</div>
      <div className="panel-sub">See exactly how much LifeHub has saved you across subscriptions, warranties and skills.</div>
      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Sub savings</div><div className="stat-chip-val accent">{fmt(savings.subscriptionSavings)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Warranty</div><div className="stat-chip-val accent">{fmt(savings.warrantySavings)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Skills</div><div className="stat-chip-val accent">{fmt(savings.skillSavings)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Total</div><div className="stat-chip-val accent" style={{fontSize:26}}>{fmt(savings.total)}</div></div>
      </div>
      <div className="alert alert-amber" style={{marginBottom:20}}>Flag unused subscriptions and completed skill exchanges to unlock real savings numbers.</div>
      <div className="section-label">Achievements</div>
      <div className="sav-badge"><div className="sav-badge-icon" style={{opacity:savings.total>50?1:.35}}>🏅</div><div><div className="sav-badge-name">Top Saver</div><div className="sav-badge-desc">Save over ₹50 total</div></div></div>
      <div className="sav-badge"><div className="sav-badge-icon" style={{opacity:savings.skillSavings>0?1:.35}}>🤝</div><div><div className="sav-badge-name">Skill Trader</div><div className="sav-badge-desc">Exchange any skill</div></div></div>
      <div className="sav-badge"><div className="sav-badge-icon" style={{opacity:savings.warrantySavings>0?1:.35}}>🛡</div><div><div className="sav-badge-name">Recall Guardian</div><div className="sav-badge-desc">Catch a recall on your product</div></div></div>
    </>
  );
}

export default Savings;
