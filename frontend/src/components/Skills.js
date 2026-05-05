import React, { useEffect, useState } from "react";

function Skills({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [exchangeSkillId, setExchangeSkillId] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const loadSkills = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load skills.");
      }
      setItems(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSkills();
    const intervalId = setInterval(loadSkills, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleOffer = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/skills/offer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skillName, description })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create skill.");
      }
      setSkillName("");
      setDescription("");
      await loadSkills();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExchange = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/skills/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ skillId: exchangeSkillId })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to exchange skill.");
      }
      setExchangeSkillId("");
      await loadSkills();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module">
      <h2>Skills Marketplace</h2>
      <form className="grid-form" onSubmit={handleOffer}>
        <input required value={skillName} placeholder="Skill you offer" onChange={(event) => setSkillName(event.target.value)} />
        <textarea value={description} placeholder="Description or availability" onChange={(event) => setDescription(event.target.value)} />
        <button type="submit">Offer Skill (+1 credit)</button>
      </form>

      <form className="grid-form" onSubmit={handleExchange}>
        <input
          required
          value={exchangeSkillId}
          placeholder="Skill ID to exchange"
          onChange={(event) => setExchangeSkillId(event.target.value)}
        />
        <button type="submit">Exchange Skill (-1 credit)</button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <ul className="list">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.skillName}</strong>
            <span>{item.description || "No description provided."}</span>
            <span>By: {item.ownerName}</span>
            <span>Credits: {typeof item.credits === "number" ? item.credits : 1}</span>
            <span>ID: {item.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Skills;
