import React, { useEffect, useState } from "react";

function Tenants({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [tenants, setTenants] = useState([]);
  const [name, setName] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTenants = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load tenants.");
      }
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTenant = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, adminUser })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create tenant.");
      }

      setTenants((prev) => [...prev, data]);
      setName("");
      setAdminUser("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  return (
    <div className="module">
      <h2>Multi-Tenant Management</h2>
      <form className="grid-form" onSubmit={handleCreateTenant}>
        <input
          required
          placeholder="Tenant Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          placeholder="Admin User ID (optional)"
          value={adminUser}
          onChange={(event) => setAdminUser(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Tenant"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <h3>Existing Tenants</h3>
      <ul className="list">
        {tenants.map((tenant) => (
          <li key={tenant.id}>
            <strong>{tenant.name}</strong>
            <span>Admin: {tenant.adminUser}</span>
            <span>ID: {tenant.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tenants;
