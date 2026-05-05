import React, { useState } from "react";

export default function Security({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [input, setInput] = useState("");
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [error, setError] = useState("");

  const encrypt = async () => {
    setError(""); setDecrypted(null);
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/security/encrypt`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify({data:input}),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.message);
      setEncrypted(d);
    } catch(e){ setError(e.message); }
  };

  const decrypt = async () => {
    if (!encrypted) return;
    setError("");
    try {
      const t=await user.getIdToken();
      const r=await fetch(`${apiBaseUrl}/api/security/decrypt`,{
        method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},
        body:JSON.stringify(encrypted),
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.message);
      setDecrypted(d);
    } catch(e){ setError(e.message); }
  };

  return (
    <>
      <div className="panel-title">Security</div>
      <div className="panel-sub">AES-256-CBC encryption demo. Enter any text to encrypt and decrypt it server-side.</div>
      <div className="alert alert-red">The decrypt endpoint is a public oracle — remove it before production.</div>

      <div className="f-label" style={{marginBottom:6}}>Plaintext to encrypt</div>
      <textarea value={input} placeholder="Enter any text or JSON…" onChange={e=>setInput(e.target.value)} style={{marginBottom:12}}/>

      <div className="btn-row" style={{marginBottom:16}}>
        <button className="btn btn-light" onClick={encrypt}>Encrypt</button>
        <button className="btn btn-ghost" onClick={decrypt} disabled={!encrypted}>Decrypt</button>
      </div>

      {error && <p style={{color:"#ff5c5c",fontSize:13,marginBottom:8}}>{error}</p>}

      <div className="f-label" style={{marginBottom:4}}>Ciphertext</div>
      <div className="enc-box" style={{color:"#34d399"}}>{encrypted?.encryptedData||"—"}</div>

      <div className="f-label" style={{marginTop:14,marginBottom:4}}>Decrypted</div>
      <div className="enc-box" style={{color:"#6ee7b7"}}>{decrypted!==null?JSON.stringify(decrypted):"—"}</div>
    </>
  );
}
