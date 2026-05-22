import React, { useEffect, useState } from "react";

export default function Auth({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const t = await user.getIdToken();
        const r = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${t}` }
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message);
        setInfo(d);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [user, apiBaseUrl]);

  const rows = [
    { label: "UID", value: info?.uid },
    { label: "Email", value: info?.email || user?.email },
    { label: "Display name", value: info?.name || user?.displayName || "—" },
    { label: "Provider", value: user?.providerData?.[0]?.providerId || "—" },
    { label: "Email verified", value: user?.emailVerified ? "Yes" : "No" },
    { label: "Account created", value: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "—" },
  ];

  return (
    <>
      <div className="panel-title">Account</div>
      <div className="panel-sub">Your LifeHub account details.</div>

      {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {rows.map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", background: "rgba(255,255,255,0.04)",
            borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)"
          }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "monospace", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
