import React, { useEffect, useState } from "react";

function Predictions({ authContext, currency = "INR" }) {
  const { user, apiBaseUrl } = authContext;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const formatCurrency = (value) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(value || 0));

  useEffect(() => {
    async function fetchPredictions() {
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${apiBaseUrl}/api/predictions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to load predictions.");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchPredictions();
  }, [apiBaseUrl, user]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!data) {
    return <p>Loading predictions...</p>;
  }

  return (
    <div className="module">
      <h2>AI Predictions and Trends</h2>

      <h3>Failure Trends</h3>
      <ul className="list">
        {(data.trends || []).map((trend, index) => (
          <li key={`${trend.product}-${index}`}>
            <strong>{trend.product}</strong>
            <span>Failures: {trend.failures}</span>
            <span>Recalls: {trend.recalls}</span>
            <span>Risk Score: {trend.riskScore}</span>
          </li>
        ))}
      </ul>

      <h3>Resale Forecasts</h3>
      <ul className="list">
        {(data.resalePredictions || []).map((prediction, index) => (
          <li key={`${prediction.product}-${index}`}>
            <strong>{prediction.product}</strong>
            <span>Owned {Number(prediction.monthsOwned || 0).toFixed(1)} months</span>
            <span>Predicted Value: {formatCurrency(prediction.predictedResaleValue)}</span>
            <span>Recommendation: {prediction.recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Predictions;
