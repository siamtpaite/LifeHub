/**
 * UpgradePrompt.js
 * Overlay shown when a free user clicks a Pro-only feature.
 * Routes to in-app Monetisation panel instead of external links.
 */
import React from "react";

export default function UpgradePrompt({ title, description, onClose, onUpgrade }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 50,
      background: "rgba(8,9,14,0.85)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 32,
    }}>
      <div style={{
        background: "#111118",
        border: "1px solid rgba(79,142,247,0.3)",
        borderRadius: 16, padding: "36px 40px",
        maxWidth: 420, width: "100%", textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: "#fff",
          letterSpacing: "-0.4px", marginBottom: 10,
        }}>
          {title || "Upgrade to Pro"}
        </h2>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.5)",
          lineHeight: 1.7, marginBottom: 28,
        }}>
          {description || "This feature is available on the Pro plan. Upgrade to unlock unlimited access and all Pro features."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={onUpgrade}
            style={{
              display: "block", padding: "12px 20px",
              background: "linear-gradient(135deg, #2979ff, #4f8ef7)",
              borderRadius: 10, color: "#fff", border: "none",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            View Payment Options
          </button>
          <a
            href="/docs.html#crypto"
            target="_blank" rel="noreferrer"
            style={{
              fontSize: 12, color: "rgba(255,255,255,0.3)",
              textDecoration: "none", marginTop: 4,
            }}
          >
            Learn about crypto payments →
          </a>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              marginTop: 20, background: "none", border: "none",
              color: "rgba(255,255,255,0.25)", fontSize: 12,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Maybe later
          </button>
        )}
      </div>
    </div>
  );
}
