import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPR } from "../store/slices/prSlice";
import { useSocket } from "../hooks/useSocket";
import DashLayout from "../components/layout/DashLayout";

const v = (p) => `var(--${p})`;

const STEPS = ["fetch_pr", "clone_repo", "analyze_code", "generate_review"];
const STEP_LABELS = {
  fetch_pr: "Fetch PR diff & metadata",
  clone_repo: "Clone repository to workspace",
  analyze_code: "Analyze code patterns & issues",
  generate_review: "Generate review comments",
};

export default function PRDetail() {
  const { prId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPR, loading, activeSteps } = useSelector((s) => s.pr);

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

  if (loading && !currentPR) {
    return (
      <DashLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${v("da")}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: v("dt2"), fontFamily: "'Fira Code',monospace", fontSize: "13px" }}>Loading PR...</p>
        </div>
      </DashLayout>
    );
  }

  return (
    <DashLayout>
      <div style={{ maxWidth: "760px" }}>
        {/* Back */}
        <button onClick={() => navigate("/dashboard")} style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "transparent", border: `1px solid ${v("dborder")}`,
          borderRadius: "8px", padding: "7px 14px", color: v("dt2"),
          cursor: "pointer", fontSize: "13px", marginBottom: "24px", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--da)"; e.currentTarget.style.color = "var(--da)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dborder)"; e.currentTarget.style.color = "var(--dt2)"; }}
        >
          ← Back to dashboard
        </button>

        {/* PR info */}
        {currentPR && (
          <div style={{
            background: v("db2"), border: `1px solid ${v("dborder")}`,
            borderRadius: "16px", padding: "24px 28px", marginBottom: "20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "11px", color: v("dt3"), marginBottom: "6px", fontFamily: "'Fira Code',monospace", textTransform: "uppercase", letterSpacing: "1px" }}>PR URL</p>
                <a href={currentPR.prUrl} target="_blank" rel="noreferrer" style={{
                  fontFamily: "'Fira Code',monospace", fontSize: "13px", color: v("da"),
                  textDecoration: "none", wordBreak: "break-all",
                }}>
                  {currentPR.prUrl}
                </a>
              </div>
              <StatusBadge status={currentPR.status} />
            </div>
            <p style={{ fontSize: "11px", color: v("dt3"), marginTop: "12px", fontFamily: "'Fira Code',monospace" }}>
              Started {new Date(currentPR.createdAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Steps */}
        <div style={{
          background: v("db2"), border: `1px solid ${v("dborder")}`,
          borderRadius: "16px", padding: "24px 28px", marginBottom: "20px",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: v("dt") }}>Analysis Pipeline</h2>
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
                        width: "2px", flex: 1, minHeight: "28px",
                        background: status === "completed" ? "var(--dgreen)" : "var(--dborder)",
                        margin: "4px 0", transition: "background 0.3s",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                      <p style={{ fontFamily: "'Fira Code',monospace", fontSize: "13px", color: v("dt"), fontWeight: 500 }}>
                        {name}
                      </p>
                      <StatusBadge status={status} small />
                    </div>
                    <p style={{ fontSize: "12px", color: v("dt2"), marginBottom: details ? "6px" : 0 }}>
                      {STEP_LABELS[name]}
                    </p>
                    {details && (
                      <p style={{
                        fontSize: "11px", color: v("dt2"), fontFamily: "'Fira Code',monospace",
                        background: v("db3"), padding: "6px 10px", borderRadius: "6px",
                        border: `1px solid ${v("dborder")}`,
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

        {/* Live indicator */}
        {currentPR?.status === "analyzing" && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 18px", background: "rgba(192,132,252,0.06)",
            border: "1px solid rgba(192,132,252,0.2)", borderRadius: "10px",
          }}>
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--da)", position: "absolute" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--da)", position: "absolute", animation: "ping 1.4s infinite" }} />
            </div>
            <p style={{ fontSize: "12px", color: "var(--da)", fontFamily: "'Fira Code',monospace" }}>
              Live — receiving real-time updates via Socket.IO
            </p>
          </div>
        )}
      </div>
    </DashLayout>
  );
}

const StepIcon = ({ status }) => {
  const cfg = {
    completed: { bg: "var(--dgreen)", content: "✓", color: "#fff" },
    running: { bg: "var(--da)", content: "·", color: "#fff", spin: true },
    failed: { bg: "var(--dred)", content: "✕", color: "#fff" },
    pending: { bg: "var(--db3)", content: "", border: true },
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
    completed: { bg: "rgba(74,222,128,0.08)", color: "var(--dgreen)", border: "rgba(74,222,128,0.2)" },
    analyzing: { bg: "rgba(192,132,252,0.08)", color: "var(--da)", border: "rgba(192,132,252,0.2)" },
    running: { bg: "rgba(192,132,252,0.08)", color: "var(--da)", border: "rgba(192,132,252,0.2)" },
    failed: { bg: "rgba(248,113,113,0.08)", color: "var(--dred)", border: "rgba(248,113,113,0.2)" },
    pending: { bg: "var(--db3)", color: "var(--dt2)", border: "var(--dborder)" },
  };
  const c = cfg[status] || cfg.pending;
  return (
    <span style={{
      fontSize: small ? "10px" : "11px", padding: small ? "2px 7px" : "3px 10px",
      borderRadius: "5px", fontFamily: "'Fira Code',monospace",
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  );
};
