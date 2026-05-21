import React, { useEffect, useState } from "react";

function DonutChart({ segments, size = 120 }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  let cumulative = 0;
  const radius = 45;
  const cx = 60, cy = 60;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="18"/>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const offset = circumference * (1 - cumulative);
        const dash = circumference * pct;
        cumulative += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
            stroke={seg.color} strokeWidth="18"
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transform:"rotate(-90deg)", transformOrigin:"60px 60px" }}
          />
        );
      })}
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.4)" fontFamily="Inter,sans-serif">MONTHLY</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff" fontFamily="Inter,sans-serif">
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

export default function Analytics({ authContext, currency="INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [data, setData] = useState(null);
  const [subs, setSubs] = useState([]);
  const fmt = v => new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:0}).format(Number(v||0));
  const COLORS = ["#4ade80","#60a5fa","#a78bfa","#fbbf24","#f472b6","#34d399","#fb923c"];

  useEffect(()=>{
    (async()=>{
      try {
        const t = await user.getIdToken();
        const h = { Authorization:`Bearer ${t}` };
        const [an, su] = await Promise.allSettled([
          fetch(`${apiBaseUrl}/api/analytics`,{headers:h}).then(r=>r.json()),
          fetch(`${apiBaseUrl}/api/subscriptions`,{headers:h}).then(r=>r.json()),
        ]);
        if(an.status==="fulfilled") setData(an.value);
        if(su.status==="fulfilled") setSubs(su.value);
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  if(!data) return <><div className="panel-title">Analytics</div><p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p></>;

  const skills = data.topSkills||[];
  const subTotal = subs.reduce((a,s)=>a+Number(s.cost||0),0);
  const maxCost = Math.max(...subs.map(s=>Number(s.cost||0)),1);
  const donut = subs.slice(0,6).map((s,i)=>({ label:s.name, value:Number(s.cost||0), color:COLORS[i%COLORS.length] }));

  return (
    <>
      <div className="panel-title">Analytics</div>
      <div className="panel-sub">Aggregated insights across all your LifeHub data.</div>

      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Avg sub cost</div><div className="stat-chip-val accent">{fmt(data.avgSubscriptionCost)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Claims</div><div className="stat-chip-val" style={{color:"#fbbf24"}}>{data.warrantyClaims||0}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Recalls</div><div className="stat-chip-val" style={{color:"#f87171"}}>{data.recallAlerts||0}</div></div>
      </div>

      {subs.length>0 && (
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:20}}>
          <DonutChart segments={donut} size={120}/>
          <div style={{flex:1}}>
            {donut.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                <span style={{fontSize:12,color:"rgba(255,255,255,.6)",flex:1}}>{s.label}</span>
                <span style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{fmt(s.value)}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:6,marginTop:6,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Monthly total</span>
              <span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{fmt(subTotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="section-label" style={{marginBottom:10}}>Subscription spend</div>
      {subs.map((s,i)=>(
        <div key={s.id||i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
          <div style={{width:80,fontSize:12,color:"rgba(255,255,255,.55)",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
          <div style={{flex:1,height:5,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:`${(Number(s.cost)||0)/maxCost*100}%`,background:COLORS[i%COLORS.length],transition:"width .6s"}}/>
          </div>
          <div style={{width:55,fontSize:12,color:"rgba(255,255,255,.4)",textAlign:"right",flexShrink:0}}>{fmt(s.cost)}</div>
        </div>
      ))}

      {skills.length>0 && (
        <>
          <div className="section-label" style={{marginBottom:10,marginTop:16}}>Top skills</div>
          {skills.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
              <div style={{width:80,fontSize:12,color:"rgba(255,255,255,.55)",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s}</div>
              <div style={{flex:1,height:5,background:"rgba(255,255,255,.08)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,width:`${((skills.length-i)/skills.length)*100}%`,background:"#a78bfa",transition:"width .6s"}}/>
              </div>
              <div style={{width:55,fontSize:12,color:"rgba(255,255,255,.4)",textAlign:"right",flexShrink:0}}>{skills.length-i}cr</div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
