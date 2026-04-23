import DashLayout from "../components/layout/DashLayout";

const V = (p) => `var(--${p})`;

const ENDPOINTS = [
  { method: "POST", path: "/api/auth/register", auth: false, desc: "Register a new user account" },
  { method: "POST", path: "/api/auth/login", auth: false, desc: "Login and receive JWT token" },
  { method: "POST", path: "/api/auth/forgot-password", auth: false, desc: "Send OTP to email for password reset" },
  { method: "POST", path: "/api/auth/reset-password", auth: false, desc: "Reset password using OTP" },
  { method: "GET", path: "/api/auth/github", auth: false, desc: "Initiate GitHub OAuth flow" },
  { method: "GET", path: "/api/auth/github/callback", auth: false, desc: "GitHub OAuth callback handler" },
  { method: "POST", path: "/api/pr/analyze", auth: true, desc: "Trigger AI analysis for a GitHub PR" },
  { method: "GET", path: "/api/pr", auth: true, desc: "Get all PRs for logged-in user (paginated)" },
  { method: "GET", path: "/api/pr/:prId", auth: true, desc: "Get single PR with all step details" },
  { method: "GET", path: "/api/pr/:prId/status", auth: true, desc: "Get step status for a PR" },
  { method: "POST", path: "/api/webhooks/github", auth: "HMAC", desc: "Receive GitHub pull_request events" },
  { method: "PATCH", path: "/api/admin/make-admin/:userId", auth: true, desc: "Promote user to admin role" },
];

const METHOD_COLOR = { GET: "#22d3ee", POST: "#4ade80", PATCH: "#f59e0b", DELETE: "#f87171" };

export default function DocsPage() {
  return (
    <DashLayout>
      {/* <div style={{ maxWidth: "860px" }}> */}
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>API Documentation</h1>
          <p style={{ color: V("dt2"), fontSize: "13px", marginBottom: "16px" }}>
            All endpoints for the Revuzen AI PR Reviewer service
          </p>
          <a href="/api/docs" target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", background: V("dag"),
            border: `1px solid ${V("da")}44`, borderRadius: "8px",
            color: V("da"), fontSize: "13px", fontWeight: 600, textDecoration: "none",
          }}>
            ◉ Open Interactive Swagger UI ↗
          </a>
        </div>

        {/* How it works */}
        <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: V("dt"), marginBottom: "16px" }}>How it works</h2>
          {[
            { n: "01", title: "Submit a PR URL", desc: "POST /api/pr/analyze with a GitHub PR URL. The service creates a job and 4 step logs." },
            { n: "02", title: "FastAPI analyzes it", desc: "Node.js calls FastAPI /agent/analyze. The AI agent fetches the diff, clones the repo, and analyzes code." },
            { n: "03", title: "Steps stream in real time", desc: "FastAPI sends step updates back via POST /api/webhooks/agent (HMAC signed). Node.js broadcasts to frontend via Socket.IO." },
            { n: "04", title: "Review is ready", desc: "When generate_review completes, the prJob status becomes 'completed'. Frontend shows the full report." },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: "flex", gap: "16px", paddingBottom: i < arr.length - 1 ? "16px" : "0", marginBottom: i < arr.length - 1 ? "16px" : "0", borderBottom: i < arr.length - 1 ? `1px solid ${V("dborder")}` : "none" }}>
              <span style={{ fontFamily: "'Fira Code',monospace", fontSize: "11px", color: V("da"), fontWeight: 600, minWidth: "24px", paddingTop: "2px" }}>{step.n}</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: V("dt"), marginBottom: "3px" }}>{step.title}</p>
                <p style={{ fontSize: "12px", color: V("dt2"), lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Auth */}
        <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: V("dt"), marginBottom: "12px" }}>Authentication</h2>
          <p style={{ fontSize: "13px", color: V("dt2"), lineHeight: 1.7, marginBottom: "10px" }}>
            Protected routes require a JWT token in the Authorization header:
          </p>
          <code style={{ display: "block", background: V("db3"), border: `1px solid ${V("dborder")}`, borderRadius: "8px", padding: "10px 14px", fontFamily: "'Fira Code',monospace", fontSize: "12px", color: V("da") }}>
            Authorization: Bearer &lt;your_jwt_token&gt;
          </code>
          <p style={{ fontSize: "13px", color: V("dt2"), lineHeight: 1.7, marginTop: "10px" }}>
            Webhook routes require an HMAC SHA256 signature header computed from the request body using your{" "}
            <code style={{ fontFamily: "'Fira Code',monospace", color: V("da"), fontSize: "12px" }}>GITHUB_WEBHOOK_SECRET</code>.
          </p>
        </div>

        {/* Endpoints */}
        <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: V("dt"), marginBottom: "16px" }}>Endpoints</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {ENDPOINTS.map((ep, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 0", borderBottom: i < ENDPOINTS.length - 1 ? `1px solid ${V("dborder")}` : "none",
              }}>
                <span style={{
                  fontSize: "10px", fontFamily: "'Fira Code',monospace", fontWeight: 700,
                  padding: "2px 7px", borderRadius: "5px", flexShrink: 0, minWidth: "42px", textAlign: "center",
                  background: `${METHOD_COLOR[ep.method]}18`,
                  color: METHOD_COLOR[ep.method],
                  border: `1px solid ${METHOD_COLOR[ep.method]}33`,
                }}>
                  {ep.method}
                </span>
                <code style={{ fontFamily: "'Fira Code',monospace", fontSize: "12px", color: V("dt"), flex: 1, minWidth: 0 }}>
                  {ep.path}
                </code>
                <span style={{
                  fontSize: "10px", fontFamily: "'Fira Code',monospace", padding: "2px 7px",
                  borderRadius: "5px", flexShrink: 0,
                  background: ep.auth === "HMAC" ? "rgba(251,191,36,0.1)" : ep.auth ? "rgba(74,222,128,0.08)" : "var(--db3)",
                  color: ep.auth === "HMAC" ? "#f59e0b" : ep.auth ? "var(--dgreen)" : "var(--dt3)",
                  border: `1px solid ${ep.auth === "HMAC" ? "rgba(251,191,36,0.2)" : ep.auth ? "rgba(74,222,128,0.2)" : "var(--dborder)"}`,
                }}>
                  {ep.auth === "HMAC" ? "HMAC" : ep.auth ? "JWT" : "public"}
                </span>
                <p style={{ fontSize: "12px", color: