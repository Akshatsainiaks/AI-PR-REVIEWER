import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPRs, analyzePR } from "../store/slices/prSlice";
import DashLayout from "../components/layout/DashLayout";

const V = (p) => `var(--${p})`;

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: V("db2"), border: `1px solid ${V("dborder")}`,
    borderRadius: "14px", padding: "20px 22px", flex: 1, minWidth: "160px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
      <span style={{ fontSize: "20px" }}>{icon}</span>
      {sub && <span style={{ fontSize: "11px", color: V("dgreen"), fontFamily: "'Fira Code',monospace", background: "rgba(74,222,128,0.08)", padding: "2px 7px", borderRadius: "99px", border: "1px solid rgba(74,222,128,0.2)" }}>{sub}</span>}
    </div>
    <p style={{ fontSize: "28px", fontWeight: 800, color: color || V("da"), letterSpacing: "-1px", marginBottom: "3px" }}>{value}</p>
    <p style={{ fontSize: "12px", color: V("dt2") }}>{label}</p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { prs, pagination, loading } = useSelector((s) => s.pr);
  const { user } = useSelector((s) => s.auth);
  const [prUrl, setPrUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    dispatch(fetchPRs());
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prUrl.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await dispatch(analyzePR({ prUrl })).unwrap();
      navigate(`/pr/${result.prId}`);
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : "Failed — check PR URL format");
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const completed = prs.filter(p => p.status === "completed").length;
  const analyzing = prs.filter(p => p.status === "analyzing").length;
  const failed = prs.filter(p => p.status === "failed").length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashLayout>
      <div style={{ width: "100%" }}>

        {/* Welcome */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: V("dt2"), fontSize: "14px" }}>
            Here's what's happening with your pull requests today.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
          <StatCard icon="⎇" label="Total PRs reviewed" value={pagination?.total || 0} sub={pagination?.total ? "+active" : null} />
          <StatCard icon="✓" label="Completed" value={completed} color="var(--dgreen)" />
          <StatCard icon="◉" label="Analyzing" value={analyzing} color="var(--da)" />
          <StatCard icon="✕" label="Failed" value={failed} color="var(--dred)" />
        </div>

        {/* Analyze box */}
        <div style={{
          background: V("db2"), border: `1px solid ${V("dborder")}`,
          borderRadius: "16px", padding: "24px 28px", marginBottom: "28px",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "5px", color: V("dt") }}>
            Analyze a Pull Request
          </h2>
          <p style={{ color: V("dt2"), fontSize: "13px", marginBottom: "16px" }}>
            Paste any GitHub PR URL to start AI-powered code review
          </p>
          <form onSubmit={handleAnalyze} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              value={prUrl}
              onChange={e => setPrUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              style={{
                flex: 1, minWidth: "240px", padding: "10px 14px",
                background: V("db3"), border: `1px solid ${V("dborder")}`,
                borderRadius: "10px", color: V("dt"), fontSize: "13px",
                fontFamily: "'Fira Code',monospace", outline: "none", transition: "border 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--da)"}
              onBlur={e => e.target.style.borderColor = "var(--dborder)"}
            />
            <button type="submit" disabled={submitting} style={{
              padding: "10px 22px", background: submitting ? V("db3") : V("da"),
              color: submitting ? V("dt2") : "#fff", border: "none",
              borderRadius: "10px", fontSize: "13px", fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1, whiteSpace: "nowrap",
              boxShadow: submitting ? "none" : "0 4px 16px var(--dag)",
            }}>
              {submitting ? "Analyzing..." : "Analyze →"}
            </button>
          </form>
          {submitError && <p style={{ marginTop: "8px", fontSize: "12px", color: V("dred"), fontFamily: "'Fira Code',monospace" }}>{submitError}</p>}
        </div>

        {/* Recent PRs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: V("dt") }}>Recent PRs</h2>
          <button onClick={() => navigate("/prs")} style={{
            background: "transparent", border: "none", color: V("da"),
            fontSize: "13px", cursor: "pointer", fontWeight: 500,
          }}>
            View all →
          </button>
        </div>

        {loading ? <Skeleton /> : prs.length === 0 ? <Empty /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {prs.slice(0, 5).map(pr => (
              <PRCard key={pr.id} pr={pr} onClick={() => navigate(`/pr/${pr.id}`)} />
            ))}
          </div>
        )}
      </div>
    </DashLayout>
  );
}

const PRCard = ({ pr, onClick }) => {
  const statusColor = { completed: "var(--dgreen)", analyzing: "var(--da)", failed: "var(--dred)" };
  const completed = pr.stepLogs?.filter(s => s.status === "completed").length || 0;
  const total = pr.stepLogs?.length || 4;
  return (
    <div onClick={onClick} style={{
      background: V("db2"), border: `1px solid ${V("dborder")}`,
      borderRadius: "12px", padding: "14px 18px", cursor: "pointer",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: "12px",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--dborder2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dborder)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: statusColor[pr.status] || V("dborder"), boxShadow: pr.status === "analyzing" ? "0 0 8px var(--da)" : "none" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Fira Code',monospace", fontSize: "