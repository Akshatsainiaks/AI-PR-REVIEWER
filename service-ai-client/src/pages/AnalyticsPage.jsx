import DashLayout from "../components/layout/DashLayout";
import { useSelector } from "react-redux";

const V = (p) => `var(--${p})`;

export default function AnalyticsPage() {
  const { prs } = useSelector((s) => s.pr);
  const total = prs.length;
  const completed = prs.filter((p) => p.status === "completed").length;
  const failed = prs.filter((p) => p.status === "failed").length;
  const analyzing = prs.filter((p) => p.status === "analyzing").length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const Bar = ({ label, value, max, color }) => (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: V("dt2") }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: V("dt"), fontFamily: "'Fira Code',monospace" }}>{value}</span>
      </div>
      <div style={{ height: "8px", background: V("db3"), borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: "99px", transition: "width 1s ease" }} />
      </div>
    </div>
  );

  return (
    <DashLayout>
      <div style={{ width: "100%" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>
            {" "}
            Analytics{" "}
          </h1>
          <p style={{ color: V("dt2"), fontSize: "13px" }}>
            {" "}
            Overview of your PR review activity{" "}
          </p>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {[
            { icon: "⎇", label: "Total Reviews", value: total, color: V("da") },
            { icon: "✓", label: "Completed", value: completed, color: V("dgreen") },
            { icon: "✕", label: "Failed", value: failed, color: V("dred") },
            { icon: "◉", label: "Success Rate", value: `${successRate}%`, color: V("da") },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: V("db2"),
                border: `1px solid ${V("dborder")}`,
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "20px", marginBottom: "10px" }}>{card.icon}</p>
              <p style={{ fontSize: "26px", fontWeight: 800, color: card.color, letterSpacing: "-1px", marginBottom: "3px" }}>{card.value}</p>
              <p style={{ fontSize: "12px", color: V("dt2") }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          style={{
            background: V("db2"),
            border: `1px solid ${V("dborder")}`,
            borderRadius: "16px",
            padding: "24px 28px",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: V("dt"), marginBottom: "20px" }}>
            {" "}
            Status Distribution{" "}
          </h2>
          <Bar label="Completed" value={completed} max={total} color="var(--dgreen)" />
          <Bar label="Analyzing" value={analyzing} max={total} color="var(--da)" />
          <Bar label="Failed" value={failed} max={total} color="var(--dred)" />
        </div>
      </div>
    </DashLayout>
  );
}