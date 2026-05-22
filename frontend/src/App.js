import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./components/Dashboard";
import { auth, loginWithEmail, logout, registerWithEmail, signInWithGoogle } from "./firebase";
import { registerPushNotifications, onForegroundMessage } from "./utils/pushNotifications";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Register push notifications after login
        await registerPushNotifications(u.uid);

        // Listen for foreground messages and show a toast
        onForegroundMessage((payload) => {
          const { title, body } = payload.notification || {};
          setToast({ title, body });
          setTimeout(() => setToast(null), 6000);
        });
      }
    });
    return unsub;
  }, []);

  const authContext = useMemo(() => ({ user, apiBaseUrl: API_BASE_URL }), [user]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
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
    }
  };

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>LifeHub</h1>
          <p className="subtitle">ReceiptVault, Subscriptions and Skills in one PWA.</p>
          <form className="auth-form" onSubmit={handleEmailAuth}>
            <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
            <input type="password" required minLength={6} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>
            <button type="submit">{isSignup ? "Create Account" : "Sign In"}</button>
          </form>
          <div className="auth-actions">
            <button type="button" onClick={signInWithGoogle}>Continue with Google</button>
          </div>
          <button className="text-button" type="button" onClick={() => setIsSignup(v => !v)}>
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
          {authError && <p className="error-text">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"68px 1fr",
      height:"100vh",
      overflow:"hidden",
    }}>
      {/* Sign out button floats top-right */}
      <div style={{
        position:"fixed",top:8,right:12,zIndex:100,
        display:"flex",alignItems:"center",gap:10,
      }}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>
          {user.displayName || user.email}
        </span>
        <button
          onClick={logout}
          style={{
            background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",
            color:"rgba(255,255,255,.4)",borderRadius:6,padding:"4px 12px",
            fontSize:12,fontFamily:"Inter,sans-serif",cursor:"pointer",
          }}
          onMouseOver={e=>{e.target.style.color="#ff5c5c";e.target.style.borderColor="rgba(255,92,92,.4)"}}
          onMouseOut={e=>{e.target.style.color="rgba(255,255,255,.4)";e.target.style.borderColor="rgba(255,255,255,.1)"}}
        >
          Sign out
        </button>
      </div>

      {/* Foreground push notification toast */}
      {toast && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:999,
          background:"#1e293b", border:"1px solid rgba(255,255,255,.12)",
          borderRadius:12, padding:"14px 18px", maxWidth:320,
          boxShadow:"0 8px 32px rgba(0,0,0,.4)",
          animation:"fadeIn .3s ease"
        }}>
          <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:4}}>
            {toast.title}
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>
            {toast.body}
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              position:"absolute",top:8,right:10,background:"none",
              border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:16
            }}
          >×</button>
        </div>
      )}

      <Dashboard authContext={authContext}/>
    </div>
  );
}

export default App;
