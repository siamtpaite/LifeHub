import React, { useState } from "react";

function Security({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [input, setInput] = useState("");
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);
  const [error, setError] = useState("");

  const handleEncrypt = async () => {
    setError("");
    setDecrypted(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/security/encrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: input })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to encrypt.");
      }
      setEncrypted(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecrypt = async () => {
    if (!encrypted) {
      return;
    }
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/security/decrypt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(encrypted)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to decrypt.");
      }
      setDecrypted(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="module">
      <h2>Data Encryption Demo</h2>
      <input value={input} placeholder="Enter text" onChange={(event) => setInput(event.target.value)} />
      <div className="grid-form">
        <button type="button" onClick={handleEncrypt}>
          Encrypt
        </button>
        <button type="button" onClick={handleDecrypt} disabled={!encrypted}>
          Decrypt
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {encrypted && <p className="subtitle">Encrypted: {encrypted.encryptedData}</p>}
      {decrypted !== null && <p className="subtitle">Decrypted: {JSON.stringify(decrypted)}</p>}
    </div>
  );
}

export default Security;
