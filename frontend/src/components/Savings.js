import React, { useEffect, useState } from "react";

function Savings({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [savings, setSavings] = useState(null);
  const [error, setError] = useState("");
  const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value || 0));

  useEffect(() => {
    async function fetchSavings() {
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/savings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to load savings.");
        }
        const data = await response.json();
        setSavings(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchSavings();
  }, [apiBaseUrl, user]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!savings) {
    return <p>Loading savings...</p>;
  }

  return (
    <div className="module">
      <h2>Savings Dashboard</h2>
      <p>Subscription Savings: {formatCurrency(savings.subscriptionSavings)}</p>
      <p>Warranty Savings: {formatCurrency(savings.warrantySavings)}</p>
      <p>Skill Exchange Savings: {formatCurrency(savings.skillSavings)}</p>
      <h3>Total Saved: {formatCurrency(savings.total)}</h3>

      <div className="badge-box">
        <h4>Badges</h4>
        {Number(savings.total || 0) > 50 && <p>🏅 Top Saver</p>}
        {Number(savings.skillSavings || 0) > 0 && <p>🤝 Skill Trader</p>}
        {Number(savings.warrantySavings || 0) > 0 && <p>🛡 Recall Guardian</p>}
        {Number(savings.total || 0) <= 0 && <p>Start adding data to unlock badges.</p>}
      </div>
    </div>
  );
}

export default Savings;
