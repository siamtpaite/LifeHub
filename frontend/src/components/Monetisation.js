import React, { useState } from "react";

function Monetisation({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [network, setNetwork] = useState("SOL");
  const [plan, setPlan] = useState("monthly");
  const [txHash, setTxHash] = useState("");
  const [message, setMessage] = useState("");

  const gumroadMonthly = "https://siamtpaite.gumroad.com/l/pmlxwh";
  const gumroadYearly = "https://siamtpaite.gumroad.com/l/ievmvi";
  const cryptoAddresses = {
    SOL: "A8qcrU1VYQy398C7ESotbQsLgwyeaPXt8K3eYqk6C7D3",
    BASE: "0x410bd58086F75f61AEe0546A74B7c3D9Ef461bD8",
    TRON: "TXE8UZejabi93ks73VzsgeBqXM4C3fEydX"
  };

  const handleVerifyCrypto = async () => {
    setMessage("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/monetisation/crypto/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ network, txHash, plan })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Payment verification failed.");
      }
      setMessage(`Payment verified for ${plan}. TX: ${data.txHash}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="module">
      <h2>LifeHub Subscription</h2>
      <h3>Gumroad</h3>
      <ul className="list">
        <li>
          <a href={gumroadMonthly} target="_blank" rel="noreferrer">
            Monthly - $6.99
          </a>
        </li>
        <li>
          <a href={gumroadYearly} target="_blank" rel="noreferrer">
            Yearly - $69.99
          </a>
        </li>
      </ul>

      <h3>Crypto Payment</h3>
      <p>Send equivalent USD value to one of these addresses:</p>
      <ul className="list">
        <li>SOLANA: {cryptoAddresses.SOL}</li>
        <li>BASE: {cryptoAddresses.BASE}</li>
        <li>TRON: {cryptoAddresses.TRON}</li>
      </ul>
      <p>After sending, submit your transaction hash for verification.</p>

      <div className="grid-form">
        <select value={plan} onChange={(event) => setPlan(event.target.value)}>
          <option value="monthly">monthly</option>
          <option value="yearly">yearly</option>
        </select>
        <select value={network} onChange={(event) => setNetwork(event.target.value)}>
          <option value="SOL">SOL</option>
          <option value="BASE">BASE</option>
          <option value="TRON">TRON</option>
        </select>
        <input value={txHash} placeholder="Transaction hash" onChange={(event) => setTxHash(event.target.value)} />
        <button type="button" onClick={handleVerifyCrypto}>
          Verify Crypto Payment
        </button>
      </div>
      {message && <p className="subtitle">{message}</p>}
    </div>
  );
}

export default Monetisation;
