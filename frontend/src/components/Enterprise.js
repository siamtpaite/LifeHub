import React, { useEffect, useState } from "react";

function Enterprise({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/enterprise`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to load enterprise dashboard.");
        }
        const data = await response.json();
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchDashboard();
  }, [apiBaseUrl, user]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!dashboard) {
    return <p>Loading enterprise dashboard...</p>;
  }

  return (
    <div className="module">
      <h2>Enterprise SaaS Dashboard</h2>
      <p>Subscription Churn Rate: {(Number(dashboard.subscriptionChurnRate || 0) * 100).toFixed(2)}%</p>
      <p>
        Average Warranty Claim Time:{" "}
        {Math.round(Number(dashboard.avgWarrantyClaimTime || 0) / (1000 * 60 * 60 * 24))} days
      </p>
      <p>Recall Impact: {dashboard.recallImpact} recalls reported</p>
      <p>Top Failing Products: {(dashboard.topFailingProducts || []).join(", ") || "No claim trends yet"}</p>
    </div>
  );
}

export default Enterprise;
