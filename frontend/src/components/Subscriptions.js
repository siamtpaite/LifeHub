import React, { useEffect, useState } from "react";

export default function Subscriptions({ authContext, currency="INR", formOpen, setFormOpen }) {
  const { user, apiBaseUrl } = authContext;
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fmt = v => new Intl.NumberFormat(undefined,{style:"currency",currency}).format(Number(v||0));

  const load = async () => {
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/subscriptions`,{headers:{Authorization:`Bearer ${t}`}});
      if (!r.ok) throw new Error("Failed to load");
      setItems(await r.json());
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!name||!renewalDate) return;
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/subscriptions`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({name,cost,renewalDate}),
      });
      if (!r.ok) { const d=await r.json(); throw new Error(d.message); }
      setName(""); setCost(""); setRenewalDate("");
      setFormOpen(false); load();
    } catch(e){ setError(e.message); }
  };

  const total = items.reduce((a,s)=>a+Number(s.cost||0),0);
  const sc = {"Active":"b-green","Expiring soon":"b-amber","Expired":"b-red"};
  const getStatus = item => {
    const diff=(new Date(item.renewalDate)-Date.now())/(1000*60*60*24);
    return diff<0?"Expired":diff<30?"Expiring soon":"Active";
  };

  return (
    <>
      <div className="panel-title">Subscriptions</div>
      <div className="panel-sub">Track every recurring charge. Never get surprised by a renewal again.</div>

      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Monthly total</div><div className="stat-chip-val accent">{fmt(total)}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Active</div><div className="stat-chip-val">{items.length}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Annual</div><div className="stat-chip-val">{fmt(total*12)}</div></div>
      </div>

      <div className={`form-card ${formOpen?"open":""}`}>
        <div className="form-row">
          <div className="f-field"><div className="f-label">Service</div><input value={name} placeholder="Netflix, Spotify…" onChange={e=>setName(e.target.value)}/></div>
          <div className="f-field"><div className="f-label">Cost / mo</div><input type="number" step="0.01" value={cost} placeholder="9.99" onChange={e=>setCost(e.target.value)}/></div>
          <div className="f-field"><div className="f-label">Renewal date</div><input type="date" value={renewalDate} onChange={e=>setRenewalDate(e.target.value)}/></div>
        </div>
        <div className="btn-row">
          <button className="btn btn-light" onClick={save}>Save</button>
          <button className="btn btn-ghost" onClick={()=>setFormOpen(false)}>Cancel</button>
        </div>
      </div>

      <button className="add-btn" onClick={()=>setFormOpen(f=>!f)}>+ Add subscription</button>

      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        {loading ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p> :
        items.length===0 ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>No subscriptions yet. Add your first one above.</p> :
        <table className="data-table">
          <thead><tr><th>Service</th><th>Cost</th><th>Renewal</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item=>{
              const status=getStatus(item);
              return <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{fmt(item.cost)}/mo</td>
                <td>{item.renewalDate}</td>
                <td><span className={`badge ${sc[status]||"b-gray"}`}>{status}</span></td>
              </tr>;
            })}
          </tbody>
        </table>}
      </div>
    </>
  );
}
