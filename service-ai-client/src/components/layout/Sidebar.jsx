import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const V = (p) => `var(--${p})`;

// ── SVG Icons ──────────────────────────────────────────────────────
const IcDash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IcPRs = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);
const IcAnalytics = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IcClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IcCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IcSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IcDocs = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IcChevronLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IcChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Nav sections data ───────────────────────────────────────────────
const SECTIONS = [
  {
    title: "Workspace",
    items: [
      { icon: <IcDash />, label: "Dashboard", path: "/dashboard" },
      { icon: <IcPRs />, label: "All PRs", path: "/prs" },
      { icon: <IcAnalytics />, label: "Analytics", path: "/analytics" },
    ],
  },
  {
    title: "Filter",
    items: [
      { icon: <IcClock />, label: "Analyzing", path: "/prs?status=analyzing", dotColor: "var(--da)" },
      { icon: <IcCheck />, label: "Completed", path: "/prs?status=completed", dotColor: "var(--dgreen)" },
      { icon: <IcX />, label: "Failed", path: "/prs?status=failed", dotColor: "var(--dred)" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: <IcSettings />, label: "Settings", path: "/settings" },
      { icon: <IcDocs />, label: "API Docs", path: "/docs" },
    ],
  },
];

// ── Sidebar ─────────────────────────────────────────────────────────
export default function Sidebar({ open, onToggle }) {
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);

  const initial =
    user?.fullName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const isActive = (itemPath) => {
    const [path, query] = itemPath.split("?");
    if (query) {
      return (
        location.pathname === path &&
        location.search === `?${query}`
      );
    }
    return location.pathname === path;
  };

  return (
    <aside
      style={{
        width: open ? "216px" : "52px",
        minWidth: open ? "216px" : "52px",
        transition:
          "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)",
        background: V("db2"),
        borderRight: `1px solid ${V("dborder")}`,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
        position: "sticky",
        top: "56px",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Scrollable content ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: open ? "12px 8px" : "10px 6px",
        }}
      >
        {/* User info — only when expanded */}
        {open && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 8px 12px",
              borderBottom: `1px solid ${V("dborder")}`,
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--da),var(--dcyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: V("dt"),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullName || "User"}
              </p>
              <p
                style={{
                  fontSize: "10px",
                  color: V("dt2"),
                  fontFamily: "'Fira Code',monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || ""}
              </p>
            </div>
          </div>
        )}

        {/* When collapsed — show avatar only */}
        {!open && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "12px",
              paddingBottom: "10px",
              borderBottom: `1px solid ${V("dborder")}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--da),var(--dcyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {initial}
            </div>
          </div>
        )}

        {/* Nav sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: open ? "18px" : "14px" }}>
            {/* Section title — only expanded */}
            {open && (
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: V("dt3"),
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "0 8px",
                  marginBottom: "4px",
                  fontFamily: "'Fira Code',monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {section.title}
              </p>
            )}

            {/* Items */}
            {section.items.map((item) => {
              const active = isActive(item.path);
              const [navPath] = item.path.split("?");
              const searchParam = item.path.includes("?")
                ? `?${item.path.split("?")[1]}`
                : "";

              return (
                <Link
                  key={item.label}
                  to={navPath + searchParam}
                  title={!open ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: open ? "9px" : "0",
                    padding: open ? "7px 8px" : "8px",
                    justifyContent: open ? "flex-start" : "center",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: active ? 600 : 500,
                    textDecoration: "none",
                    color: active
                      ? item.dotColor || V("da")
                      : V("dt2"),
                    background: active ? V("dag") : "transparent",
                    transition: "all 0.15s",
                    marginBottom: "1px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = V("db3");
                      e.currentTarget.style.color = V("dt");
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = V("dt2");
                    }
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: active ? item.dotColor || V("da") : "inherit",
                    }}
                  >
                    {item.icon}
                  </span>
                  {open && item.label}
                </Link>
              );
            })}

            {/* Section divider when expanded */}
            {open && (
              <div
                style={{
                  height: "1px",
                  background: V("dborder"),
                  margin: "8px 4px 0",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Toggle button at bottom of sidebar ── */}
      <div
        style={{
          padding: "10px",
          borderTop: `1px solid ${V("dborder")}`,
          display: "flex",
          justifyContent: open ? "flex-end" : "center",
        }}
      >
        <button
          onClick={onToggle}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            background: V("db3"),
            border: `1px solid ${V("dborder")}`,
            cursor: "pointer",
            color: V("dt2"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = V("da");
            e.currentTarget.style.color = V("da");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = V("dborder");
            e.currentTarget.style.color = V("dt2");
          }}
        >
          {open ? <IcChevronLeft /> : <IcChevronRight />}
        </button>
      </div>
    </aside>
  );
}