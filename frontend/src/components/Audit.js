import React, { useEffect, useState } from "react";

function Audit({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/audit`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to load audit logs.");
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchLogs();
  }, [apiBaseUrl, user]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="module">
      <h2>Audit Logs</h2>
      <ul className="list">
        {logs.map((log, index) => (
          <li key={log.id || index}>
            <span>{log.timestamp}</span>
            <span>User {log.userId} performed {log.action}</span>
            <span>{log.details || "No details provided."}</span>
            {log.tenantId && <span>Tenant: {log.tenantId}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Audit;
