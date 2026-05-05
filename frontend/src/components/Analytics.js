import React, { useEffect, useState } from "react";

function Analytics({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value || 0));

  useEffect(() => {
    async function fetchAnalytics() {
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to load analytics.");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchAnalytics();
  }, [apiBaseUrl, user]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!analytics) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="module">
      <h2>Enterprise Analytics</h2>
      <p>Active Users: {analytics.activeUsers}</p>
      <p>Average Subscription Cost: {formatCurrency(analytics.avgSubscriptionCost)}</p>
      <p>Top Skills Offered: {(analytics.topSkills || []).join(", ") || "No skills yet"}</p>
      <p>Warranty Claims: {analytics.warrantyClaims}</p>
      <p>Recall Alerts Triggered: {analytics.recallAlerts}</p>
    </div>
  );
}

export default Analytics;
