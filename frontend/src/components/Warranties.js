import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

function Warranties({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [productName, setProductName] = useState("");
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lastOcrText, setLastOcrText] = useState("");

  const loadWarranties = async () => {
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/warranties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load warranties.");
      }
      setItems(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadWarranties();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setUploading(true);

    try {
      let receiptUrl = "";
      let receiptFileName = "";

      if (receiptFile) {
        const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}-${receiptFile.name}`);
        await uploadBytes(fileRef, receiptFile);
        receiptUrl = await getDownloadURL(fileRef);
        receiptFileName = receiptFile.name;
      }

      const token = await user.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/warranties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productName,
          receiptUrl,
          receiptImage: receiptUrl,
          receiptFileName,
          warrantyExpiryDate
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save warranty.");
      }
      const data = await response.json();
      setLastOcrText(data.receiptText || "No OCR data");

      setProductName("");
      setWarrantyExpiryDate("");
      setReceiptFile(null);
      await loadWarranties();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="module">
      <h2>ReceiptVault (Warranties and Inventory)</h2>
      <form className="grid-form" onSubmit={handleSubmit}>
        <input required value={productName} placeholder="Product name" onChange={(event) => setProductName(event.target.value)} />
        <input required type="date" value={warrantyExpiryDate} onChange={(event) => setWarrantyExpiryDate(event.target.value)} />
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) => setReceiptFile(event.target.files && event.target.files[0] ? event.target.files[0] : null)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Saving..." : "Save Warranty"}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {lastOcrText && <p className="subtitle">OCR: {lastOcrText.slice(0, 160)}{lastOcrText.length > 160 ? "..." : ""}</p>}

      <ul className="list">
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.productName}</strong>
            <span>Warranty expires on {item.warrantyExpiryDate}</span>
            {item.receiptUrl && (
              <a href={item.receiptUrl} target="_blank" rel="noreferrer">
                View Receipt ({item.receiptFileName || "file"})
              </a>
            )}
            <span>OCR: {item.receiptText || "No OCR data"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Warranties;
