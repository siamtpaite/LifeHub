import React, { useEffect, useState } from "react";

export default function Analytics({ authContext, currency="INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [data, setData] = useState(null);
  const fmt = v => new Intl.NumberFormat(undefined,{style:"currency",currency}).format(Number(v||0));

  useEffect(()=>{
    (async()=>{
      try {
        const t=await user.getIdToken();
        const r=await fetch(`${apiBaseUrl}/api/analytics`,{headers:{Authorization:`Bearer ${t}`}});
        if(r.ok) setData(await r.json());
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  if(!data) return <><div className="panel-title">Analytics</div><p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p></>;

  const skills = data.topSkills||[];
  const maxCr = Math.max(...skills.map((_,i)=>3-i),1);

  return (
    <>
      <div className="panel-title">Analytics</div>
      <div className="panel-sub">Aggregated insights across all your LifeHub data.</div>
      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Avg sub cost</div><div className="stat-chip-val accent">{fmt(data.avgSubscriptionCost)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Claims</div><div className="stat-chip-val" style={{color:"#fbbf24"}}>{data.warrantyClaims||0}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Recall alerts</div><div className="stat-chip-val" style={{color:"#f87171"}}>{data.recallAlerts||0}</div></div>
      </div>
      <div className="section-label">Top skills</div>
      {skills.length===0 ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:16}}>No skills yet.</p> :
        skills.map((s,i)=>(
          <div className="bar-row" key={i}>
            <div className="bar-label">{s}</div>
            <div className="bar-track"><div className="bar-fill" style={{width:`${((3-i)/maxCr)*100}%`,background:"#a78bfa"}}/></div>
            <div className="bar-val">{3-i}cr</div>
          </div>
        ))
      }
    </>
  );
}
