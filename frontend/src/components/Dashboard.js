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
    <rect x="94" y="88" width="72" height="72" rx="6" fill="rgba(255,255,255,.15)"/>
    <rect x="94" y="88" width="72" height="16" rx="6" fill="rgba(255,255,255,.25)"/>
    <rect x="104" y="114" width="12" height="12" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="124" y="114" width="12" height="12" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="144" y="114" width="12" height="12" rx="2" fill="rgba(255,255,255,.4)"/>
    <rect x="114" y="136" width="12" height="24" rx="2" fill="rgba(255,255,255,.5)"/>
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
    <circle cx="106" cy="100" r="20" fill="rgba(255,255,255,.3)"/>
    <circle cx="154" cy="100" r="20" fill="rgba(255,255,255,.2)"/>
    <circle cx="130" cy="115" r="16" fill="rgba(255,255,255,.4)"/>
    <path d="M82 150 C82 136 93 126 106 126" stroke="rgba(255,255,255,.4)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M178 150 C178 136 167 126 154 126" stroke="rgba(255,255,255,.3)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M110 148 C110 136 119 131 130 131 C141 131 150 136 150 148" fill="rgba(255,255,255,.35)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#tnf)"/>
  </svg>
);

const EmeraldSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="secg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#6ee7b7"/><stop offset="45%" stopColor="#059669"/><stop offset="100%" stopColor="#011c0e"/>
      </radialGradient>
      <filter id="secf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#059669" opacity=".22" filter="url(#secf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#secg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(110,231,183,.45)" opacity=".7"/>
    <rect x="100" y="110" width="60" height="48" rx="8" fill="rgba(255,255,255,.25)"/>
    <path d="M112 110 L112 98 C112 86 148 86 148 98 L148 110" stroke="rgba(255,255,255,.6)" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <circle cx="130" cy="132" r="8" fill="rgba(255,255,255,.7)"/>
    <rect x="127" y="133" width="6" height="12" rx="3" fill="rgba(255,255,255,.7)"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#secf)"/>
  </svg>
);

const GoldSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="mong" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#fcd34d"/><stop offset="45%" stopColor="#b45309"/><stop offset="100%" stopColor="#1a0800"/>
      </radialGradient>
      <filter id="monf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#b45309" opacity=".22" filter="url(#monf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#mong)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(252,211,77,.45)" opacity=".7"/>
    <circle cx="130" cy="118" r="44" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.4)" strokeWidth="4"/>
    <text x="130" y="128" textAnchor="middle" fontSize="36" fontWeight="bold" fill="rgba(255,255,255,.85)" fontFamily="Inter,sans-serif">$</text>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#monf)"/>
  </svg>
);

