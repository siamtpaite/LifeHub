import React, { useEffect, useState } from "react";

function Subscriptions({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [items, setItems] = useState([]);
  const [autoItems, setAutoItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fmt = (v) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(v || 0));

  const loadSubscriptions = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBaseUrl}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load subscriptions.");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAutoSubscriptions = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBaseUrl}/api/subscriptions/auto`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load auto subscriptions.");
      setAutoItems(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBaseUrl}/api/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, cost, renewalDate }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create subscription.");
      }
      setName(""); setCost(""); setRenewalDate("");
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalMonthly = items.reduce((a, s) => a + Number(s.cost || 0), 0);

  return (
    <div className="module">
      <h2>Subscriptions</h2>
      <p>Track every recurring charge. Never get surprised by a renewal again.</p>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-chip">
          <div className="stat-label">Monthly total</div>
          <div className="stat-value">{fmt(totalMonthly)}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Active</div>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-chip">
          <div className="stat-label">Annual estimate</div>
          <div className="stat-value">{fmt(totalMonthly * 12)}</div>
        </div>
      </div>

      {/* Add form */}
      <form className="grid-form" onSubmit={handleSubmit}>
        <input
          required
          value={name}
          placeholder="Subscription name"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={cost}
          placeholder="Monthly cost"
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          required
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
        />
        <button type="submit">Add Subscription</button>
        <button type="button" className="btn-outline" onClick={loadAutoSubscriptions}>
          Auto-Detect (Stub)
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {/* List */}
      {loading ? (
        <div className="empty-state">Loading subscriptions…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No subscriptions yet. Add your first one above.</div>
      ) : (
        <ul className="data-list">
          {items.map((item) => (
            <li key={item.id} className="data-row">
              <div className="data-row-main">
                <strong>{item.name}</strong>
                <span className="data-row-meta">Renews {item.renewalDate}</span>
              </div>
              <div className="data-row-right">
                <span className="data-cost">{fmt(item.cost)}<span className="data-per">/mo</span></span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {autoItems.length > 0 && (
        <>
          <h3>Auto-Detected (Stub)</h3>
          <ul className="data-list">
            {autoItems.map((item, i) => (
              <li key={i} className="data-row">
                <div className="data-row-main">
                  <strong>{item.name}</strong>
                  <span className="data-row-meta">Renews {item.renewalDate}</span>
                </div>
                <div className="data-row-right">
                  <span className="data-cost">{fmt(item.cost)}<span className="data-per">/mo</span></span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Subscriptions;
