import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', sans-serif; background: #FAF8F3; color: #1C1C1A; -webkit-font-smoothing: antialiased; }

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 860px) { .auth-shell { grid-template-columns: 1fr; } }

/* ── BRAND PANEL ── */
.brand-panel {
  background: #1A3A2A;
  padding: 48px 52px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}
.brand-panel::after {
  content: ''; position: absolute; bottom: -110px; left: -80px;
  width: 340px; height: 340px; border-radius: 50%;
  border: 52px solid rgba(212,133,26,.08); pointer-events: none;
}
@media (max-width: 860px) {
  .brand-panel { padding: 24px 6%; }
  .brand-mid, .brand-quote, .brand-stats { display: none; }
}
.brand-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 19px; color: #fff;
  display: flex; align-items: center; gap: 9px; text-decoration: none;
}
.brand-pip { width: 8px; height: 8px; border-radius: 50%; background: #D4851A; flex-shrink: 0; }
.brand-mid { margin-top: 56px; }
.brand-headline {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px, 2.5vw, 32px); font-weight: 400; line-height: 1.28;
  color: #fff; max-width: 340px; margin-bottom: 12px;
  transition: opacity .25s;
}
.brand-sub { font-size: 13.5px; color: rgba(255,255,255,.55); line-height: 1.7; max-width: 320px; transition: opacity .25s; }
.brand-quote {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  border-radius: 10px; padding: 16px 18px; margin-top: 32px; max-width: 340px;
}
.brand-quote-text {
  font-family: 'DM Serif Display', serif; font-style: italic;
  font-size: 13px; color: rgba(255,255,255,.8); line-height: 1.65; margin-bottom: 10px;
}
.brand-quote-author { font-size: 12px; color: #D4851A; font-weight: 500; }
.brand-quote-role { font-size: 11.5px; color: rgba(255,255,255,.38); margin-top: 1px; }
.brand-stats { display: flex; gap: 32px; }
.bs-n { font-family: 'DM Serif Display', serif; font-size: 22px; color: #fff; line-height: 1; margin-bottom: 3px; }
.bs-l { font-size: 11px; color: rgba(255,255,255,.4); }

/* ── FORM PANEL ── */
.form-panel {
  display: flex; align-items: center; justify-content: center;
  padding: 48px 8%; background: #FAF8F3;
}
@media (max-width: 860px) { .form-panel { padding: 32px 6% 56px; } }
.form-card { width: 100%; max-width: 370px; }

/* Toggle */
.toggle-wrap {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
  background: #EFEBE0; border-radius: 8px; padding: 4px; margin-bottom: 28px;
}
.toggle-pill {
  position: absolute; top: 4px; left: 4px;
  width: calc(50% - 4px); height: calc(100% - 8px);
  background: #fff; border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,.09);
  transition: transform .28s cubic-bezier(.4,0,.2,1);
}
.toggle-pill.signup { transform: translateX(100%); }
.toggle-btn {
  position: relative; z-index: 1; background: none; border: none; cursor: pointer;
  font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500;
  padding: 9px 0; border-radius: 6px; color: #8B897F; transition: color .2s;
}
.toggle-btn.active { color: #1C1C1A; }

.form-head { margin-bottom: 22px; }
.form-title { font-family: 'DM Serif Display', serif; font-size: 24px; font-weight: 400; color: #1C1C1A; margin-bottom: 5px; }
.form-sub { font-size: 13px; color: #6B6B67; }

/* Fields */
.field-group { margin-bottom: 15px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.field-label { display: block; font-size: 12.5px; font-weight: 500; color: #3A3936; margin-bottom: 5px; }
.field-input {
  width: 100%; font-family: 'Inter', sans-serif; font-size: 13.5px;
  padding: 10px 12px; background: #fff;
  border: 1px solid #E4E2DC; border-radius: 7px; color: #1C1C1A;
  transition: border-color .15s, box-shadow .15s;
}
.field-input::placeholder { color: #B8B6AE; }
.field-input:focus { outline: none; border-color: #D4851A; box-shadow: 0 0 0 3px rgba(212,133,26,.12); }
.field-input.error { border-color: #DC2626; }

.pw-wrap { position: relative; }
.pw-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  font-size: 11.5px; color: #8B897F; font-family: 'Inter', sans-serif; padding: 2px;
}
.pw-toggle:hover { color: #1C1C1A; }

.field-error { font-size: 11.5px; color: #DC2626; margin-top: 4px; }

/* Options row */
.form-options { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; font-size: 12.5px; }
.check-label { display: flex; align-items: center; gap: 7px; color: #6B6B67; cursor: pointer; }
.check-label input { accent-color: #D4851A; width: 14px; height: 14px; cursor: pointer; }
.link-saf { color: #D4851A; text-decoration: none; font-weight: 500; cursor: pointer; }
.link-saf:hover { text-decoration: underline; }

/* Submit */
.btn-submit {
  width: 100%; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
  background: #1A3A2A; color: #fff; padding: 12px 0; border-radius: 7px;
  border: none; cursor: pointer; transition: background .15s, opacity .15s;
  margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-submit:hover:not(:disabled) { background: #243F30; }
.btn-submit:disabled { opacity: .65; cursor: not-allowed; }

/* Spinner */
.btn-spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  animation: spin .7s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* API error banner */
.api-error {
  background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 7px;
  padding: 10px 13px; font-size: 13px; color: #B91C1C;
  margin-bottom: 16px; line-height: 1.5;
}

/* Divider */
.divider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.divider-line { flex: 1; height: 1px; background: #E4E2DC; }
.divider-text { font-size: 11.5px; color: #B8B6AE; white-space: nowrap; }

/* Google button */
.btn-google {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500;
  background: #fff; color: #1C1C1A; padding: 11px 0; border-radius: 7px;
  border: 1px solid #E4E2DC; cursor: pointer;
  transition: background .15s, border-color .15s;
}
.btn-google:hover { background: #F5F3EE; border-color: #D0CDCA; }

.form-foot { text-align: center; font-size: 13px; color: #6B6B67; margin-top: 20px; }
.terms-text { font-size: 11.5px; color: #8B897F; line-height: 1.6; margin-top: 14px; text-align: center; }
`;

/* ─────────────────────────────────────────────
   GOOGLE ICON
───────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   PASSWORD FIELD
───────────────────────────────────────────── */
function PasswordField({ label, id, placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field-group">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="pw-wrap">
        <input
          id={id}
          className={`field-input${error ? " error" : ""}`}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: 52 }}
          autoComplete={id === "pw-login" ? "current-password" : "new-password"}
        />
        <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────────── */
function LoginForm({ apiBaseUrl, onLoginSuccess }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password)        e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.detail || "Login failed. Please check your credentials.");
        return;
      }
      // Persist token based on remember-me preference
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.access_token);
      storage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess(data.user, data.access_token);
    } catch {
      setApiError("Unable to reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && <div className="api-error">⚠ {apiError}</div>}
      <div className="field-group">
        <label className="field-label" htmlFor="email-login">Email address</label>
        <input
          id="email-login"
          className={`field-input${errors.email ? " error" : ""}`}
          type="email"
          placeholder="you@business.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <PasswordField
        label="Password" id="pw-login"
        placeholder="Enter your password"
        value={password} onChange={e => setPassword(e.target.value)}
        error={errors.password}
      />
      <div className="form-options">
        <label className="check-label">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Remember me
        </label>
        <span className="link-saf">Forgot password?</span>
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading && <span className="btn-spinner" />}
        {loading ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────
   SIGNUP FORM
───────────────────────────────────────────── */
function SignupForm({ apiBaseUrl, onLoginSuccess }) {
  const [name, setName]         = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [updates, setUpdates]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim())     e.name     = "Full name is required";
    if (!email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password)        e.password = "Password is required";
    else if (password.length < 8)  e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.detail || "Signup failed. Please try again.");
        return;
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess(data.user, data.access_token);
    } catch {
      setApiError("Unable to reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && <div className="api-error">⚠ {apiError}</div>}
      <div className="field-group field-row">
        <div>
          <label className="field-label" htmlFor="name-signup">Full name</label>
          <input
            id="name-signup" className={`field-input${errors.name ? " error" : ""}`}
            type="text" placeholder="Your name"
            value={name} onChange={e => setName(e.target.value)}
            autoComplete="name"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="biz-signup">Business name</label>
          <input
            id="biz-signup" className="field-input"
            type="text" placeholder="Your brand"
            value={business} onChange={e => setBusiness(e.target.value)}
          />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="email-signup">Email address</label>
        <input
          id="email-signup" className={`field-input${errors.email ? " error" : ""}`}
          type="email" placeholder="you@business.com"
          value={email} onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>
      <PasswordField
        label="Password" id="pw-signup"
        placeholder="At least 8 characters"
        value={password} onChange={e => setPassword(e.target.value)}
        error={errors.password}
      />
      <div className="form-options" style={{ justifyContent: "flex-start" }}>
        <label className="check-label">
          <input type="checkbox" checked={updates} onChange={e => setUpdates(e.target.checked)} />
          Send me product tips and updates
        </label>
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading && <span className="btn-spinner" />}
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────
   BRAND PANEL
───────────────────────────────────────────── */
function BrandPanel({ mode }) {
  const isLogin = mode === "login";
  return (
    <div className="brand-panel">
      <a href="#" className="brand-logo">
        <span className="brand-pip" /> FoodDescAI
      </a>
      <div className="brand-mid">
        <h1 className="brand-headline">
          {isLogin ? "Welcome back to your listings" : "Write listings your buyers actually trust"}
        </h1>
        <p className="brand-sub">
          {isLogin
            ? "Sign in to access your saved descriptions, tone presets, and product history."
            : "Join food businesses using FoodDescAI to generate accurate, e-commerce-ready descriptions in minutes."}
        </p>
        <div className="brand-quote">
          <p className="brand-quote-text">
            "We listed 40 SKUs on Flipkart in a single afternoon. The Traditional tone matched our brand voice without any editing."
          </p>
          <div className="brand-quote-author">Meena Agarwal</div>
          <div className="brand-quote-role">Founder, Agarwal Pickles &amp; Preserves</div>
        </div>
      </div>
      <div className="brand-stats">
        <div><div className="bs-n">3</div><div className="bs-l">Writing tones</div></div>
        <div><div className="bs-n">&lt; 60s</div><div className="bs-l">Avg. generation</div></div>
        <div><div className="bs-n">2</div><div className="bs-l">Marketplaces</div></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AuthPage({
  initialMode   = "login",
  onNavigate,
  onLoginSuccess,
  apiBaseUrl    = process.env.REACT_APP_API_URL || "http://localhost:8000",
}) {
  const [mode, setMode] = useState(initialMode);

  // Sync if parent changes initialMode (e.g. "Sign up" click from homepage)
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  // Handle Google OAuth redirect
  const handleGoogleLogin = () => {
    // Redirect browser to backend Google OAuth initiation endpoint.
    // The backend redirects to Google, which redirects back to
    // /api/auth/google/callback, which then redirects to the frontend
    // with the token in the URL hash or query string.
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  // On mount: check if we're returning from a Google OAuth callback
  // (backend redirects to FRONTEND_URL/?token=xxx after successful OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const error  = params.get("error");
    if (error) {
      // surface google error; nothing to do here, the form will show normally
      console.warn("Google OAuth error:", error);
    }
    if (token) {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Fetch /me to get user object
      fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(user => {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          onLoginSuccess(user, token);
        })
        .catch(console.error);
    }
  }, [apiBaseUrl, onLoginSuccess]);

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-shell">
        <BrandPanel mode={mode} />

        <div className="form-panel">
          <div className="form-card">
            {/* Toggle */}
            <div className="toggle-wrap">
              <div className={`toggle-pill${mode === "signup" ? " signup" : ""}`} />
              <button
                type="button"
                className={`toggle-btn${mode === "login" ? " active" : ""}`}
                onClick={() => setMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={`toggle-btn${mode === "signup" ? " active" : ""}`}
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </div>

            <div className="form-head">
              <h2 className="form-title">
                {mode === "login" ? "Log in to your account" : "Create your account"}
              </h2>
              <p className="form-sub">
                {mode === "login"
                  ? "Enter your details to access your dashboard."
                  : "Start generating product descriptions in minutes."}
              </p>
            </div>

            {mode === "login" ? (
              <LoginForm apiBaseUrl={apiBaseUrl} onLoginSuccess={onLoginSuccess} />
            ) : (
              <SignupForm apiBaseUrl={apiBaseUrl} onLoginSuccess={onLoginSuccess} />
            )}

            {/* Divider */}
            <div className="divider-row">
              <div className="divider-line" />
              <span className="divider-text">or continue with</span>
              <div className="divider-line" />
            </div>

            {/* Google Sign-In */}
            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="form-foot">
              {mode === "login" ? (
                <>Don't have an account?{" "}
                  <span className="link-saf" onClick={() => setMode("signup")}>Sign up</span>
                </>
              ) : (
                <>Already have an account?{" "}
                  <span className="link-saf" onClick={() => setMode("login")}>Log in</span>
                </>
              )}
            </p>

            {mode === "signup" && (
              <p className="terms-text">
                By creating an account you agree to FoodDescAI's{" "}
                <span className="link-saf">Terms of Service</span> and{" "}
                <span className="link-saf">Privacy Policy</span>.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
