import React, { useEffect, useState } from "react";

export default function Recalls({ authContext }) {
  const { user, apiBaseUrl } = authContext;
  const [warranties, setWarranties] = useState([]);
  const [recalls, setRecalls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user's warranties
  const loadWarranties = async () => {
    try {
      const t = await user.getIdToken();
      const r = await fetch(`${apiBaseUrl}/api/warranties`, { 
        headers: { Authorization: `Bearer ${t}` } 
      });
      if (r.ok) setWarranties(await r.json());
    } catch (e) { setError(e.message); }
  };

  // Fetch recalls for user's products
  const loadRecalls = async () => {
    if (warranties.length === 0) {
      setRecalls({});
      return;
    }

    setLoading(true);
    try {
      const t = await user.getIdToken();
      const productList = warranties.map(w => w.productName).join(",");
      const r = await fetch(`${apiBaseUrl}/api/recalls?products=${encodeURIComponent(productList)}`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (r.ok) setRecalls(await r.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadWarranties(); }, []);
  useEffect(() => { loadRecalls(); }, [warranties]);

  const sc = { High: "b-red", Medium: "b-amber", Low: "b-blue" };

  return (
    <>
      <div className="panel-title">Safety Alerts</div>
      <div className="panel-sub">Product safety recalls matched against your warranties. We monitor official recall databases for items you own.</div>

      {error && <p style={{ color: "#ff5c5c", fontSize: 13, marginBottom: 8 }}>{error}</p>}

      {warranties.length === 0 ? (
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginTop: 16 }}>
          <p>No warranties added yet. Add products in <strong>ReceiptVault</strong> to monitor safety alerts for items you own.</p>
        </div>
      ) : (
        <>
          {loading && <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, marginBottom: 12 }}>Checking recall databases...</p>}

          <div className="data-wrap">
            {Object.keys(recalls).length === 0 ? (
              <p style={{ color: "rgba(255,255,255,.4)", fontSize: 13 }}>✓ No active recalls found for your products.</p>
            ) : (
              Object.entries(recalls).map(([prod, items]) => (
                <div className="recall-group" key={prod}>
                  <div className="recall-group-head">
                    {prod}
                    <span className={`badge ${sc[items[0]?.severity] || "b-gray"}`}>
                      {items[0]?.severity}
                    </span>
                    <span className="badge b-gray">{items.length} alert{items.length > 1 ? "s" : ""}</span>
                  </div>
                  {items.map((r, i) => (
                    <div className="recall-item" key={r.id || i}>
                      <div className="recall-desc">{r.description}</div>
                      <span className={`badge ${sc[r.severity] || "b-gray"}`}>{r.severity}</span>
                      <div className="recall-ts">{new Date(r.reportedAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}
