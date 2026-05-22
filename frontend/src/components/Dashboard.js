import React, { useState } from "react";
import Subscriptions from "./Subscriptions";
import Warranties from "./Warranties";
import Skills from "./Skills";
import Savings from "./Savings";
import Monetisation from "./Monetisation";
import Analytics from "./Analytics";
import Recalls from "./Recalls";
import Predictions from "./Predictions";
import Enterprise from "./Enterprise";
import Tenants from "./Tenants";
import Audit from "./Audit";
import Security from "./Security";
import Auth from "./Auth";
import Localization from "./Localization";
import AIAdvisor from "./AIAdvisor";
import SkillsChat from "./SkillsChat";
import UpgradePrompt from "./UpgradePrompt";

/* ── Free plan limits ── */
export const FREE_LIMITS = {
  subscriptions: 5,
  warranties: 3,
  skills: 5,
  savings: 2,
};

/* ── Pro-only panels (entire panel locked) ── */
const PRO_ONLY_PANELS = new Set(["ai-advisor", "skills-chat", "enterprise", "predictions"]);

/* ── SVG SPHERES per panel ── */
const GreenSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="sg1" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#6ee86e"/><stop offset="45%" stopColor="#16a34a"/><stop offset="100%" stopColor="#032b0f"/>
      </radialGradient>
      <radialGradient id="sg1h" cx="34%" cy="28%" r="48%">
        <stop offset="0%" stopColor="rgba(200,255,200,.55)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id="sf1"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="sf1b"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <ellipse cx="130" cy="180" rx="90" ry="40" fill="#16a34a" opacity=".25" filter="url(#sf1)"/>
    <circle cx="130" cy="118" r="108" fill="url(#sg1)"/>
    <ellipse cx="95" cy="72" rx="52" ry="30" fill="url(#sg1h)" opacity=".75"/>
    <rect x="74" y="90" width="112" height="72" rx="12" fill="rgba(255,255,255,.15)" filter="url(#sf1b)"/>
    <rect x="74" y="90" width="112" height="22" rx="12" fill="rgba(255,255,255,.2)"/>
    <rect x="84" y="126" width="32" height="7" rx="3.5" fill="rgba(255,255,255,.5)"/>
    <rect x="122" y="126" width="20" height="7" rx="3.5" fill="rgba(255,255,255,.3)"/>
    <circle cx="155" cy="131" r="9" fill="rgba(255,255,255,.25)"/>
    <circle cx="164" cy="131" r="9" fill="rgba(255,255,255,.4)"/>
    <ellipse cx="130" cy="236" rx="75" ry="14" fill="rgba(0,0,0,.45)" filter="url(#sf1)"/>
  </svg>
);

const BlueSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="wg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#93c5fd"/><stop offset="45%" stopColor="#1d4ed8"/><stop offset="100%" stopColor="#03082e"/>
      </radialGradient>
      <radialGradient id="wgh" cx="34%" cy="28%" r="48%">
        <stop offset="0%" stopColor="rgba(180,210,255,.5)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id="wf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#1d4ed8" opacity=".22" filter="url(#wf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#wg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="url(#wgh)" opacity=".72"/>
    <path d="M130 70 L100 85 L100 118 C100 138 113 154 130 160 C147 154 160 138 160 118 L160 85 Z" fill="rgba(255,255,255,.2)"/>
    <path d="M120 118 L127 125 L142 110" stroke="rgba(255,255,255,.85)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#wf)"/>
  </svg>
);

const VioletSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="pkg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#c4b5fd"/><stop offset="45%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#0e0220"/>
      </radialGradient>
      <radialGradient id="pkgh" cx="34%" cy="28%" r="48%">
        <stop offset="0%" stopColor="rgba(196,181,253,.5)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id="pkf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#7c3aed" opacity=".22" filter="url(#pkf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#pkg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="url(#pkgh)" opacity=".7"/>
    <circle cx="108" cy="100" r="20" fill="rgba(255,255,255,.35)"/>
    <circle cx="152" cy="100" r="20" fill="rgba(255,255,255,.25)"/>
    <circle cx="130" cy="115" r="16" fill="rgba(255,255,255,.4)"/>
    <path d="M80 148 C80 132 93 122 108 122 C123 122 136 132 136 148" fill="rgba(255,255,255,.25)"/>
    <path d="M124 148 C124 132 137 122 152 122 C167 122 180 132 180 148" fill="rgba(255,255,255,.2)"/>
    <path d="M118 108 L142 108" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round"/>
    <polyline points="136,103 142,108 136,113" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#pkf)"/>
  </svg>
);

const AmberSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="savg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#fde68a"/><stop offset="45%" stopColor="#d97706"/><stop offset="100%" stopColor="#1c0800"/>
      </radialGradient>
      <radialGradient id="savgh" cx="34%" cy="28%" r="48%">
        <stop offset="0%" stopColor="rgba(253,230,138,.55)"/><stop offset="100%" stopColor="rgba(0,0,0,0)"/>
      </radialGradient>
      <filter id="savf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#d97706" opacity=".22" filter="url(#savf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#savg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="url(#savgh)" opacity=".72"/>
    <circle cx="130" cy="115" r="42" fill="rgba(255,255,255,.2)"/>
    <text x="130" y="126" textAnchor="middle" fontSize="28" fontWeight="bold" fill="rgba(255,255,255,.8)" fontFamily="Inter,sans-serif">$</text>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#savf)"/>
  </svg>
);

const SkySphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="ang" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#7dd3fc"/><stop offset="45%" stopColor="#0284c7"/><stop offset="100%" stopColor="#021828"/>
      </radialGradient>
      <filter id="anf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#0284c7" opacity=".22" filter="url(#anf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#ang)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(125,211,252,.45)" opacity=".7"/>
    <rect x="88" y="130" width="18" height="30" rx="4" fill="rgba(255,255,255,.3)"/>
    <rect x="112" y="110" width="18" height="50" rx="4" fill="rgba(255,255,255,.5)"/>
    <rect x="136" y="95" width="18" height="65" rx="4" fill="rgba(255,255,255,.7)"/>
    <rect x="160" y="118" width="18" height="42" rx="4" fill="rgba(255,255,255,.4)"/>
    <line x1="82" y1="162" x2="186" y2="162" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#anf)"/>
  </svg>
);

const PinkSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="prg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#f9a8d4"/><stop offset="45%" stopColor="#db2777"/><stop offset="100%" stopColor="#1e0012"/>
      </radialGradient>
      <filter id="prf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#db2777" opacity=".22" filter="url(#prf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#prg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(249,168,212,.45)" opacity=".7"/>
    <polyline points="82,150 100,132 118,140 136,108 154,118 172,88" stroke="rgba(255,255,255,.8)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="172" cy="88" r="6" fill="rgba(255,255,255,.9)"/>
    <circle cx="136" cy="108" r="5" fill="rgba(255,255,255,.6)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#prf)"/>
  </svg>
);

const RedSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="rcg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#fca5a5"/><stop offset="45%" stopColor="#dc2626"/><stop offset="100%" stopColor="#1e0202"/>
      </radialGradient>
      <filter id="rcf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#dc2626" opacity=".22" filter="url(#rcf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#rcg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(252,165,165,.45)" opacity=".7"/>
    <path d="M130 72 L168 150 L92 150 Z" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.6)" strokeWidth="4" strokeLinejoin="round"/>
    <line x1="130" y1="96" x2="130" y2="128" stroke="rgba(255,255,255,.9)" strokeWidth="5" strokeLinecap="round"/>
    <circle cx="130" cy="141" r="4" fill="rgba(255,255,255,.9)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#rcf)"/>
  </svg>
);

const IndigoSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="eng" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#a5b4fc"/><stop offset="45%" stopColor="#4338ca"/><stop offset="100%" stopColor="#04021c"/>
      </radialGradient>
      <filter id="enf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#4338ca" opacity=".22" filter="url(#enf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#eng)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(165,180,252,.45)" opacity=".7"/>
    <rect x="82" y="88" width="96" height="72" rx="8" fill="rgba(255,255,255,.15)"/>
    <rect x="82" y="88" width="96" height="18" rx="8" fill="rgba(255,255,255,.25)"/>
    <rect x="92" y="118" width="36" height="6" rx="3" fill="rgba(255,255,255,.4)"/>
    <rect x="92" y="130" width="56" height="6" rx="3" fill="rgba(255,255,255,.25)"/>
    <rect x="92" y="142" width="44" height="6" rx="3" fill="rgba(255,255,255,.2)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#enf)"/>
  </svg>
);

const TealSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="tng" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#5eead4"/><stop offset="45%" stopColor="#0f766e"/><stop offset="100%" stopColor="#011a18"/>
      </radialGradient>
      <filter id="tnf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#0f766e" opacity=".22" filter="url(#tnf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#tng)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(94,234,212,.45)" opacity=".7"/>
    <circle cx="130" cy="118" r="38" fill="rgba(255,255,255,.2)"/>
    <circle cx="130" cy="118" r="24" fill="rgba(255,255,255,.3)"/>
    <circle cx="130" cy="118" r="10" fill="rgba(255,255,255,.6)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#tnf)"/>
  </svg>
);

const GraySphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="grg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#d1d5db"/><stop offset="45%" stopColor="#4b5563"/><stop offset="100%" stopColor="#111827"/>
      </radialGradient>
      <filter id="grf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#4b5563" opacity=".22" filter="url(#grf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#grg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(209,213,219,.45)" opacity=".7"/>
    <rect x="90" y="88" width="80" height="60" rx="8" fill="rgba(255,255,255,.2)"/>
    <line x1="100" y1="108" x2="170" y2="108" stroke="rgba(255,255,255,.5)" strokeWidth="3"/>
    <line x1="100" y1="120" x2="155" y2="120" stroke="rgba(255,255,255,.3)" strokeWidth="3"/>
    <line x1="100" y1="132" x2="145" y2="132" stroke="rgba(255,255,255,.2)" strokeWidth="3"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#grf)"/>
  </svg>
);

const EmeraldSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="emg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#6ee7b7"/><stop offset="45%" stopColor="#059669"/><stop offset="100%" stopColor="#022b1a"/>
      </radialGradient>
      <filter id="emf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#059669" opacity=".22" filter="url(#emf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#emg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(110,231,183,.45)" opacity=".7"/>
    <path d="M130 80 L158 100 L148 132 L112 132 L102 100 Z" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.5)" strokeWidth="3"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#emf)"/>
  </svg>
);

const OrangeSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="org" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#fdba74"/><stop offset="45%" stopColor="#ea580c"/><stop offset="100%" stopColor="#1c0800"/>
      </radialGradient>
      <filter id="orf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#ea580c" opacity=".22" filter="url(#orf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#org)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(253,186,116,.45)" opacity=".7"/>
    <circle cx="110" cy="108" r="22" fill="rgba(255,255,255,.3)"/>
    <circle cx="150" cy="108" r="22" fill="rgba(255,255,255,.2)"/>
    <path d="M88 138 Q130 158 172 138" stroke="rgba(255,255,255,.6)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#orf)"/>
  </svg>
);

const SPHERES = {
  subscriptions: <GreenSphere/>,
  warranties: <BlueSphere/>,
  skills: <VioletSphere/>,
  savings: <AmberSphere/>,
  analytics: <SkySphere/>,
  predictions: <PinkSphere/>,
  recalls: <RedSphere/>,
  enterprise: <IndigoSphere/>,
  tenants: <TealSphere/>,
  audit: <GraySphere/>,
  security: <EmeraldSphere/>,
  monetisation: <OrangeSphere/>,
  auth: <GraySphere/>,
  "ai-advisor": <BlueSphere/>,
  "skills-chat": <VioletSphere/>,
};

