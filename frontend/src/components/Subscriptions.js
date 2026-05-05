import React, { useEffect, useState } from "react";

function Subscriptions({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [items, setItems] = useState([]);
  const [autoItems, setAutoItems] = useState([]);
  const [error, setError] = useState("");

  const loadSubscriptions = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load subscriptions.");
      }
      setItems(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadAutoSubscriptions = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/subscriptions/auto`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load auto subscriptions.");
      }
      setAutoItems(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, cost, renewalDate })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create subscription.");
      }
      setName("");
      setCost("");
      setRenewalDate("");
      await loadSubscriptions();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value || 0));

  return (
    <div className="module">
      <h2>Subscriptions</h2>
      <form className="grid-form" onSubmit={handleSubmit}>
        <input required value={name} placeholder="Subscription name" onChange={(event) => setName(event.target.value)} />
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={cost}
          placeholder="Monthly/annual cost"
          onChange={(event) => setCost(event.target.value)}
        />
        <input required type="date" value={renewalDate} onChange={(event) => setRenewalDate(event.target.value)} />
        <button type="submit">Add Subscription</button>
        <button type="button" onClick={loadAutoSubscriptions}>
          Auto-Fetch Subscriptions (Stub)
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <ul className="list">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong>
            <span>{formatCurrency(item.cost)} | Renews on {item.renewalDate}</span>
          </li>
        ))}
      </ul>

      {autoItems.length > 0 && (
        <>
          <h3>Auto-Tracked (API Stub)</h3>
          <ul className="list">
            {autoItems.map((item, idx) => (
              <li key={`${item.name}-${idx}`}>
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.cost)} | Renews on {item.renewalDate}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Subscriptions;
