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

function Dashboard({ authContext }) {
  const [tab, setTab] = useState("subscriptions");
  const [currency, setCurrency] = useState("INR");

  return (
    <section className="card">
      <nav className="tabs">
        <button className={tab === "subscriptions" ? "active" : ""} onClick={() => setTab("subscriptions")}>
          Subscriptions
        </button>
        <button className={tab === "warranties" ? "active" : ""} onClick={() => setTab("warranties")}>
          ReceiptVault
        </button>
        <button className={tab === "skills" ? "active" : ""} onClick={() => setTab("skills")}>
          Skills
        </button>
        <button className={tab === "savings" ? "active" : ""} onClick={() => setTab("savings")}>
          Savings
        </button>
        <button className={tab === "monetisation" ? "active" : ""} onClick={() => setTab("monetisation")}>
          Monetisation
        </button>
        <button className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>
          Analytics
        </button>
        <button className={tab === "recalls" ? "active" : ""} onClick={() => setTab("recalls")}>
          Recalls
        </button>
        <button className={tab === "predictions" ? "active" : ""} onClick={() => setTab("predictions")}>
          Predictions
        </button>
        <button className={tab === "enterprise" ? "active" : ""} onClick={() => setTab("enterprise")}>
          Enterprise
        </button>
        <button className={tab === "tenants" ? "active" : ""} onClick={() => setTab("tenants")}>
          Tenants
        </button>
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>
          Audit Logs
        </button>
        <button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>
          Security
        </button>
        <button className={tab === "auth" ? "active" : ""} onClick={() => setTab("auth")}>
          Auth
        </button>
      </nav>

      <Localization apiBaseUrl={authContext.apiBaseUrl} onCurrencyChange={setCurrency} />

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
  );
}

export default Dashboard;
