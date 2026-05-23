import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./components/Dashboard";
import {
  auth,
  completeOAuthRedirect,
  getAuthErrorMessage,
  loginWithEmail,
  logout,
  registerWithEmail,
  signInWithGoogle,
  signInWithFacebook,
} from "./firebase";
import { registerPushNotifications, onForegroundMessage } from "./utils/pushNotifications";
import { usePlan } from "./usePlan";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const FEATURES = [
  { icon: "📦", title: "Warranty Vault", desc: "Scan receipts with AI. Never miss a claim window." },
  { icon: "💳", title: "Subscriptions", desc: "Track every recurring charge. No surprise renewals." },
  { icon: "🧠", title: "Skills Exchange", desc: "Log what you know. Trade skills with your network." },
  { icon: "💰", title: "Savings Goals", desc: "Set targets, track progress, celebrate milestones." },
  { icon: "🔔", title: "Smart Alerts", desc: "Push notifications before warranties and renewals expire." },
  { icon: "🤖", title: "AI Advisor", desc: "Get personalised financial and lifestyle insights." },
];

function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, [breakpoint]);
  return isMobile;
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Best-effort redirect completion. Errors from this background check are
    // intentionally swallowed - errors from user-initiated sign-in clicks are
    // surfaced via the button handlers instead.
    completeOAuthRedirect();

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        await registerPushNotifications(u.uid);
        onForegroundMessage((payload) => {
          const { title, body } = payload.notification || {};
          setToast({ title, body });
          setTimeout(() => setToast(null), 6000);
        });
      }
    });
    return unsub;
  }, []);

  const { plan, isPro, planExpiry, planLoading } = usePlan(user);
  const authContext = useMemo(() => ({ user, apiBaseUrl: API_BASE_URL, plan, isPro, planExpiry, planLoading }), [user, plan, isPro, planExpiry, planLoading]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      if (isSignup) await registerWithEmail(email, password);
      else await loginWithEmail(email, password);
      setEmail(""); setPassword("");
    } catch (err) {
      const msgs = {
        "auth/wrong-password": "Incorrect email or password.",
        "auth/user-not-found": "Incorrect email or password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-credential": "Incorrect email or password.",
      };
      setAuthError(msgs[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "Google"));
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setAuthError("");
    setLoading(true);
    try {
      await signInWithFacebook();
      setLoading(false);
    } catch (err) {
      setAuthError(getAuthErrorMessage(err, "Facebook"));
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 20% 50%, #0d1f3c 0%, #060a14 50%, #020408 100%)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <img src="/lifehub-icon.png" alt="LifeHub" style={{ width: 48, height: 48, borderRadius: 12, opacity: 0.8 }}/>
          <div style={{ width: 24, height: 24, border: "2px solid rgba(79,142,247,0.3)", borderTop: "2px solid #4f8ef7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    const heroSection = (
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center",
        padding: isMobile ? "32px 24px 48px" : "60px 64px",
        position: "relative", overflow: "hidden",
      }}>
        {!isMobile && (
          <div style={{
            position: "absolute", top: "20%", left: "10%",
            width: 400, height: 400,
            background: "radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}/>
        )}

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
            <img src="/lifehub-icon.png" alt="LifeHub" style={{ width: 36, height: 36, borderRadius: 10 }}/>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>LifeHub</span>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#4f8ef7", marginBottom: isMobile ? 10 : 16, fontWeight: 500,
          }}>Your personal life OS</div>
          <h1 style={{
            fontSize: isMobile ? 32 : 52, fontWeight: 700, color: "#fff",
            lineHeight: 1.08, letterSpacing: isMobile ? "-0.8px" : "-1.5px",
            marginBottom: isMobile ? 14 : 20,
          }}>
            {isMobile ? (
              <>Everything about your life, <span style={{ color: "#4f8ef7" }}>in one place.</span></>
            ) : (
              <>
                Everything<br/>about your life,<br/>
                <span style={{ color: "#4f8ef7" }}>in one place.</span>
              </>
            )}
          </h1>
          <p style={{
            fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7, maxWidth: 480, fontWeight: 300,
          }}>
            LifeHub brings together your warranties, subscriptions, skills, and savings
            into a single intelligent dashboard — with AI-powered insights and smart alerts.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 12,
          marginTop: isMobile ? 24 : 40,
          maxWidth: 560,
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: isMobile ? "12px 14px" : "16px 18px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
            }}>
              <div style={{ fontSize: isMobile ? 18 : 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );

    const authPanel = (
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: isMobile ? "32px 24px" : "48px 40px",
        background: isMobile ? "transparent" : "rgba(255,255,255,0.03)",
        borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.07)",
        backdropFilter: isMobile ? "none" : "blur(20px)",
      }}>
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <img src="/lifehub-icon.png" alt="LifeHub" style={{ width: 32, height: 32, borderRadius: 8 }}/>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>LifeHub</span>
          </div>
        )}

        <h2 style={{
          fontSize: isMobile ? 22 : 24, fontWeight: 700, color: "#fff",
          letterSpacing: "-0.5px", marginBottom: 6,
        }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: isMobile ? 24 : 32, fontWeight: 300 }}>
          {isSignup ? "Start managing your life smarter." : "Sign in to your LifeHub."}
        </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%", padding: "12px 16px", marginBottom: 10,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleFacebook}
            disabled={loading}
            style={{
              width: "100%", padding: "12px 16px", marginBottom: 20,
              background: "rgba(24,119,242,0.15)", border: "1px solid rgba(24,119,242,0.3)",
              borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseOver={e => e.currentTarget.style.background = "rgba(24,119,242,0.25)"}
            onMouseOut={e => e.currentTarget.style.background = "rgba(24,119,242,0.15)"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}/>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}/>
          </div>

          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email" required placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{
                padding: "12px 14px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#fff", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <input
              type="password" required minLength={6} placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{
                padding: "12px 14px", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#fff", fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <button
              type="submit" disabled={loading}
              style={{
                padding: "12px 16px", marginTop: 4,
                background: "linear-gradient(135deg, #2979ff, #4f8ef7)",
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          {authError && (
            <p style={{ fontSize: 13, color: "#f87171", marginTop: 12, textAlign: "center" }}>{authError}</p>
          )}

          <button
            type="button" onClick={() => { setIsSignup(v => !v); setAuthError(""); }}
            style={{
              marginTop: 20, background: "none", border: "none",
              color: "#4f8ef7", fontSize: 13, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", textAlign: "center",
            }}
          >
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>

          <div style={{
            marginTop: 40, paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.8 }}>
              <a href="/docs.html" target="_blank" rel="noreferrer"
                style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>
                Docs
              </a>{" "}·{" "}
              <a href="/terms.html" target="_blank" rel="noreferrer"
                style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>
                Terms
              </a>{" "}·{" "}
              <a href="/privacy.html" target="_blank" rel="noreferrer"
                style={{ color: "rgba(255,255,255,0.45)", textDecoration: "underline" }}>
                Privacy
              </a>
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 4 }}>
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
              © 2026 LifeHub · Operated by Siam T. Paite
            </p>
          </div>
        </div>
    );

    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 50%, #0d1f3c 0%, #060a14 50%, #020408 100%)",
        display: isMobile ? "flex" : "grid",
        flexDirection: isMobile ? "column" : undefined,
        gridTemplateColumns: isMobile ? undefined : "1fr 420px",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}>
        {isMobile ? (
          <>
            {authPanel}
            {heroSection}
          </>
        ) : (
          <>
            {heroSection}
            {authPanel}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{
        position: "fixed", top: 8, right: 12, zIndex: 100,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
          {user.displayName || user.email}
        </span>
        <button
          onClick={logout}
          style={{
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
            color: "rgba(255,255,255,.4)", borderRadius: 6, padding: "4px 12px",
            fontSize: 12, fontFamily: "Inter,sans-serif", cursor: "pointer",
          }}
          onMouseOver={e => { e.target.style.color = "#ff5c5c"; e.target.style.borderColor = "rgba(255,92,92,.4)"; }}
          onMouseOut={e => { e.target.style.color = "rgba(255,255,255,.4)"; e.target.style.borderColor = "rgba(255,255,255,.1)"; }}
        >
          Sign out
        </button>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: "#1e293b", border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 12, padding: "14px 18px", maxWidth: 320,
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{toast.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{toast.body}</div>
          <button onClick={() => setToast(null)} style={{
            position: "absolute", top: 8, right: 10, background: "none",
            border: "none", color: "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 16,
          }}>×</button>
        </div>
      )}

      <Dashboard authContext={authContext} />
    </div>
  );
}

export default App;
