import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Dashboard from "./components/Dashboard";
import {
  auth,
  loginWithEmail,
  logout,
  registerWithEmail,
  signInWithGoogle
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
    () => ({
      user,
      apiBaseUrl: API_BASE_URL
    }),
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
      setAuthError(error.message);
    }
  };

  if (!user) {
    return (
      <main className="app-shell auth-shell">
        <section className="card auth-card">
          <h1>LifeHub</h1>
          <p className="subtitle">ReceiptVault, Subscriptions and Skills in one PWA.</p>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="submit">{isSignup ? "Create Account" : "Sign In"}</button>
          </form>

          <div className="auth-actions">
            <button type="button" onClick={() => signInWithGoogle()}>
              Continue with Google
            </button>
          </div>

          <button className="text-button" type="button" onClick={() => setIsSignup((v) => !v)}>
            {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>

          {authError && <p className="error-text">{authError}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>LifeHub</h1>
          <p className="subtitle">Welcome, {user.displayName || user.email}</p>
        </div>
        <button onClick={logout}>Sign out</button>
      </header>
      <Dashboard authContext={authContext} />
    </main>
  );
}

export default App;
