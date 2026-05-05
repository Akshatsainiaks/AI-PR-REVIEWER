import { Link, useLocation } from "react-router-dom";

const V = (p) => `var(--${p})`;

const IcDash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcPRs = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>;
const IcAnalytics = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcClock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcCheck = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IcXCircle = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const IcDocs = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcLeft = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const IcRight = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;

const SECTIONS = [
  {
    items: [
      { icon: <IcDash />, label: "Dashboard", path: "/dashboard", dotColor: "var(--da)" },
      { icon: <IcPRs />, label: "All PRs", path: "/prs" },
      { icon: <IcAnalytics />, label: "Analytics", path: "/analytics" },
      { icon: <IcClock />, label: "Clock", path: "/clock" },
      { icon: <IcCheck />, label: "Check", path: "/check" },
      { icon: <IcXCircle />, label: "X Circle", path: "/x-circle" },
      { icon: <IcDocs />, label: "Docs", path: "/docs" },
    ],
  },
  {
    title: "Actions",
    items: [
      { icon: <IcLeft />, label: "Left", path: "/left" },
      { icon: <IcRight />, label: "Right", path: "/right" },
    ],
  },
  {
    title: "Dropdowns",
    items: [
      { icon: <IcDash />, label: "Dropdown", path: "/dropdown" },
      { icon: <IcPRs />, label: "Dropdown PRs", path: "/dropdown-prs" },
    ],
  },
];

export default function Sidebar({ open, onToggle }) {
  const location = useLocation();
  const navPath = location.pathname;
  const navSearch = location.search !== "";

  const isActive = (itemPath) => {
    const [itemPathPath, itemPathQuery] = itemPath.split("?");
    return itemPathPath === navPath && ((itemPathQuery && navSearch && itemPathQuery === navSearch) || (!itemPathQuery && !navSearch));
  };

  return (
    <aside style={{
      width: open ? "210px" : "50px",
      minWidth: open ? "210px" : "50px",
      transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)",
      background: V("db2"), borderRight: `1px solid ${V("dborder")}`,
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 56px)", position: "sticky", top: "56px",
      flexShrink: 0, overflow: "hidden",
    }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: open ? "14px 8px" : "10px 6px" }}>
        {SECTIONS.map((section) => (
          <div key={section.title || "main"} style={{ marginBottom: open ? "16px" : "10px" }}>
            {open && section.title && (
              <p style={{
                fontSize: "9px", fontWeight: 700, color: V("dt3"), letterSpacing: "1.5px",
                textTransform: "uppercase", padding: "0 8px", marginBottom: "5px",
                fontFamily: "'Fira Code',monospace", whiteSpace: "nowrap",
              }}>
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.path);
              const [itemPathPath, itemPathQuery] = item.path.split("?");
              return (
                <Link
                  key={item.label}
                  to={`${itemPathPath}${itemPathQuery ? `?${itemPathQuery}` : ""}`}
                  title={!open ? item.label : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: open ? "9px" : "0",
                    padding: open ? "7px 8px" : "9px",
                    justifyContent: open ? "flex-start" : "center",
                    borderRadius: "8px", fontSize: "13px",
                    fontWeight: active ? 600 : 500, textDecoration: "none",
                    color: active ? (item.dotColor || V("da")) : V("dt2"),
                    background: active ? V("dag") : "transparent",
                    transition: "all 0.15s", marginBottom: "1px",
                    whiteSpace: "nowrap", overflow: "hidden",
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = V("db3"); e.currentTarget.style.color = V("dt"); } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = V("dt2"); } }}
                >
                  <span style={{ width: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: active ? (item.dotColor || V("da")) : "inherit" }}>
                    {item.icon}
                  </span>
                  {open && item.label}
                </Link>
              );
            })}
            {open && <div style={{ height: "1px", background: V("dborder"), margin: "8px 4px 0" }} />}
          </div>
        ))}
      </div>

      {/* Toggle button */}
      <div style={{ padding: "10px", borderTop: `1px solid ${V("dborder")}`, display: "flex", justifyContent: open ? "flex-end" : "center" }}>
        <button
          onClick={onToggle}
          title={