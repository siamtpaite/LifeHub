import React, { useState } from "react";
import Subscriptions from "./Subscriptions";
import Warranties from "./Warranties";
import Skills from "./Skills";
import Savings from "./Savings";
import Monetisation from "./Monetisation";
import Analytics from "./Analytics";
import Localization from "./Localization";
import Recalls from "./Recalls";
import Predictions from "./Predictions";
import Enterprise from "./Enterprise";
import Tenants from "./Tenants";
import Audit from "./Audit";
import Security from "./Security";
import Auth from "./Auth";

const NAV = [
  { id: "subscriptions", label: "Subscriptions", color: "#15803d", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M16 4v5"/>
    </svg>
  )},
  { id: "warranties", label: "ReceiptVault", color: "#1d4ed8", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"/>
    </svg>
  )},
  { id: "skills", label: "Skills", color: "#6d28d9", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )},
  { id: "savings", label: "Savings", color: "#b45309", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/>
    </svg>
  )},
  { id: "analytics", label: "Analytics", color: "#0284c7", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/>
    </svg>
  )},
  { id: "predictions", label: "Predictions", color: "#9d174d", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
  { id: "recalls", label: "Recalls", color: "#b91c1c", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )},
  { id: "enterprise", label: "Enterprise", color: "#4338ca", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { id: "tenants", label: "Tenants", color: "#0f766e", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="17" cy="21" r="3"/><circle cx="7" cy="21" r="3"/>
      <path d="M7 18V9a4 4 0 0 1 8 0v1"/><path d="M5 10H3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/>
    </svg>
  )},
  { id: "audit", label: "Audit", color: "#475569", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { id: "security", label: "Security", color: "#059669", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
  )},
  { id: "monetisation", label: "Subscription", color: "#92400e", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/>
    </svg>
  )},
  { id: "auth", label: "Auth", color: "#7e22ce", icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3"/>
    </svg>
  )},
];

function Dashboard({ authContext }) {
  const [tab, setTab] = useState("subscriptions");
  const [currency, setCurrency] = useState("INR");

  const activeNav = NAV.find((n) => n.id === tab);

  return (
    <>
      {/* Icon-only sidebar */}
      <aside className="sidebar">
        <nav className="tabs">
          {NAV.map((item) => (
            <button
              key={item.id}
              title={item.label}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
              style={tab === item.id ? {
                background: `linear-gradient(135deg, ${item.color}cc, ${item.color}88)`,
                color: "#fff",
                boxShadow: `0 0 12px ${item.color}44`,
              } : {}}
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <section className="card" style={{
        background: activeNav
          ? `radial-gradient(ellipse at 20% 50%, ${activeNav.color}22 0%, #0b0c0f 60%)`
          : "#0b0c0f"
      }}>
        <Localization
          apiBaseUrl={authContext.apiBaseUrl}
          onCurrencyChange={setCurrency}
        />

        {tab === "subscriptions" && <Subscriptions authContext={authContext} currency={currency} />}
        {tab === "warranties" && <Warranties authContext={authContext} currency={currency} />}
        {tab === "skills" && <Skills authContext={authContext} currency={currency} />}
        {tab === "savings" && <Savings authContext={authContext} currency={currency} />}
        {tab === "monetisation" && <Monetisation authContext={authContext} currency={currency} />}
        {tab === "analytics" && <Analytics authContext={authContext} currency={currency} />}
        {tab === "recalls" && <Recalls authContext={authContext} />}
        {tab === "predictions" && <Predictions authContext={authContext} currency={currency} />}
        {tab === "enterprise" && <Enterprise authContext={authContext} />}
        {tab === "tenants" && <Tenants authContext={authContext} />}
        {tab === "audit" && <Audit authContext={authContext} />}
        {tab === "security" && <Security authContext={authContext} />}
        {tab === "auth" && <Auth authContext={authContext} />}
      </section>
    </>
  );
}

export default Dashboard;
