import React, { useEffect, useState } from "react";

export default function Predictions({ authContext, currency="INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [data, setData] = useState(null);
  const fmt = v => new Intl.NumberFormat(undefined,{style:"currency",currency}).format(Number(v||0));

  useEffect(()=>{
    (async()=>{
      try {
        const t=await user.getIdToken();
        const r=await fetch(`${apiBaseUrl}/api/predictions`,{headers:{Authorization:`Bearer ${t}`}});
        if(r.ok) setData(await r.json());
      } catch(e){}
    })();
  },[apiBaseUrl,user]);

  if(!data) return <><div className="panel-title">Predictions</div><p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p></>;

  const riskColor = s => s==="High"?"b-red":s==="Medium"?"b-amber":"b-green";
  const riskLabel = score => score>4?"High":score>1?"Medium":"Safe";

  return (
    <>
      <div className="panel-title">Predictions</div>
      <div className="panel-sub">AI-powered failure trends and resale value forecasts for your products.</div>

      <div className="section-label">Risk trends</div>
      <table className="data-table" style={{marginBottom:20}}>
        <thead><tr><th>Product</th><th>Risk</th><th>Failures</th><th>Recalls</th></tr></thead>
        <tbody>
          {(data.trends||[]).map((t,i)=>(
            <tr key={i}>
              <td><strong>{t.product}</strong></td>
              <td><span className={`badge ${riskColor(riskLabel(t.riskScore))}`}>{riskLabel(t.riskScore)}</span></td>
              <td>{t.failures}</td>
              <td>{t.recalls}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-label">Resale forecasts</div>
      {(data.resalePredictions||[]).map((p,i)=>(
        <div className="pred-card" key={i}>
          <div>
            <div className="pred-name">{p.product}</div>
            <div className="pred-meta">~{Number(p.monthsOwned||0).toFixed(1)} months owned · {p.recommendation}</div>
          </div>
          <div>
            <div className="pred-val" style={{color:"#f472b6"}}>{fmt(p.predictedResaleValue)}</div>
            <div className="pred-rec">predicted resale</div>
          </div>
        </div>
      ))}
    </>
  );
}
