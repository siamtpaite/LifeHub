import React, { useEffect, useState } from "react";

export default function Tenants({ authContext, formOpen, setFormOpen }) {
  const { user, apiBaseUrl } = authContext;
  const [name, setName] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/tenants`,{headers:{Authorization:`Bearer ${t}`}});
      if(r.ok) setTenants(await r.json());
    } catch(e){ setError(e.message); }
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/tenants`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({name,adminUser}),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.message);
      setName(""); setAdminUser(""); setFormOpen(false); load();
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <>
      <div className="panel-title">Tenants</div>
      <div className="panel-sub">Create organisations, assign roles, and manage multi-tenant access control.</div>

      <div className={`form-card ${formOpen?"open":""}`}>
        <div className="form-row">
          <div className="f-field"><div className="f-label">Organisation name</div><input value={name} placeholder="Acme Corp" onChange={e=>setName(e.target.value)}/></div>
          <div className="f-field"><div className="f-label">Admin user ID</div><input value={adminUser} placeholder="optional" onChange={e=>setAdminUser(e.target.value)}/></div>
        </div>
        <div className="btn-row">
          <button className="btn btn-light" onClick={save} disabled={loading}>{loading?"Creating…":"Create"}</button>
          <button className="btn btn-ghost" onClick={()=>setFormOpen(false)}>Cancel</button>
        </div>
      </div>

      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="data-wrap">
        {tenants.map(t=>(
          <div className="tenant-card" key={t.id}>
            <div>
              <div className="tenant-name">{t.name}</div>
              <div className="tenant-id">{t.id}</div>
              <div className="tenant-roles">
                {Object.entries(t.roles||{}).map(([role,users])=>(
                  <span className="badge b-gray" key={role}>{role}: {Array.isArray(users)?users.length:users}</span>
                ))}
              </div>
            </div>
            <span className="badge b-green">Active</span>
          </div>
        ))}
      </div>
    </>
  );
}
