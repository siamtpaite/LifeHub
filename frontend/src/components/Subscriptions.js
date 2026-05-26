import React, { useEffect, useState } from "react";

const FREE_LIMIT = 5;

export default function Subscriptions({ authContext, currency="INR", formOpen, setFormOpen }) {
  const { user, apiBaseUrl, isPro } = authContext;
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

  const atLimit = !isPro && items.length >= FREE_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      setError(`Free plan is limited to ${FREE_LIMIT} subscriptions. Upgrade to Pro for unlimited.`);
      return;
    }
    setError("");
    setFormOpen(f => !f);
  };

  const save = async () => {
    if (!name||!renewalDate) return;
    if (atLimit) { setError(`Free plan limit of ${FREE_LIMIT} reached.`); return; }
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

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/subscriptions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      load();
    } catch (e) { setError(e.message); }
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

      {!isPro && (
        <div style={{ fontSize:11, color: atLimit ? "#f87171" : "rgba(255,255,255,0.3)", marginBottom:8 }}>
          {items.length}/{FREE_LIMIT} used on free plan
          {atLimit && <a href="/docs.html#upgrade" target="_blank" rel="noreferrer" style={{ color:"#4f8ef7", marginLeft:8 }}>Upgrade to Pro →</a>}
        </div>
      )}

      <div className={`form-card ${formOpen&&!atLimit?"open":""}`}>
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

      <button className="add-btn" onClick={handleAddClick} style={{ opacity: atLimit ? 0.5 : 1 }}>
        + Add subscription
      </button>

      {error && <p style={{color:"#f87171",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        {loading ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Loading…</p> :
        items.length===0 ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>No subscriptions yet. Add your first one above.</p> :
        <table className="data-table">
          <thead><tr><th>Service</th><th>Cost</th><th>Renewal</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map(item=>{
              const status=getStatus(item);
              return <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td>{fmt(item.cost)}/mo</td>
                <td>{item.renewalDate}</td>
                <td><span className={`badge ${sc[status]||"b-gray"}`}>{status}</span></td>
                <td style={{textAlign:"right"}}>
                  <button
                    onClick={()=>deleteItem(item.id)}
                    style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:12,padding:"4px 8px"}}
                    aria-label={`Delete ${item.name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>;
            })}
          </tbody>
        </table>}
      </div>
    </>
  );
}
