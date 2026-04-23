import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPR } from "../store/slices/prSlice";
import { useSocket } from "../hooks/useSocket";
import DashLayout from "../components/layout/DashLayout";
import DiffViewer from "../components/DiffViewer";
import api from "../services/api";

const V = (p) => `var(--${p})`;

const STEPS = ["fetch_pr", "analyze_code", "clone_repo", "generate_review"];
const STEP_LABELS = {
  fetch_pr:        "Fetch PR diff & metadata from GitHub",
  clone_repo:      "Clone repository to isolated workspace",
  analyze_code:    "Analyze code patterns and issues with AI",
  generate_review: "Generate structured review comments",
};
const STEP_ICONS = {
  fetch_pr:        "⬇",
  clone_repo:      "📁",
  analyze_code:    "🔍",
  generate_review: "✍",
};

export default function PRDetail() {
  const { prId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPR, loading, activeSteps } = useSelector((s) => s.pr);
  const [stopping, setStopping] = useState(false);
  const [stopMsg, setStopMsg] = useState("");

  useSocket(prId);

  useEffect(() => {
    dispatch(fetchPR(prId));
  }, [prId]);

  const getStep = (name) => {
    const live = activeSteps[prId]?.[name];
    const db = currentPR?.stepLogs?.find((s) => s.step === name);
    return {
      status: live?.status || db?.status || "pending",
      details: live?.details || db?.details || "",
    };
  };

  const isAnalyzing = currentPR?.status === "analyzing";
  const isCompleted = currentPR?.status === "completed";
  const isFailed = currentPR?.status === "failed";

  const completedCount = STEPS.filter((s) => getStep(s).status === "completed").length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  const handleStop = async () => {
    if (!window.confirm("Stop this PR analysis? This cannot be undone.")) return;
    setStopping(true);
    try {
      // Mark as failed via the webhook endpoint
      await api.post(`/pr/${prId}/stop`).catch(() => {
        // Fallback: just navigate away
      });
      setStopMsg("Analysis stopped.");
      dispatch(fetchPR(prId));
    } catch {
      setStopMsg("Could not stop — please try again.");
    } finally {
      setStopping(false);
    }
  };

  if (loading && !currentPR) {
    return (
      <DashLayout>
        <div style={{ maxWidth: "100%" }}>
          <PRDetailSkeleton />
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div style={{ maxWidth: "100%" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate("/prs")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: `1px solid ${V("dborder")}`,
              borderRadius: "8px", padding: "7px 14px", color: V("dt2"),
              cursor: "pointer", fontSize: "13px", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = V("da"); e.currentTarget.style.color = V("da"); }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = V("dborder"); e.currentTarget.style.color = V("dt2"); }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: V("dt"), letterSpacing: "-0.5px" }}>
                PR Analysis
              </h1>
              <p style={{ fontSize: "12px", color: V("dt2") }}>ID: <span style={{ fontFamily: "'Fira Code',monospace" }}>{prId}</span></p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {isAnalyzing && (
              <button onClick={handleStop} disabled={stopping} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 18px", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: "9px",
                color: V("dred"), fontSize: "13px", fontWeight: 600,
                cursor: stopping ? "not-allowed" : "pointer", opacity: stopping ? 0.6 : 1,
                fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { if (!stopping) e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                {stopping ? "Stopping..." : "Stop analysis"}
              </button>
            )}
            <StatusBadge status={currentPR?.status} />
          </div>
        </div>

        {stopMsg && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 16px", fontSize: "13px", color: V("dred"), marginBottom: "16px" }}>
            {stopMsg}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* ── Left col ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* PR Info */}
            <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "22px 24px" }}>
              <p style={{ fontSize: "11px", color: V("dt3"), fontFamily: "'Fira Code',monospace", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Pull Request</p>
              <a href={currentPR?.prUrl} target="_blank" rel="noreferrer" style={{
                fontFamily: "'Fira Code',monospace", fontSize: "13px", color: V("da"),
                textDecoration: "none", wordBreak: "break-all", display: "block", marginBottom: "12px",
              }}>
                {currentPR?.prUrl}
              </a>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "11px", color: V("dt3"), marginBottom: "3px" }}>Started</p>
                  <p style={{ fontSize: "13px", color: V("dt"), fontFamily: "'Fira Code',monospace" }}>
                    {currentPR?.createdAt ? new Date(currentPR.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: V("dt3"), marginBottom: "3px" }}>Status</p>
                  <StatusBadge status={currentPR?.status} small />
                </div>
              </div>
            </div>

            {/* Progress */}
            <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: V("dt") }}>Progress</p>
                <p style={{ fontSize: "14px", fontWeight: 800, color: V("da"), fontFamily: "'Fira Code',monospace" }}>{progress}%</p>
              </div>
              <div style={{ height: "8px", background: V("db3"), borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{
                  height: "100%", width: `${progress}%`,
                  background: isFailed ? "var(--dred)" : isCompleted ? "var(--dgreen)" : "var(--da)",
                  borderRadius: "99px", transition: "width 0.5s ease",
                }} />
              </div>
              <p style={{ fontSize: "12px", color: V("dt2") }}>
                {completedCount} of {STEPS.length} steps completed
              </p>
            </div>

            {/* Live indicator */}
            {isAnalyzing && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 18px", background: "rgba(192,132,252,0.06)",
                border: "1px solid rgba(192,132,252,0.2)", borderRadius: "12px",
              }}>
                <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--da)", position: "absolute" }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--da)", position: "absolute", animation: "ping 1.4s infinite" }} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", color: "var(--da)", fontWeight: 600 }}>Live analysis in progress</p>
                  <p style={{ fontSize: "11px", color: V("dt2"), fontFamily: "'Fira Code',monospace" }}>
                    Receiving real-time updates via Socket.IO
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right col: Steps ── */}
          <div style={{ background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "22px 24px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: V("dt"), marginBottom: "20px" }}>
              Analysis Pipeline
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {STEPS.map((name, i) => {
                const { status, details } = getStep(name);
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={name} style={{ display: "flex", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <StepIcon status={status} />
                      {!isLast && (
                        <div style={{
                          width: "2px", flex: 1, minHeight: "32px",
                          background: status === "completed" ? "var(--dgreen)" : "var(--dborder)",
                          margin: "4px 0", transition: "background 0.4s",
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: isLast ? 0 : "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "14px" }}>{STEP_ICONS[name]}</span>
                          <p style={{ fontFamily: "'Fira Code',monospace", fontSize: "12px", color: V("dt"), fontWeight: 500 }}>{name}</p>
                        </div>
                        <StatusBadge status={status} small />
                      </div>
                      <p style={{ fontSize: "12px", color: V("dt2"), marginBottom: details ? "6px" : 0 }}>
                        {STEP_LABELS[name]}
                      </p>
                      {details && (
                        <p style={{
                          fontSize: "11px", color: V("dt2"), fontFamily: "'Fira Code',monospace",
                          background: V("db3"), padding: "6px 10px", borderRadius: "6px",
                          border: `1px solid ${V("dborder")}`, marginTop: "6px",
                        }}>
                          {details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {isCompleted && currentPR?.analysis && (
          <AnalysisPreview analysis={currentPR.analysis} />
        )}
        
        {isCompleted && (
          <DiffViewer prId={prId} hasAiChanges={!!currentPR?.analysis?.create_pr_result} />
        )}
      </div>
    </DashLayout>
  );
}

const AnalysisPreview = ({ analysis }) => {
  const data = analysis?.analysis || analysis;
  if (!data) return null;

  return (
    <div style={{ marginTop: "24px", background: V("db2"), border: `1px solid ${V("dborder")}`, borderRadius: "16px", padding: "24px", width: "100%" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: V("dt"), marginBottom: "16px" }}>AI Analysis Report</h2>
      
      <div style={{ marginBottom: "24px", padding: "16px", background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "12px" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 600, color: V("da"), marginBottom: "8px" }}>Summary</h3>
        <p style={{ fontSize: "13px", color: V("dt"), lineHeight: 1.6 }}>{data.summary || "No summary provided."}</p>
      </div>

      {data.problems && data.problems.length > 0 ? (
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: V("dt"), marginBottom: "12px" }}>Identified Issues & Suggestions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.problems.map((p, idx) => (
              <div key={idx} style={{ background: V("db3"), border: `1px solid ${V("dborder")}`, borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>📄</span>
                    <span style={{ fontFamily: "'Fira Code',monospace", fontSize: "12px", color: V("dt"), fontWeight: 600 }}>{p.file}</span>
                  </div>
                  <span style={{ 
                    fontSize: "10px", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700,
                    background: p.severity === "high" ? "rgba(248,113,113,0.15)" : p.severity === "medium" ? "rgba(250,204,21,0.15)" : "rgba(74,222,128,0.15)",
                    color: p.severity === "high" ? "var(--dred)" : p.severity === "medium" ? "#facc15" : "var(--dgreen)"
                  }}>
                    {p.severity}
                  </span>
                </div>
                
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: "11px", color: V("dt3"), textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Issue</p>
                  <p style={{ fontSize: "13px", color: V("dred"), lineHeight: 1.5 }}>{p.issue}</p>
                </div>
                
                <div>
                  <p style={{ fontSize: "11px", color: V("dt3"), textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>AI Suggestion</p>
                  <p style={{ fontSize: "13px", color: "var(--dgreen)", lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", background: V("db3"), borderRadius: "12px", border: "1px dashed var(--dborder)" }}>
          <p style={{ fontSize: "24px", marginBottom: "8px" }}>✨</p>
          <p style={{ fontSize: "14px", fontWeight: 600, color: V("dgreen") }}>No issues found</p>
          <p style={{ fontSize: "12px", color: V("dt2") }}>The AI reviewed the code and found no problems.</p>
        </div>
      )}
    </div>
  );
};

const StepIcon = ({ status }) => {
  const cfg = {
    completed: { bg: "var(--dgreen)", content: "✓", color: "#fff" },
    running:   { bg: "var(--da)",     content: "·", color: "#fff", spin: true },
    failed:    { bg: "var(--dred)",   content: "✕", color: "#fff" },
    pending:   { bg: "var(--db3)",    content: "", border: true },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <div style={{
      width: 26, height: 26, borderRadius: "50%", background: c.bg,
      color: c.color || "var(--dt2)", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0,
      border: c.border ? "2px solid var(--dborder)" : "none",
      animation: c.spin ? "spin 1s linear infinite" : "none",
    }}>
      {c.content}
    </div>
  );
};

const StatusBadge = ({ status, small }) => {
  const cfg = {
    completed: { bg: "rgba(74,222,128,0.08)",    color: "var(--dgreen)", border: "rgba(74,222,128,0.2)" },
    analyzing: { bg: "rgba(192,132,252,0.08)",   color: "var(--da)",     border: "rgba(192,132,252,0.2)" },
    running:   { bg: "rgba(192,132,252,0.08)",   color: "var(--da)",     border: "rgba(192,132,252,0.2)" },
    failed:    { bg: "rgba(248,113,113,0.08)",   color: "var(--dred)",   border: "rgba(248,113,113,0.2)" },
    pending:   { bg: "var(--db3)",               color: "var(--dt2)",    border: "var(--dborder)" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{
      fontSize: small ? "10px" : "11px", padding: small ? "2px 7px" : "3px 10px",
      borderRadius: "5px", fontFamily: "'Fira Code',monospace",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      {status || "—"}
    </span>
  );
};

const PRDetailSkeleton = () => (
  <div>
    <div style={{ height: "32px", width: "200px", borderRadius: "8px", background: "linear-gradient(90deg,var(--db2) 25%,var(--db3) 50%,var(--db2) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: "24px" }} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {[1, 2].map(i => (
        <div key={i} style={{ background: "var(--db2)", border: "1px solid var(--dborder)", borderRadius: "16px", padding: "22px 24px" }}>
          {[80, 60, 40, 90, 50].map((w, j) => (
            <div key={j} style={{ height: "14px", width: `${w}%`, borderRadius: "6px", background: "linear-gradient(90deg,var(--db2) 25%,var(--db3) 50%,var(--db2) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", marginBottom: "12px" }} />
          ))}
        </div>
      ))}
    </div>
  </div>
);