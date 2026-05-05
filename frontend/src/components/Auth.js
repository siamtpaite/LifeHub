import React, { useState } from "react";

export default function Auth({ authContext }) {
  const { apiBaseUrl } = authContext;
  const [userId, setUserId] = useState("any-user-id");
  const [tenantId, setTenantId] = useState("any-tenant-id");
  const [role, setRole] = useState("viewer");
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState("");

  const genToken = async () => {
    setError(""); setVerified(null);
    try {
      const r=await fetch(`${apiBaseUrl}/api/auth/login`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userId,tenantId,role}),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.message);
      setToken(d.token||"");
    } catch(e){ setError(e.message); }
  };

  const verify = async () => {
    if (!token) return;
    setError("");
    try {
      const r=await fetch(`${apiBaseUrl}/api/auth/verify`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({token}),
      });
      const d=await r.json();
      setVerified(d);
    } catch(e){ setVerified({valid:false}); setError(e.message); }
  };

  return (
    <>
      <div className="panel-title">Auth</div>
      <div className="panel-sub">Generate and verify JWT tokens — Zero-Trust demo panel.</div>
      <div className="alert alert-red">This endpoint issues JWTs to any caller without credential verification. Anyone can claim any role. Remove before production.</div>

      <div className="form-row">
        <div className="f-field"><div className="f-label">User ID</div><input value={userId} onChange={e=>setUserId(e.target.value)}/></div>
        <div className="f-field"><div className="f-label">Tenant ID</div><input value={tenantId} onChange={e=>setTenantId(e.target.value)}/></div>
        <div className="f-field"><div className="f-label">Role</div><select value={role} onChange={e=>setRole(e.target.value)}><option value="viewer">viewer</option><option value="manager">manager</option><option value="admin">admin</option></select></div>
      </div>
      <div className="btn-row" style={{marginBottom:16}}>
        <button className="btn btn-light" onClick={genToken}>Generate JWT</button>
        <button className="btn btn-ghost" onClick={verify} disabled={!token}>Verify</button>
      </div>
      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="f-label" style={{marginBottom:4}}>Token output</div>
      <div className="enc-box" style={{color:"#c084fc"}}>{token||"—"}</div>

      <div className="f-label" style={{marginTop:14,marginBottom:4}}>Verification result</div>
      <div className="enc-box" style={{color:"#a78bfa"}}>{verified?JSON.stringify(verified,null,2):"—"}</div>
    </>
  );
}
