import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthScreen() {
  const { signup, login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError(mode === "signup" ? "Enter your name, email and password." : "Enter an email and password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") await signup(name, email, password);
      else await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="authScreen">
      <div className="auth-brand">
        <div className="brand-mark">
          Drift<span>.</span>
        </div>
        <div className="brand-tag">
          A focused task space for your day — plan, star what matters, and clear your list without the noise.
        </div>
        <div className="brand-list">
          <div>
            <div className="brand-dot" />
            My Day, Important &amp; Planned views
          </div>
          <div>
            <div className="brand-dot" />
            Steps, due dates &amp; reminders per task
          </div>
          <div>
            <div className="brand-dot" />
            Your own lists, saved to your account
          </div>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
          <p className="sub">
            {mode === "signin" ? "Sign in to pick up where you left off." : "Set up Drift — takes a few seconds."}
          </p>

          {mode === "signup" && (
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <button className="auth-submit" disabled={busy} onClick={submit}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <div className="auth-error">{error}</div>

          <div className="auth-switch">
            <span>{mode === "signin" ? "New here?" : "Already have an account?"}</span>{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create an account" : "Sign in instead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
