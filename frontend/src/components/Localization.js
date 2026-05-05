import React, { useEffect, useState } from "react";

function Localization({ apiBaseUrl, onCurrencyChange }) {
  const [currencies, setCurrencies] = useState([]);
  const [selected, setSelected] = useState("INR");

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/localization/currencies`);
        if (!response.ok) {
          throw new Error("Failed to load currencies.");
        }
        const data = await response.json();
        setCurrencies(data);
      } catch (error) {
        setCurrencies(["INR"]);
      }
    }

    fetchCurrencies();
  }, [apiBaseUrl]);

  const handleChange = (event) => {
    const currency = event.target.value;
    setSelected(currency);
    onCurrencyChange(currency);
  };

  return (
    <div className="localization-bar">
      <label htmlFor="currency-select">Select Currency:</label>
      <select id="currency-select" value={selected} onChange={handleChange}>
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Localization;
