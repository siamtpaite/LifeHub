import React, { useState } from "react";

function Auth({ authContext }) {
  const { apiBaseUrl } = authContext;
  const [userId, setUserId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState("viewer");
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setVerified(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tenantId, role })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate token.");
      }
      setToken(data.token || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async () => {
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Token verification failed.");
      }
      setVerified(data);
    } catch (err) {
      setVerified({ valid: false });
      setError(err.message);
    }
  };

  return (
    <div className="module">
      <h2>Authentication (Zero-Trust)</h2>
      <div className="grid-form">
        <input value={userId} placeholder="User ID" onChange={(event) => setUserId(event.target.value)} />
        <input value={tenantId} placeholder="Tenant ID" onChange={(event) => setTenantId(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        <button type="button" onClick={handleVerify} disabled={!token}>
          Verify Token
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {token && <p className="subtitle">JWT Token: {token}</p>}
      {verified && <p className="subtitle">Verification: {JSON.stringify(verified)}</p>}
    </div>
  );
}

export default Auth;
