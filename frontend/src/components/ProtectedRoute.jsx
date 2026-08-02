/**
 * ProtectedRoute
 *
 * Wraps any page that requires authentication.
 * If the user is not logged in, it shows a prompt
 * and redirects to the auth page instead of rendering children.
 */
export default function ProtectedRoute({ currentUser, onNavigate, children }) {
  if (!currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F3",
        fontFamily: "'Inter', sans-serif",
        gap: 16,
        padding: "0 5%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>🔒</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 26,
          fontWeight: 400,
          color: "#1C1C1A",
        }}>
          Sign in to continue
        </h2>
        <p style={{ fontSize: 14, color: "#6B6B67", maxWidth: 360, lineHeight: 1.7 }}>
          You need an account to access the FoodDescAI workspace.
          It's free to sign up — no credit card required.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={() => onNavigate("auth", "login")}
            style={{
              background: "#1A3A2A", color: "#fff",
              border: "none", borderRadius: 6,
              padding: "10px 22px", fontSize: 13.5,
              fontWeight: 500, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Log in
          </button>
          <button
            onClick={() => onNavigate("auth", "signup")}
            style={{
              background: "#fff", color: "#1A3A2A",
              border: "1px solid #E4E2DC", borderRadius: 6,
              padding: "10px 22px", fontSize: 13.5,
              fontWeight: 500, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Create account
          </button>
        </div>
      </div>
    );
  }
  return children;
}
