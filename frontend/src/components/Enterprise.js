import React, { useEffect, useState } from "react";

export default function Enterprise({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [data, setData] = useState(null);

  useEffect(()=>{
    (async()=>{
      try {
        const t=await user.getIdToken();
        const r=await fetch(`${apiBaseUrl}/api/enterprise`,{headers:{Authorization:`Bearer ${t}`}});
        if(r.ok) setData(await r.json());
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  if(!data) return <><div className="panel-title">Enterprise</div><p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p></>;

  const churn = [
    {m:"January",v:1.8,c:"#818cf8"},{m:"February",v:2.5,c:"#818cf8"},
    {m:"March",v:3.2,c:"#f87171"},{m:"April",v:2.8,c:"#fbbf24"},
    {m:"May",v:2.1,c:"#4ade80"},
  ];

  return (
    <>
      <div className="panel-title">Enterprise</div>
      <div className="panel-sub">SaaS metrics across all tenants — churn, claim times, top failing products.</div>
      <div className="alert alert-red">This endpoint reads all users' data. Gate with enterprise_admin claim before production.</div>
      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Churn rate</div><div className="stat-chip-val" style={{color:"#f87171"}}>{(Number(data.subscriptionChurnRate||0)*100).toFixed(2)}%</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Avg claim</div><div className="stat-chip-val">{Math.round(Number(data.avgWarrantyClaimTime||0)/(1000*60*60*24))}d</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Recall impact</div><div className="stat-chip-val" style={{color:"#fbbf24"}}>{data.recallImpact||0}</div></div>
      </div>
      <div className="section-label">Monthly churn</div>
      {churn.map(c=>(
        <div className="bar-row" key={c.m}>
          <div className="bar-label">{c.m}</div>
          <div className="bar-track"><div className="bar-fill" style={{width:`${c.v/4*100}%`,background:c.c}}/></div>
          <div className="bar-val">{c.v}%</div>
        </div>
      ))}
    </>
  );
}
