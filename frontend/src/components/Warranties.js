import React, { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

const FREE_LIMIT = 3;

export default function Warranties({ authContext, formOpen, setFormOpen }) {
  const { user, apiBaseUrl, isPro } = authContext;
  const [productName, setProductName] = useState("");
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [needsManual, setNeedsManual] = useState(false);
  const productRef = useRef(null);

  const load = async () => {
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/warranties`, { headers: { Authorization: `Bearer ${t}` } });
      if (!r.ok) throw new Error("Failed to load");
      setItems(await r.json());
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (needsManual && productRef.current) {
      setTimeout(() => productRef.current?.focus(), 100);
    }
  }, [needsManual]);

  const atLimit = !isPro && items.length >= FREE_LIMIT;

  const getStatus = w => {
    const diff = (new Date(w.warrantyExpiryDate) - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 0 ? "Expired" : diff < 90 ? "Expiring soon" : "Active";
  };

  const resetForm = () => {
    setProductName(""); setWarrantyExpiryDate(""); setReceiptFile(null);
    setOcrStatus(null); setOcrResult(""); setNeedsManual(false);
  };

  const handleAddClick = () => {
    if (atLimit) {
      setError(`Free plan is limited to ${FREE_LIMIT} warranties. Upgrade to Pro for unlimited.`);
      return;
    }
    setError("");
    resetForm();
    setFormOpen(f => !f);
  };

  const save = async () => {
    if (!productName || !warrantyExpiryDate) { setError("Please fill in product name and expiry date."); return; }
    if (atLimit) { setError(`Free plan limit of ${FREE_LIMIT} reached.`); return; }
    setUploading(true); setError("");
    try {
      let receiptUrl = "", receiptFileName = "";
      if (receiptFile) {
        const fileRef = ref(storage, `receipts/${user.uid}/${Date.now()}-${receiptFile.name}`);
        await uploadBytes(fileRef, receiptFile);
        receiptUrl = await getDownloadURL(fileRef);
        receiptFileName = receiptFile.name;
      }
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/warranties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ productName, receiptUrl, receiptImage: receiptUrl, receiptFileName, warrantyExpiryDate }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      if (receiptFile && !d.receiptText) { setOcrStatus("failed"); setNeedsManual(true); setUploading(false); load(); return; }
      if (d.receiptText) { setOcrStatus("success"); setOcrResult(d.receiptText); }
      resetForm(); setFormOpen(false); load();
    } catch (e) { setError(e.message); }
    finally { setUploading(false); }
  };

  const sc = { "Active": "b-green", "Expiring soon": "b-amber", "Expired": "b-red" };
  const expiring = items.filter(w => getStatus(w) === "Expiring soon").length;
  const expired = items.filter(w => getStatus(w) === "Expired").length;

  return (
    <>
      <div className="panel-title">ReceiptVault</div>
      <div className="panel-sub">Store warranties, upload receipts, and get OCR extraction automatically.</div>

      <div className="stat-row">
        <div className="stat-chip"><div className="stat-chip-label">Total items</div><div className="stat-chip-val">{items.length}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Expiring soon</div><div className="stat-chip-val" style={{ color: "#fbbf24" }}>{expiring}</div></div>
        <div className="stat-chip"><div className="stat-chip-label">Expired</div><div className="stat-chip-val" style={{ color: "#f87171" }}>{expired}</div></div>
      </div>

      {!isPro && (
        <div style={{ fontSize:11, color: atLimit ? "#f87171" : "rgba(255,255,255,0.3)", marginBottom:8 }}>
          {items.length}/{FREE_LIMIT} used on free plan
          {atLimit && <a href="/docs.html#upgrade" target="_blank" rel="noreferrer" style={{ color:"#4f8ef7", marginLeft:8 }}>Upgrade to Pro →</a>}
        </div>
      )}

      <div className={`form-card ${formOpen && !atLimit ? "open" : ""}`}>
        {needsManual && (
          <div style={{ background:"rgba(251,191,36,.1)",border:"1px solid rgba(251,191,36,.25)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#fbbf24",lineHeight:1.5 }}>
            ⚠️ Couldn't read the receipt automatically. Please enter the details below manually.
          </div>
        )}
        {ocrStatus === "success" && ocrResult && (
          <div style={{ background:"rgba(74,222,128,.1)",border:"1px solid rgba(74,222,128,.25)",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#4ade80",lineHeight:1.5 }}>
            ✓ OCR extracted: {ocrResult.slice(0, 100)}
          </div>
        )}
        <div className="form-row">
          <div className="f-field">
            <div className="f-label">Product name {needsManual && <span style={{ color:"#f87171" }}>*</span>}</div>
            <input ref={productRef} value={productName} placeholder='MacBook Pro 16"' onChange={e => setProductName(e.target.value)} style={needsManual && !productName ? { borderColor:"rgba(251,191,36,.5)" } : {}}/>
          </div>
          <div className="f-field">
            <div className="f-label">Warranty expiry {needsManual && <span style={{ color:"#f87171" }}>*</span>}</div>
            <input type="date" value={warrantyExpiryDate} onChange={e => setWarrantyExpiryDate(e.target.value)} style={needsManual && !warrantyExpiryDate ? { borderColor:"rgba(251,191,36,.5)" } : {}}/>
          </div>
        </div>
        {!needsManual && (
          <div className="form-row">
            <div className="f-field" style={{ flex:2 }}>
              <div className="f-label">Receipt (image / PDF) — Claude AI will read it</div>
              <input type="file" accept="image/*,application/pdf" onChange={e => setReceiptFile(e.target.files?.[0] || null)}/>
            </div>
          </div>
        )}
        <div className="btn-row">
          <button className="btn btn-light" onClick={save} disabled={uploading}>
            {uploading ? "Processing…" : needsManual ? "Save manually" : "Save & OCR"}
          </button>
          <button className="btn btn-ghost" onClick={() => { resetForm(); setFormOpen(false); }}>Cancel</button>
        </div>
      </div>

      <button className="add-btn" onClick={handleAddClick} style={{ opacity: atLimit ? 0.5 : 1 }}>+ Add warranty</button>

      {error && <p style={{ color:"#f87171", fontSize:13, marginBottom:8 }}>{error}</p>}

      <div className="data-wrap">
        {items.length === 0
          ? <p style={{ color:"rgba(255,255,255,.4)", fontSize:13 }}>No warranties yet. Add your first one above.</p>
          : <table className="data-table">
            <thead><tr><th>Product</th><th>Expiry</th><th>Receipt</th><th>Status</th></tr></thead>
            <tbody>
              {items.map(w => {
                const s = getStatus(w);
                return <tr key={w.id}>
                  <td><strong>{w.productName}</strong></td>
                  <td>{w.warrantyExpiryDate}</td>
                  <td style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>{w.receiptText ? w.receiptText.slice(0,28)+"…" : w.receiptFileName || "—"}</td>
                  <td><span className={`badge ${sc[s]||"b-gray"}`}>{s}</span></td>
                </tr>;
              })}
            </tbody>
          </table>
        }
      </div>
    </>
  );
}