const NAV = [
  { id:"subscriptions", label:"Subscriptions", glow:"rgba(22,163,74,.35)", dot:"#16a34a",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { id:"warranties", label:"Warranties", glow:"rgba(29,78,216,.35)", dot:"#1d4ed8",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4z"/></svg> },
  { id:"skills", label:"Skills", glow:"rgba(124,58,237,.35)", dot:"#7c3aed",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id:"savings", label:"Savings", glow:"rgba(217,119,6,.35)", dot:"#d97706",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { sep:true },
  { id:"analytics", label:"Analytics", glow:"rgba(2,132,199,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { id:"predictions", label:"Predictions", glow:"rgba(219,39,119,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id:"ai-advisor", label:"AI Advisor", glow:"rgba(29,78,216,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { sep:true },
  { id:"recalls", label:"Recalls", glow:"rgba(220,38,38,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { id:"enterprise", label:"Enterprise", glow:"rgba(67,56,202,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id:"tenants", label:"Tenants", glow:"rgba(15,118,110,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { sep:true },
  { id:"audit", label:"Audit", glow:"rgba(75,85,99,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id:"security", label:"Security", glow:"rgba(5,150,105,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
  { id:"monetisation", label:"Upgrade to Pro", glow:"rgba(234,88,12,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { sep:true },
  { id:"auth", label:"Account", glow:"rgba(75,85,99,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { id:"skills-chat", label:"SkillsChat", glow:"rgba(124,58,237,.35)",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const THEMES = {
  subscriptions:"theme-green", warranties:"theme-blue", skills:"theme-violet",
  savings:"theme-amber", analytics:"theme-sky", predictions:"theme-pink",
  recalls:"theme-red", enterprise:"theme-indigo", tenants:"theme-teal",
  audit:"theme-slate", security:"theme-emerald", monetisation:"theme-orange",
  auth:"theme-slate", "ai-advisor":"theme-blue", "skills-chat":"theme-violet",
};

const SCANS = {
  subscriptions:"radial-gradient(circle at 40% 35%,#4ade80,#16a34a)",
  warranties:"radial-gradient(circle at 40% 35%,#60a5fa,#1d4ed8)",
  skills:"radial-gradient(circle at 40% 35%,#a78bfa,#6d28d9)",
  savings:null, analytics:null,
  predictions:"radial-gradient(circle at 40% 35%,#f472b6,#9d174d)",
  recalls:"radial-gradient(circle at 40% 35%,#f87171,#b91c1c)",
  enterprise:null,
  tenants:"radial-gradient(circle at 40% 35%,#2dd4bf,#0f766e)",
  audit:null,
  security:"radial-gradient(circle at 40% 35%,#34d399,#059669)",
  monetisation:null,
  auth:null,
};

const SCAN_LABELS = {
  subscriptions:"Add", warranties:"Add", skills:"Offer",
  recalls:"Report", tenants:"Create", security:"Encrypt",
};

/* ── SPLIT PANEL WRAPPER ── */
function SplitPanel({ id, children, onScanClick }) {
  const sphere = SPHERES[id];
  const scan = SCANS[id];
  const scanLabel = SCAN_LABELS[id];
  return (
    <div style={{ display:"flex", height:"100%", overflow:"hidden", width:"100%" }}>
      <div style={{
        flex:"0 0 44%", position:"relative",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"40px 20px 80px",
      }}>
        <div>{sphere}</div>
        {scan && scanLabel && (
          <button className="scan-btn" style={{ background:scan }} onClick={onScanClick}>
            {scanLabel}
          </button>
        )}
      </div>
      <div style={{
        flex:"1", overflowY:"auto",
        padding:"40px 48px 80px 8px",
        display:"flex", flexDirection:"column",
        minWidth:0,
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── Pro badge shown on locked nav items ── */
function ProBadge() {
  return (
    <span style={{
      position:"absolute", top:4, right:4,
      background:"linear-gradient(135deg,#2979ff,#4f8ef7)",
      borderRadius:3, padding:"1px 4px",
      fontSize:8, fontWeight:700, color:"#fff", letterSpacing:"0.04em",
    }}>PRO</span>
  );
}

function Dashboard({ authContext }) {
  const [tab, setTab] = useState(() => localStorage.getItem("lh_tab") || "subscriptions");
  const [currency, setCurrency] = useState("INR");
  const [formOpen, setFormOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState({});
  const [expanded, setExpanded] = useState(() => localStorage.getItem("lh_sidebar") === "1");

  const { isPro, planLoading } = authContext;
  const theme = THEMES[tab] || "theme-green";
  const SW = expanded ? 180 : 68;

  const handleNavClick = (id) => {
    if (!isPro && PRO_ONLY_PANELS.has(id)) {
      const label = NAV.find(n => n.id === id)?.label || id;
      setUpgradeReason({
        title: `${label} — Pro Feature`,
        description: `${label} is available on the Pro plan. Upgrade to unlock it along with unlimited access to all features.`,
      });
      setShowUpgrade(true);
      return;
    }
    setTab(id);
    localStorage.setItem("lh_tab", id);
    setFormOpen(false);
    setShowUpgrade(false);
  };

  const toggleSidebar = () => {
    setExpanded(v => {
      localStorage.setItem("lh_sidebar", v ? "0" : "1");
      return !v;
    });
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:`${SW}px 1fr`, height:"100vh", overflow:"hidden", transition:"grid-template-columns 0.2s ease", background:"#08090e" }}>
      {/* SIDEBAR */}
      <aside style={{
        background:"#111118",
        display:"flex", flexDirection:"column",
        alignItems:"flex-start",
        padding:"12px 0", gap:2,
        borderRight:"1px solid rgba(255,255,255,.06)",
        overflowY:"auto", overflowX:"hidden",
        width: SW, minWidth: SW, maxWidth: SW,
        transition:"width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease",
      }}>
        {/* Toggle */}
        <button
          onClick={() => toggleSidebar()}
          title={expanded ? "Collapse menu" : "Expand menu"}
          style={{
            width:44, height:28, borderRadius:8, border:"none",
            background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.35)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:10, marginLeft:12, flexShrink:0, fontSize:13,
          }}
        >
          {expanded ? "‹" : "›"}
        </button>

        {NAV.map((item, i) => {
          if (item.sep) return (
            <div key={i} style={{
              height:1, background:"rgba(255,255,255,.07)",
              margin:"4px 12px", width: expanded ? "calc(100% - 24px)" : 30,
              alignSelf:"center", flexShrink:0,
              transition:"width 0.2s ease",
            }}/>
          );
          const locked = PRO_ONLY_PANELS.has(item.id) && !isPro && !planLoading;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              title={item.label + (locked ? " (Pro)" : "")}
              onClick={() => handleNavClick(item.id)}
              style={{
                width: expanded ? `calc(100% - 16px)` : 44,
                height:44, borderRadius:11, border:"none",
                display:"flex", alignItems:"center",
                justifyContent: expanded ? "flex-start" : "center",
                gap:10,
                padding: expanded ? "0 12px" : 0,
                marginLeft: expanded ? 8 : 12,
                cursor:"pointer", position:"relative", flexShrink:0,
                background: isActive ? (item.glow || "rgba(255,255,255,0.1)") : "none",
                color: isActive ? "#fff" : "rgba(255,255,255,.3)",
                boxShadow: isActive ? "0 0 12px rgba(0,0,0,.3)" : "none",
                transition:"all 0.2s ease",
              }}
              onMouseOver={e => { if(!isActive) e.currentTarget.style.background="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}
              onMouseOut={e => { if(!isActive) e.currentTarget.style.background="none"; e.currentTarget.style.color=isActive?"#fff":"rgba(255,255,255,.3)"; }}
            >
              <span style={{ flexShrink:0, display:"flex", width:19, height:19 }}>{item.icon}</span>
              {expanded && (
                <span style={{
                  fontSize:12, fontWeight:500, whiteSpace:"nowrap",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  fontFamily:"Inter,sans-serif", overflow:"hidden", textOverflow:"ellipsis",
                }}>
                  {item.label}
                </span>
              )}
              {item.dot && <div className="nav-dot" style={{ background:item.dot }}/>}
              {locked && <ProBadge/>}
            </button>
          );
        })}
      </aside>

      {/* MAIN */}
      <div className={`card ${theme}`} style={{ position:"relative", overflow:"hidden", height:"100vh", minHeight:0, background:"#0b0c0f" }}>
        {/* Slim currency bar */}
        <div style={{ position:"absolute",top:0,left:0,right:0,zIndex:5,padding:"6px 16px",background:"rgba(0,0,0,.2)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8 }}>
          <Localization apiBaseUrl={authContext.apiBaseUrl} onCurrencyChange={setCurrency}/>
        </div>

        {/* Upgrade prompt overlay */}
        {showUpgrade && (
          <div style={{ position:"absolute", inset:0, zIndex:20, paddingTop:36 }}>
            <UpgradePrompt
              title={upgradeReason.title}
              description={upgradeReason.description}
              onClose={() => setShowUpgrade(false)}
            />
          </div>
        )}

        {/* Panels */}
        <div style={{ position:"absolute", inset:0, paddingTop:44, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          {tab === "subscriptions" && (
            <SplitPanel id="subscriptions" onScanClick={() => setFormOpen(f => !f)}>
              <Subscriptions authContext={authContext} currency={currency} formOpen={formOpen} setFormOpen={setFormOpen}/>
            </SplitPanel>
          )}
          {tab === "warranties" && (
            <SplitPanel id="warranties" onScanClick={() => setFormOpen(f => !f)}>
              <Warranties authContext={authContext} currency={currency} formOpen={formOpen} setFormOpen={setFormOpen}/>
            </SplitPanel>
          )}
          {tab === "skills" && (
            <SplitPanel id="skills" onScanClick={() => setFormOpen(f => !f)}>
              <Skills authContext={authContext} currency={currency} formOpen={formOpen} setFormOpen={setFormOpen}/>
            </SplitPanel>
          )}
          {tab === "savings" && (
            <SplitPanel id="savings">
              <Savings authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "analytics" && (
            <SplitPanel id="analytics">
              <Analytics authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "predictions" && (
            <SplitPanel id="predictions">
              <Predictions authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "ai-advisor" && (
            <SplitPanel id="ai-advisor">
              <AIAdvisor authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "recalls" && (
            <SplitPanel id="recalls" onScanClick={() => setFormOpen(f => !f)}>
              <Recalls authContext={authContext} formOpen={formOpen} setFormOpen={setFormOpen}/>
            </SplitPanel>
          )}
          {tab === "enterprise" && (
            <SplitPanel id="enterprise">
              <Enterprise authContext={authContext}/>
            </SplitPanel>
          )}
          {tab === "tenants" && (
            <SplitPanel id="tenants" onScanClick={() => setFormOpen(f => !f)}>
              <Tenants authContext={authContext} formOpen={formOpen} setFormOpen={setFormOpen}/>
            </SplitPanel>
          )}
          {tab === "audit" && (
            <div style={{ position:"absolute", inset:0, paddingTop:52, overflow:"hidden", display:"flex", flexDirection:"column", background:"#0b0c0f" }}>
              <Audit authContext={authContext}/>
            </div>
          )}
          {tab === "security" && (
            <SplitPanel id="security">
              <Security authContext={authContext}/>
            </SplitPanel>
          )}
          {tab === "monetisation" && (
            <SplitPanel id="monetisation">
              <Monetisation authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "auth" && (
            <SplitPanel id="auth">
              <Auth authContext={authContext}/>
            </SplitPanel>
          )}
          {tab === "skills-chat" && (
            <div style={{ position:"absolute", inset:0, paddingTop:52, overflow:"hidden", display:"flex", flexDirection:"column", background:"#0b0c0f" }}>
              <SkillsChat authContext={authContext}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
