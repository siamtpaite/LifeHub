import React, { useEffect, useState } from "react";

export default function Recalls({ authContext, formOpen, setFormOpen }) {
  const { user, apiBaseUrl } = authContext;
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("High");
  const [recalls, setRecalls] = useState({});
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/recalls`,{headers:{Authorization:`Bearer ${t}`}});
      if(r.ok) setRecalls(await r.json());
    } catch(e){ setError(e.message); }
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!productName||!description) return;
    try {
      const t=await user.getIdToken();
      await fetch(`${apiBaseUrl}/api/recalls`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({productName,description,severity}),
      });
      setProductName(""); setDescription(""); setSeverity("High");
      setFormOpen(false); load();
    } catch(e){ setError(e.message); }
  };

  const sc = {High:"b-red",Medium:"b-amber",Low:"b-blue"};

  return (
    <>
      <div className="panel-title">Recalls</div>
      <div className="panel-sub">Community-reported product safety issues. Add reports and browse what others have flagged.</div>

      <div className={`form-card ${formOpen?"open":""}`}>
        <div className="form-row">
          <div className="f-field"><div className="f-label">Product</div><input value={productName} placeholder="Brand + model" onChange={e=>setProductName(e.target.value)}/></div>
          <div className="f-field"><div className="f-label">Severity</div><select value={severity} onChange={e=>setSeverity(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></div>
        </div>
        <div className="form-row"><div className="f-field"><div className="f-label">Description</div><input value={description} placeholder="Describe the issue" onChange={e=>setDescription(e.target.value)}/></div></div>
        <div className="btn-row">
          <button className="btn btn-light" onClick={save}>Submit</button>
          <button className="btn btn-ghost" onClick={()=>setFormOpen(false)}>Cancel</button>
        </div>
      </div>

      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        {Object.keys(recalls).length===0
          ? <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>No recalls reported yet.</p>
          : Object.entries(recalls).map(([prod,items])=>(
            <div className="recall-group" key={prod}>
              <div className="recall-group-head">
                {prod}
                <span className={`badge ${sc[items[0]?.severity]||"b-gray"}`}>{items[0]?.severity}</span>
                <span className="badge b-gray">{items.length} report{items.length>1?"s":""}</span>
              </div>
              {items.map((r,i)=>(
                <div className="recall-item" key={r.id||i}>
                  <div className="recall-desc">{r.description}</div>
                  <span className={`badge ${sc[r.severity]||"b-gray"}`}>{r.severity}</span>
                  <div className="recall-ts">{new Date(r.reportedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
    </>
  );
}
