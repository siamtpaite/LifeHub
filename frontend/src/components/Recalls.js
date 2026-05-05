import React, { useEffect, useState } from "react";

function Recalls({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [recalls, setRecalls] = useState({});
  const [error, setError] = useState("");

  const fetchRecalls = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/recalls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load recalls.");
      }
      const data = await response.json();
      setRecalls(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReport = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/recalls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productName, description, severity })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to report recall.");
      }

      setProductName("");
      setDescription("");
      setSeverity("Low");
      await fetchRecalls();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRecalls();
  }, []);

  return (
    <div className="module">
      <h2>Crowdsourced Recalls</h2>
      <form className="grid-form" onSubmit={handleReport}>
        <input
          required
          value={productName}
          placeholder="Product Name"
          onChange={(event) => setProductName(event.target.value)}
        />
        <input
          required
          value={description}
          placeholder="Description"
          onChange={(event) => setDescription(event.target.value)}
        />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit">Report Recall</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <h3>Community Recalls</h3>
      {Object.keys(recalls).length === 0 && <p className="subtitle">No recalls reported yet.</p>}
      {Object.keys(recalls).map((product) => (
        <div key={product} className="recall-group">
          <h4>{product}</h4>
          <ul className="list">
            {recalls[product].map((recall, index) => (
              <li key={recall.id || `${product}-${index}`}>
                <span>{recall.description}</span>
                <span>Severity: {recall.severity}</span>
                <span>Reported: {new Date(recall.reportedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Recalls;
