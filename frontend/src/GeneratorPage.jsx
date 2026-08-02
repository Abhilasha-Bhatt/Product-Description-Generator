import { useState, useEffect, useCallback } from "react";
import "./GeneratorPage.css";

const TEMPLATE_LOADER_STEPS = [
  "🔍 Analyzing ingredients and product specifications...",
  "✍️  Drafting marketing hooks and headers...",
  "⚡ Injecting platform SEO keywords and tags...",
  "✨ Polishing copy and formatting listing...",
];

const AI_LOADER_STEPS = [
  "🔍 Analyzing ingredients and product specifications...",
  "🧠 Consulting Google Gemini AI for custom copy...",
  "⚡ Injecting platform SEO keywords and tags...",
  "✨ Formatting listing and polishing copy...",
];

export default function GeneratorPage({ onNavigate, currentUser, apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000" }) {
  const [productName, setProductName] = useState("");
  const [brandName,   setBrandName]   = useState("");
  const [ingredients, setIngredients] = useState("");
  const [tone,        setTone]        = useState("premium");
  const [platform,    setPlatform]    = useState("amazon");

  const [errors,        setErrors]        = useState({});
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [generatingStep,setGeneratingStep]= useState(0);
  const [output,        setOutput]        = useState(null);
  const [activeTab,     setActiveTab]     = useState("description");
  const [copiedField,   setCopiedField]   = useState(null);
  const [geminiConfigured, setGeminiConfigured] = useState(true);
  const [engine,        setEngine]        = useState("template");
  const [toast,         setToast]         = useState({ show: false, message: "" });

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
  };

  // Sync engine choice when gemini configuration status is fetched
  useEffect(() => {
    if (geminiConfigured) {
      setEngine("ai");
    } else {
      setEngine("template");
    }
  }, [geminiConfigured]);

  const loaderSteps = engine === "ai" ? AI_LOADER_STEPS : TEMPLATE_LOADER_STEPS;

  // Auto-hide toast
  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  // Save-listing state
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveMessage,  setSaveMessage]  = useState("");
  const [showSaveMsg,  setShowSaveMsg]  = useState(false);

  // Auto-hide copy indicator
  useEffect(() => {
    if (!copiedField) return;
    const t = setTimeout(() => setCopiedField(null), 2000);
    return () => clearTimeout(t);
  }, [copiedField]);

  // Loader step animation while generating
  useEffect(() => {
    if (!isGenerating) { setGeneratingStep(0); return; }
    const interval = setInterval(() => {
      setGeneratingStep(prev => (prev < loaderSteps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [isGenerating, loaderSteps.length]);

  // Auto-hide save message
  useEffect(() => {
    if (!showSaveMsg) return;
    const t = setTimeout(() => setShowSaveMsg(false), 3000);
    return () => clearTimeout(t);
  }, [showSaveMsg]);

  // Check AI backend config on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/ai/config`);
        if (!mounted) return;
        const data = await res.json();
        setGeminiConfigured(res.ok && data.configured);
      } catch (e) {
        if (!mounted) return;
        setGeminiConfigured(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiBaseUrl]);

  const validateForm = () => {
    const e = {};
    if (!productName.trim()) e.productName = "Product name is required";
    if (!ingredients.trim()) e.ingredients = "Please enter key ingredients or features";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  /* ── Generate listing ── */
  const handleGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateForm()) return;

    setIsGenerating(true);
    setOutput(null);

    const selectedEngine = geminiConfigured ? engine : "template";
    const endpoint = selectedEngine === "ai" ? "/api/ai/generate" : "/api/generate";

    const doRequest = async (url) => {
      const res = await fetch(`${apiBaseUrl}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          brandName: brandName.trim(),
          ingredients: ingredients.trim(),
          tone,
          platform,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      return { res, data };
    };

    try {
      const primary = await doRequest(endpoint);
      if (!primary.res.ok) {
        const errMsg = primary.data.detail || "Generation failed. Please try again.";

        const shouldFallback = selectedEngine === "ai" && (
          primary.res.status === 429 ||
          primary.res.status === 502 ||
          errMsg.toLowerCase().includes("gemini") ||
          errMsg.toLowerCase().includes("high demand")
        );

        if (shouldFallback) {
          showToast("Gemini AI is temporarily unavailable. Falling back to template generation.");
          const fallback = await doRequest("/api/generate");
          if (!fallback.res.ok) {
            const fallbackMsg = fallback.data.detail || "Template fallback also failed. Please try again later.";
            showToast(fallbackMsg);
            return;
          }
          setOutput(fallback.data);
          setActiveTab("description");
          return;
        }

        showToast(errMsg);
        return;
      }

      setOutput(primary.data);
      setActiveTab("description");
    } catch (error) {
      const errMsg = "Cannot reach the server. Make sure the backend is running on " + apiBaseUrl;
      showToast(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Save listing (requires auth) ── */
  const handleSave = async () => {
    if (!output) return;
    if (!currentUser) {
      onNavigate("auth", "login");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/listings`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          productName:  productName.trim(),
          brandName:    brandName.trim(),
          ingredients:  ingredients.trim(),
          tone,
          platform,
          title:        output.title,
          description:  output.description,
          bullets:      output.bullets,
          keywords:     output.keywords,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveMessage(data.detail || "Save failed.");
      } else {
        setSaveMessage("✓ Listing saved to your history!");
      }
    } catch {
      setSaveMessage("Network error — listing not saved.");
    } finally {
      setIsSaving(false);
      setShowSaveMsg(true);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(fieldName);
  };

  const copyAll = () => {
    if (!output) return;
    const text = `TITLE:\n${output.title}\n\nDESCRIPTION:\n${output.description}\n\nBULLET POINTS:\n${output.bullets.join("\n")}\n\nKEYWORDS:\n${output.keywords}`;
    copyToClipboard(text, "all");
  };

  const TONES = [
    { id: "premium",     icon: "✨", name: "Premium",     desc: "Luxury & artisanal positioning" },
    { id: "traditional", icon: "🌾", name: "Traditional", desc: "Heritage & authentic recipes" },
    { id: "health",      icon: "🥗", name: "Health",      desc: "Clean label & wellness focus" },
  ];

  const PLATFORMS = [
    { id: "amazon",   label: "Amazon" },
    { id: "flipkart", label: "Flipkart" },
    { id: "shopify",  label: "Shopify" },
    { id: "general",  label: "General" },
  ];

  return (
    <div className="gen-workspace">
      {/* ── Header ── */}
      <header className="gen-header">
        <div className="gen-header-left">
          <a
            href="#home"
            className="gen-back-home"
            onClick={e => { e.preventDefault(); onNavigate("home"); }}
          >
            ← Home
          </a>
          <span className="gen-header-divider">/</span>
          <div className="gen-brand-logo">
            <span className="gen-pip" />
            FoodDescAI Workspace
          </div>
        </div>
        <div className="gen-header-right">
          <div className="workspace-badge">
            {currentUser ? `👤 ${currentUser.name}` : "⚡ Free Plan"}
          </div>
          <div style={{ position: "relative" }}>
            <button
              className="save-workspace-btn"
              onClick={handleSave}
              disabled={!output || isSaving}
            >
              {isSaving ? "Saving…" : "💾 Save Listing"}
            </button>
            {showSaveMsg && (
              <div className="tooltip-alert">{saveMessage}</div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="gen-body">
        {/* LEFT — Form */}
        <section className="gen-sidebar-form">
          <div className="form-card">
            <h2>Product Details</h2>
            <p className="form-desc">
              Fill in your product information below. The more detail you provide, the better the output.
            </p>

            <form className="workspace-form" onSubmit={handleGenerate} noValidate>
              {/* Engine Toggle */}
              <div className="engine-toggle-container">
                <span className="engine-label">Generation Mode</span>
                <div className="engine-toggle-pills">
                  <button
                    type="button"
                    className={`engine-pill-btn${engine === "template" ? " active" : ""}`}
                    onClick={() => setEngine("template")}
                  >
                    📄 Template Mode
                  </button>
                  <button
                    type="button"
                    className={`engine-pill-btn${engine === "ai" ? " active" : ""}`}
                    onClick={() => {
                      if (geminiConfigured) {
                        setEngine("ai");
                      } else {
                        showToast("Gemini AI is not configured on the server. Please check the backend .env file.");
                      }
                    }}
                    disabled={!geminiConfigured}
                    title={!geminiConfigured ? "Gemini is not configured on server" : "Generate with AI"}
                  >
                    ⚡ Gemini AI Mode
                  </button>
                </div>
              </div>
              {/* Product Name */}
              <div className="gen-group">
                <label htmlFor="pname">Product Name</label>
                <input
                  id="pname"
                  type="text"
                  placeholder="e.g. Cold-Pressed Mustard Oil"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className={errors.productName ? "gen-error-input" : ""}
                />
                {errors.productName && <span className="gen-error-text">{errors.productName}</span>}
              </div>

              {/* Brand Name */}
              <div className="gen-group">
                <label htmlFor="bname">
                  Brand Name <span className="optional-tag">(optional)</span>
                </label>
                <input
                  id="bname"
                  type="text"
                  placeholder="e.g. Nature's Basket"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                />
              </div>

              {/* Ingredients */}
              <div className="gen-group">
                <label htmlFor="ingr">Key Ingredients / Features</label>
                <textarea
                  id="ingr"
                  rows={3}
                  placeholder="e.g. Mustard seeds, turmeric, sea salt, no preservatives"
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  className={errors.ingredients ? "gen-error-input" : ""}
                />
                {errors.ingredients && <span className="gen-error-text">{errors.ingredients}</span>}
              </div>

              {/* Prominent Generate button (moved below Target Platform) - placeholder removed here */}

              {/* Tone */}
              <div className="gen-group">
                <label>Writing Tone</label>
                <div className="tone-grid">
                  {TONES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`tone-card${tone === t.id ? " active" : ""}`}
                      onClick={() => setTone(t.id)}
                    >
                      <span className="tone-icon">{t.icon}</span>
                      <span>
                        <div className="tone-name">{t.name}</div>
                        <div className="tone-desc">{t.desc}</div>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              
              {/* Platform */}
              <div className="gen-group">
                <label htmlFor="plat">Target Platform</label>
                <select
                  id="plat"
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              {/* Show server warning if Gemini not configured */}
              <div style={{ marginTop: 12 }}>
                <button
                  id="generate-btn"
                  type="button"
                  className="gen-inline-btn gen-inline-prominent gen-inline-green"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating…" : "Generate Listing"}
                </button>
              </div>

              {/* Original form submit removed — use inline Generate button above */}
            </form>

            
          </div>
        </section>

        {/* RIGHT — Output */}
        <section className="gen-output-preview">
          {/* Placeholder */}
          {!isGenerating && !output && (
            <div className="output-placeholder">
              <div className="placeholder-art">✨</div>
              <h3>Your AI Assistant is Ready</h3>
              <p>Fill out the product information on the left and click "Generate Listing" to compose e-commerce listings tailored for food brands.</p>
            </div>
          )}

          {/* Loader */}
          {isGenerating && (
            <div className="output-loader">
              <div className="spinner-dots">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
              <h3>Generating Listing</h3>
              <p className="loader-sub">Composing your product copy…</p>
              <div className="loader-steps-list">
                {loaderSteps.map((step, idx) => {
                  const cls = generatingStep > idx ? "complete" : generatingStep === idx ? "active" : "pending";
                  return (
                    <div key={idx} className={`loader-step-item ${cls}`}>
                      <span className="step-bullet">{cls === "complete" ? "✓" : "●"}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Output */}
          {!isGenerating && output && (
            <div className="output-card">
              <div className="output-header">
                <h3>Generated Listing</h3>
                <button className="copy-all-btn" onClick={copyAll}>
                  {copiedField === "all" ? "Copied!" : "📋 Copy All Fields"}
                </button>
              </div>

              <div className="output-tabs">
                {["title", "description", "bullets", "keywords"].map(tab => (
                  <button
                    key={tab}
                    className={`tab-link${activeTab === tab ? " active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "title" ? "SEO Title" : tab === "description" ? "Description" : tab === "bullets" ? "Bullet Points" : "Keywords"}
                  </button>
                ))}
              </div>

              <div className="tab-content-area">
                {activeTab === "title" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Listing Title</span>
                      <button className="copy-tab-btn" onClick={() => copyToClipboard(output.title, "title")}>
                        {copiedField === "title" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output title-output">{output.title}</div>
                  </div>
                )}
                {activeTab === "description" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Detailed Description</span>
                      <button className="copy-tab-btn" onClick={() => copyToClipboard(output.description, "description")}>
                        {copiedField === "description" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output">{output.description}</div>
                  </div>
                )}
                {activeTab === "bullets" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Bullet Points</span>
                      <button className="copy-tab-btn" onClick={() => copyToClipboard(output.bullets.join("\n"), "bullets")}>
                        {copiedField === "bullets" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <ul className="text-output bullet-output">
                      {output.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                )}
                {activeTab === "keywords" && (
                  <div className="tab-pane">
                    <div className="tab-pane-header">
                      <span>Target Keywords</span>
                      <button className="copy-tab-btn" onClick={() => copyToClipboard(output.keywords, "keywords")}>
                        {copiedField === "keywords" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="text-output keywords-output">{output.keywords}</div>
                  </div>
                )}
              </div>

              <div className="output-compliance-note">
                <strong>✓ Claim-Safe:</strong> This description highlights natural features and ingredients. Verify that nutrition tables match your packaging labels before publishing.
              </div>
            </div>
          )}
        </section>
      </main>

      {/* (Removed floating button - inline button used below Target Platform) */}

      {/* Sliding Toast Notification */}
      {toast.show && (
        <div className="toast-notification">
          <div className="toast-content">
            <span className="toast-icon">⚠️</span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast({ show: false, message: "" })}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
