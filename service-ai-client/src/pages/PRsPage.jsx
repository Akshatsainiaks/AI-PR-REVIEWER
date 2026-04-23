import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPRs } from "../store/slices/prSlice";
import DashLayout from "../components/layout/DashLayout";

const V = (p) => `var(--${p})`;

export default function PRsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { prs, pagination, loading } = useSelector((s) => s.pr);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchPRs({ ...(filter ? { status: filter } : {}), page, limit }));
  }, [filter, page]);

  return (
    <DashLayout>
      {/* <div style={{ maxWidth: "900px" }}> */}
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>
            All Pull Requests
          </h1>
          <p style={{ color: V("dt2"), fontSize: "13px" }}>
            {pagination?.total || 0} total reviews across all time
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
          {[
            { val: "", label: "All", icon: "⊞" },
            { val: "analyzing", label: "Analyzing", icon: "◉" },
            { val: "completed", label: "Completed", icon: "✓" },
            { val: "failed", label: "Failed", icon: "✕" },
          ].map(f => (
            <button key={f.val} onClick={() => { setFilter(f.val); setPage(1); }} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
              fontSize: "12px", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500,
              background: filter === f.val ? V("da") : V("db3"),
              color: filter === f.val ? "#fff" : V("dt2"),
              border: `1px solid ${filter === f.val ? V("da") : V("dborder")}`,
              transition: "all 0.15s",
            }}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2, 3, 4].map(i => <div key={i} style={{ height: "64px", borderRadius: "12px", background: "linear-gradient(90deg,var(--db2) 25%,var(--db3) 50%,var(--db2) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)}
          </div>
        ) : prs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", border: "2px dashed var(--dborder)", borderRadius: "12px" }}>
            <p style={{ fontSize: "24px", marginBottom: "8px" }}>⎇</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--dt)", marginBottom: "4px" }}>No PRs found</p>
            <p style={{ color: "var(--dt2)", fontSize: "13px" }}>Try changing the filter or go to Dashboard to add a PR</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {prs.map(pr => (
                <PRRow key={pr.id} pr={pr} onClick={() => navigate(`/pr/${pr.id}`)} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 32, height: 32, borderRadius: "8px", cursor: "pointer",
                    background: page === p ? V("da") : V("db3"),
                    color: page === p ? "#fff" : V("dt2"),
                    border: `1px solid ${page === p ? V("da") : V("dborder")}`,
                    fontSize: "13px", fontWeight: 600,
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashLayout>
  );
}

const PRRow = ({ pr, onClick }) => {
  const statusColor = { completed: "var(--dgreen)", analyzing: "var(--da)", failed: "var(--dred)" };
  const completed = pr.stepLogs?.filter(s => s.status === "completed").length || 0;

  return (
    <div onClick={onClick} style={{
      background: "var(--db2)", border: "1px solid var(--dborder)",
      borderRadius: "12px", padding: "16px 20px", cursor: "pointer",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: "14px",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--dborder2)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--dborder)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ width: 9, height: 9, borderRadius: "50%", flexShrink: 0, background: statusColor[pr.status] || "var(--dborder)", boxShadow: pr.status === "analyzing" ? "0 0 8px var(--da)" : "none" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Fira Code',monospace", fontSize: "12px", color: "var(--dt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "3px" }}>{pr.prUrl}</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <p style={{ fontSize: "11px", color: "var(--dt2)" }}>{new Date(pr.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <p style={{ fontSize: "11px", color: "var(--dt2)" }}>{completed}/4 steps done</p>
        </div>
      </div>
      <span style={{ fontSize: "10px", fontFamily: "'Fira Code',monospace", padding: "3px 9px", borderRadius: "5px", flexShrink: 0, background: `${statusColor[pr.status] || "var(--dborder)"}22`, color: statusColor[pr.status] || "var(--dt2)", border: `1px solid ${statusColor[pr.status] || "var(--dborder)"}44` }}>
        {pr.status}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--dt3)", flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
};