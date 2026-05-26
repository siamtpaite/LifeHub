import React, { useEffect, useState } from "react";

const FREE_LIMIT = 5;

export default function Skills({ authContext, formOpen, setFormOpen }) {
  const { user, apiBaseUrl, isPro } = authContext;
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

  const mySkills = items.filter(s => s.ownerName === user.email || s.userId === user.uid);
  const atLimit = !isPro && mySkills.length >= FREE_LIMIT;

  const handleAddClick = () => {
    if (atLimit) {
      setError(`Free plan is limited to ${FREE_LIMIT} skills. Upgrade to Pro for unlimited.`);
      return;
    }
    setError("");
    setFormOpen(f => !f);
  };

  const offer = async () => {
    if (!skillName) return;
    if (atLimit) { setError(`Free plan limit of ${FREE_LIMIT} reached.`); return; }
    try {
      const t = await user.getIdToken();
      await fetch(`${apiBaseUrl}/api/skills/offer`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({skillName,description}),
      });
      setSkillName(""); setDescription(""); setFormOpen(false); load();
    } catch(e){ setError(e.message); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      load();
    } catch (e) { setError(e.message); }
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

      {!isPro && (
        <div style={{ fontSize:11, color: atLimit ? "#f87171" : "rgba(255,255,255,0.3)", marginBottom:8 }}>
          {mySkills.length}/{FREE_LIMIT} skills offered on free plan
          {atLimit && <a href="/docs.html#upgrade" target="_blank" rel="noreferrer" style={{ color:"#4f8ef7", marginLeft:8 }}>Upgrade to Pro →</a>}
        </div>
      )}

      <div className={`form-card ${formOpen && !atLimit ? "open" : ""}`}>
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

      <button className="add-btn" onClick={handleAddClick} style={{ opacity: atLimit ? 0.5 : 1 }}>+ Offer a skill</button>

      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input value={exchangeId} placeholder="Skill ID to exchange" onChange={e=>setExchangeId(e.target.value)} style={{flex:1}}/>
        <button className="btn btn-ghost" style={{flexShrink:0}} onClick={exchange}>Exchange (-1 cr)</button>
      </div>

      {error && <p style={{color:"#f87171",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        <table className="data-table">
          <thead><tr><th>Skill</th><th>Offered by</th><th>Credits</th><th>ID</th><th></th></tr></thead>
          <tbody>
            {items.map(s=>{
              const isMine = s.userId === user.uid || s.ownerName === user.email;
              return (
                <tr key={s.id}>
                  <td><strong>{s.skillName}</strong><div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{s.description}</div></td>
                  <td>{(s.ownerName||"").split("@")[0]}</td>
                  <td><span className={`badge ${s.credits>2?"b-green":s.credits>0?"b-amber":"b-red"}`}>{s.credits} cr</span></td>
                  <td style={{fontFamily:"monospace",fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.id}</td>
                  <td style={{textAlign:"right"}}>
                    {isMine && (
                      <button
                        onClick={()=>deleteItem(s.id)}
                        style={{background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:12,padding:"4px 8px"}}
                        aria-label={`Delete ${s.skillName}`}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
