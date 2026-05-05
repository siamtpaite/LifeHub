import React, { useEffect, useState } from "react";

export default function Skills({ authContext, formOpen, setFormOpen }) {
  const { user, apiBaseUrl } = authContext;
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [exchangeId, setExchangeId] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/skills`,{headers:{Authorization:`Bearer ${t}`}});
      if (!r.ok) throw new Error("Failed to load");
      setItems(await r.json());
    } catch(e){ setError(e.message); }
  };

  useEffect(()=>{ load(); const id=setInterval(load,15000); return ()=>clearInterval(id); },[]);

  const offer = async () => {
    if (!skillName) return;
    try {
      const t = await user.getIdToken();
      await fetch(`${apiBaseUrl}/api/skills/offer`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({skillName,description}),
      });
      setSkillName(""); setDescription(""); setFormOpen(false); load();
    } catch(e){ setError(e.message); }
  };

  const exchange = async () => {
    if (!exchangeId) return;
    try {
      const t = await user.getIdToken();
      await fetch(`${apiBaseUrl}/api/skills/exchange`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({skillId:exchangeId}),
      });
      setExchangeId(""); load();
    } catch(e){ setError(e.message); }
  };

  return (
    <>
      <div className="panel-title">Skills</div>
      <div className="panel-sub">Offer your expertise and exchange skills with the community using credits.</div>

      <div className={`form-card ${formOpen?"open":""}`}>
        <div className="form-row">
          <div className="f-field"><div className="f-label">Skill name</div><input value={skillName} placeholder="UI Design, Python tutoring…" onChange={e=>setSkillName(e.target.value)}/></div>
        </div>
        <div className="form-row">
          <div className="f-field"><div className="f-label">Description</div><textarea value={description} placeholder="What you offer, availability…" onChange={e=>setDescription(e.target.value)}/></div>
        </div>
        <div className="btn-row">
          <button className="btn btn-light" onClick={offer}>Offer (+1 credit)</button>
          <button className="btn btn-ghost" onClick={()=>setFormOpen(false)}>Cancel</button>
        </div>
      </div>

      <button className="add-btn" onClick={()=>setFormOpen(f=>!f)}>+ Offer a skill</button>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input value={exchangeId} placeholder="Skill ID to exchange" onChange={e=>setExchangeId(e.target.value)} style={{flex:1}}/>
        <button className="btn btn-ghost" style={{flexShrink:0}} onClick={exchange}>Exchange (-1 cr)</button>
      </div>

      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        <table className="data-table">
          <thead><tr><th>Skill</th><th>Offered by</th><th>Credits</th><th>ID</th></tr></thead>
          <tbody>
            {items.map(s=>(
              <tr key={s.id}>
                <td><strong>{s.skillName}</strong><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{s.description}</div></td>
                <td>{(s.ownerName||"").split("@")[0]}</td>
                <td><span className={`badge ${s.credits>2?"b-green":s.credits>0?"b-amber":"b-red"}`}>{s.credits} cr</span></td>
                <td style={{fontFamily:"monospace",fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
