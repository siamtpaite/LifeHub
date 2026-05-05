import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./components/Dashboard";
import {
  auth,
  loginWithEmail,
  logout,
  registerWithEmail,
  signInWithGoogle,
} from "./firebase";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const authContext = useMemo(
    () => ({ user, apiBaseUrl: API_BASE_URL }),
    [user]
  );

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    try {
      if (isSignup) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      const messages = {
        "auth/wrong-password": "Incorrect email or password.",
        "auth/user-not-found": "Incorrect email or password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/invalid-credential": "Incorrect email or password.",
      };
      const code = error.code || "";
      setAuthError(messages[code] || "Something went wrong. Please try again.");
    }
  };

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <h1>LifeHub</h1>
          <p className="subtitle">ReceiptVault, Subscriptions and Skills in one PWA.</p>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">{isSignup ? "Create Account" : "Sign In"}</button>
          </form>

          <div className="auth-actions">
            <button type="button" onClick={() => signInWithGoogle()}>
              Continue with Google
            </button>
          </div>

          <button
            className="text-button"
            type="button"
            onClick={() => setIsSignup((v) => !v)}
          >
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>

          {authError && <p className="error-text">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>LifeHub</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <p>Welcome, {user.displayName || user.email}</p>
          <button onClick={logout} style={{ width: "auto" }}>Sign out</button>
        </div>
      </header>
      <Dashboard authContext={authContext} />
    </div>
  );
}

export default App;
