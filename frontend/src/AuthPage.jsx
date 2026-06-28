import { useState, useEffect } from "react";
import "./AuthPage.css";

export default function AuthPage({ initialMode = "login", onNavigate, onLoginSuccess, apiBaseUrl }) {
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Sync mode with props if it changes externally
  useEffect(() => {
    setMode(initialMode);
    // Reset form states when switching mode
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    });
    setErrors({});
    setSubmitSuccess(false);
    setApiError(null);
  }, [initialMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the Terms of Service";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(mode === "signup" && { name: formData.name })
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      setTimeout(() => {
        onLoginSuccess(data.user, data.access_token);
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      setApiError(err.message || "Connection refused. Make sure backend server is running.");
    }
  };

  const toggleMode = () => {
    const nextMode = mode === "login" ? "signup" : "login";
    setMode(nextMode);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    });
    setErrors({});
    setSubmitSuccess(false);
    setApiError(null);
  };

  return (
    <div className="auth-container">
      {/* Left panel - Visual Sidebar */}
      <div className="auth-sidebar">
        <div className="sidebar-brand" onClick={() => onNavigate("home")}>
          <span className="sidebar-pip" />
          FoodDescAI
        </div>
        <div className="sidebar-content">
          <h2 className="sidebar-title">Empower Your Food Brand With AI</h2>
          <p className="sidebar-desc">
            Join thousands of food processors, packers, and grocery sellers who write high-converting, platform-compliant copy in seconds.
          </p>

          <div className="sidebar-features">
            <div className="sidebar-feature-item">
              <span className="feature-icon">✨</span>
              <div>
                <h4>Multiple Writing Tones</h4>
                <p>Choose from Traditional, Premium, or Health-focused tones to target your audience.</p>
              </div>
            </div>
            <div className="sidebar-feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h4>SEO-Optimized Metadata</h4>
                <p>Instantly include key search tags for Amazon, Flipkart, and Shopify indexers.</p>
              </div>
            </div>
            <div className="sidebar-feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <h4>FSSAI-Ready Claims</h4>
                <p>Ensure labels and claims respect standards and emphasize nutritional value.</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <span className="card-badge">Preview</span>
              <span className="card-tag">Premium Tone</span>
            </div>
            <p className="card-quote">
              "Handcrafted from the high altitudes of the Himalayas, this pure pink crystal salt preserves 84 essential minerals for your wellness..."
            </p>
          </div>
        </div>
        <div className="sidebar-footer">
          © {new Date().getFullYear()} FoodDescAI. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form View */}
      <div className="auth-form-panel">
        <div className="auth-header-mobile">
          <div className="mobile-brand" onClick={() => onNavigate("home")}>
            <span className="sidebar-pip" />
            FoodDescAI
          </div>
        </div>

        <div className="auth-form-card">
          <a href="#home" className="back-link" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>
            ← Back to website
          </a>

          <h1 className="auth-title">
            {mode === "login" ? "Sign in to FoodDescAI" : "Create your account"}
          </h1>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your dashboard and historical descriptions."
              : "Start writing professional product listings for free today."}
          </p>

          {/* Toggle Switcher */}
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`toggle-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`toggle-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {submitSuccess ? (
            <div className="auth-success-screen">
              <div className="success-icon-wrap">
                <span className="success-icon">✓</span>
              </div>
              <h3>Success!</h3>
              <p>
                {mode === "login"
                  ? "Welcome back! Redirecting you to the home page..."
                  : "Account created successfully! Logging you in..."}
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              {apiError && (
                <div className="api-error-banner" style={{
                  background: '#fff5f5',
                  color: '#e53e3e',
                  border: '1px solid #fed7d7',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '8px' }}>⚠️</span> {apiError}
                </div>
              )}
              {mode === "signup" && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              {mode === "signup" && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={errors.confirmPassword ? "input-error" : ""}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div className="form-checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">
                      I agree to the <a href="#terms">Terms of Service</a> and{" "}
                      <a href="#privacy">Privacy Policy</a>.
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <span className="error-text block-error">{errors.agreeToTerms}</span>
                  )}
                </div>
              )}

              {mode === "login" && (
                <div className="forgot-password-link">
                  <a href="#forgot">Forgot password?</a>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner-loader"></span>
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="auth-footer-prompt">
            {mode === "login" ? (
              <span>
                New to FoodDescAI?{" "}
                <button type="button" className="link-btn" onClick={toggleMode}>
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button type="button" className="link-btn" onClick={toggleMode}>
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