const PurpleSphere = () => (
  <svg width="260" height="260" viewBox="0 0 260 260" fill="none">
    <defs>
      <radialGradient id="authg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stopColor="#e9d5ff"/><stop offset="45%" stopColor="#7e22ce"/><stop offset="100%" stopColor="#0e021e"/>
      </radialGradient>
      <filter id="authf"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <ellipse cx="130" cy="178" rx="88" ry="38" fill="#7e22ce" opacity=".22" filter="url(#authf)"/>
    <circle cx="130" cy="118" r="108" fill="url(#authg)"/>
    <ellipse cx="94" cy="72" rx="52" ry="29" fill="rgba(233,213,255,.45)" opacity=".7"/>
    <circle cx="130" cy="105" r="26" fill="rgba(255,255,255,.25)"/>
    <path d="M104 152 C104 134 116 126 130 126 C144 126 156 134 156 152" fill="rgba(255,255,255,.2)"/>
    <path d="M146 110 L158 110 L158 98" stroke="rgba(255,255,255,.7)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <ellipse cx="130" cy="236" rx="74" ry="13" fill="rgba(0,0,0,.4)" filter="url(#authf)"/>
  </svg>
);

/* ── NAV CONFIG ── */
const NAV = [
  { id:"subscriptions", label:"Subscriptions", glow:"linear-gradient(135deg,#15803d,#4ade80)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M16 4v5"/></svg> },
  { id:"warranties", label:"ReceiptVault", glow:"linear-gradient(135deg,#1d4ed8,#60a5fa)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"/></svg> },
  { id:"skills", label:"Skills", glow:"linear-gradient(135deg,#6d28d9,#a78bfa)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  { id:"savings", label:"Savings", glow:"linear-gradient(135deg,#b45309,#fbbf24)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/></svg> },
  { sep:true },
  { id:"analytics", label:"Analytics", glow:"linear-gradient(135deg,#0284c7,#38bdf8)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg> },
  { id:"predictions", label:"Predictions", glow:"linear-gradient(135deg,#9d174d,#f472b6)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id:"recalls", label:"Recalls", glow:"linear-gradient(135deg,#b91c1c,#f87171)", dot:"#f87171", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { sep:true },
  { id:"enterprise", label:"Enterprise", glow:"linear-gradient(135deg,#4338ca,#818cf8)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id:"tenants", label:"Tenants", glow:"linear-gradient(135deg,#0f766e,#2dd4bf)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="17" cy="21" r="3"/><circle cx="7" cy="21" r="3"/><path d="M7 18V9a4 4 0 0 1 8 0v1"/><path d="M5 10H3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/></svg> },
  { id:"audit", label:"Audit Logs", glow:"linear-gradient(135deg,#475569,#94a3b8)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id:"security", label:"Security", glow:"linear-gradient(135deg,#059669,#34d399)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> },
  { id:"monetisation", label:"Subscription", glow:"linear-gradient(135deg,#92400e,#f59e0b)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/></svg> },
  { id:"auth", label:"Auth", glow:"linear-gradient(135deg,#7e22ce,#c084fc)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3"/></svg> },
  { sep:true },
  { id:"ai-advisor", label:"AI Advisor", glow:"linear-gradient(135deg,#4c1d95,#a78bfa)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 16v-4M12 8h.01"/></svg> },
  { id:"skills-chat", label:"Skills Chat", glow:"linear-gradient(135deg,#0f766e,#2dd4bf)", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const SPHERES = {
  subscriptions:<GreenSphere/>, warranties:<BlueSphere/>, skills:<VioletSphere/>,
  savings:<AmberSphere/>, analytics:<SkySphere/>, predictions:<PinkSphere/>,
  recalls:<RedSphere/>, enterprise:<IndigoSphere/>, tenants:<TealSphere/>,
  audit:null, security:<EmeraldSphere/>, monetisation:<GoldSphere/>, auth:<PurpleSphere/>,
  "ai-advisor":<VioletSphere/>, "skills-chat":null,
};

const THEMES = {
  subscriptions:"theme-green", warranties:"theme-blue", skills:"theme-violet",
  savings:"theme-amber", analytics:"theme-sky", predictions:"theme-pink",
  recalls:"theme-red", enterprise:"theme-indigo", tenants:"theme-teal",
  audit:"theme-slate", security:"theme-emerald", monetisation:"theme-gold", auth:"theme-purple",
  "ai-advisor":"theme-violet", "skills-chat":"theme-teal",
};

const SCANS = {
  subscriptions:"radial-gradient(circle at 40% 35%,#4ade80,#15803d)",
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

function Dashboard({ authContext }) {
  const [tab, setTab] = useState("subscriptions");
  const [currency, setCurrency] = useState("INR");
  const [formOpen, setFormOpen] = useState(false);

  const theme = THEMES[tab] || "theme-green";

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">
        {NAV.map((item, i) => {
          if (item.sep) return <div key={i} className="sidebar-sep"/>;
          return (
            <button
              key={item.id}
              title={item.label}
              className={`nav-item ${tab === item.id ? "active" : ""}`}
              onClick={() => { setTab(item.id); setFormOpen(false); }}
              style={tab === item.id ? { background:item.glow, color:"#fff", boxShadow:`0 0 12px rgba(0,0,0,.3)` } : {}}
            >
              {item.icon}
              {item.dot && <div className="nav-dot" style={{ background:item.dot }}/>}
            </button>
          );
        })}
      </aside>

      {/* MAIN */}
      <div className={`card ${theme}`} style={{ position:"relative", overflow:"hidden" }}>
        {/* Slim currency bar */}
        <div style={{ position:"absolute",top:0,left:0,right:0,zIndex:5,padding:"6px 16px",background:"rgba(0,0,0,.2)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:8 }}>
          <Localization apiBaseUrl={authContext.apiBaseUrl} onCurrencyChange={setCurrency}/>
        </div>

        {/* Panels */}
        <div style={{ position:"absolute", inset:0, paddingTop:36, overflow:"hidden", display:"flex", flexDirection:"column" }}>

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
            <div className="full-panel theme-slate" style={{ paddingTop:12 }}>
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
          {tab === "ai-advisor" && (
            <SplitPanel id="ai-advisor">
              <AIAdvisor authContext={authContext} currency={currency}/>
            </SplitPanel>
          )}
          {tab === "skills-chat" && (
            <div className="full-panel theme-teal" style={{ padding:0 }}>
              <SkillsChat authContext={authContext}/>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
