import React, { useState } from "react";

export default function Security({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [input, setInput] = useState("");
  const [encrypted, setEncrypted] = useState(null);
  const [error, setError] = useState("");

  const encrypt = async () => {
    setError(""); setEncrypted(null);
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/security/encrypt`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ data: input }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setEncrypted(d);
    } catch (e) { setError(e.message); }
  };

  return (
    <>
      <div className="panel-title">Security</div>
      <div className="panel-sub">AES-256-CBC encryption. Encrypt sensitive data server-side.</div>

      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Plaintext to encrypt
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter any text or JSON..."
          style={{
            width: "100%", minHeight: 80, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            color: "rgba(255,255,255,0.8)", padding: "10px 12px", fontSize: 13,
            fontFamily: "monospace", resize: "vertical"
          }}
        />
        <button
          onClick={encrypt}
          style={{
            marginTop: 10, padding: "8px 20px", background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
            color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer"
          }}
        >
          Encrypt
        </button>
      </div>

      {encrypted && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            Encrypted output
          </div>
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, padding: "10px 12px", fontSize: 12,
            fontFamily: "monospace", color: "#4ade80", wordBreak: "break-all"
          }}>
            {JSON.stringify(encrypted, null, 2)}
          </div>
        </div>
      )}
    </>
  );
}
