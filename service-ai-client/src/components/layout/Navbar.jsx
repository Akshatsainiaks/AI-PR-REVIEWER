import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useDashTheme } from "../../hooks/useDashTheme";

const V = (p) => `var(--${p})`;

// ── SVG Icons ──────────────────────────────────────────────────────
const IcPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcHistory = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IcChart = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const IcDoc = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IcGitHub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const IcSettings = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IcDash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IcLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IcAnalytics = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// ── Logo SVG ────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="124" height="28" viewBox="0 0 124 28" fill="none">
    <defs>
      <linearGradient id="ngl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--da)" />
        <stop offset="100%" stopColor="var(--dcyan)" />
      </linearGradient>
    </defs>
    <polygon
      points="13,2 23,7.5 23,18.5 13,24 3,18.5 3,7.5"
      fill="none" stroke="url(#ngl)" strokeWidth="1.5"
    />
    <polygon
      points="13,6 19,9.5 19,16.5 13,20 7,16.5 7,9.5"
      fill="var(--dag)" stroke="var(--da)" strokeWidth="1" opacity="0.8"
    />
    <circle cx="13" cy="13" r="2.8" fill="var(--da)" />
    <text
      x="29" y="19"
      fontFamily="'Plus Jakarta Sans',sans-serif"
      fontWeight="800" fontSize="14" fill="var(--dt)" letterSpacing="-0.3"
    >
      Revuzen
    </text>
    <text
      x="88" y="19"
      fontFamily="'Plus Jakarta Sans',sans-serif"
      fontWeight="300" fontSize="14" fill="var(--da)"
    >
      AI
    </text>
  </svg>
);

// ── Dropdown item ───────────────────────────────────────────────────
function DDItem({ icon, label, action, color, hoverBg }) {
  return (
    <button
      onClick={action}
      style={{
        display: "flex", alignItems: "center", gap: "9px", width: "100%",
        padding: "8px 12px", borderRadius: "8px", border: "none",
        background: "transparent", cursor: "pointer",
        color: color || V("dt2"),
        fontSize: "13px", fontFamily: "'Plus Jakarta Sans',sans-serif",
        textAlign: "left", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = hoverBg || "var(--db3)";
        if (!color) e.currentTarget.style.color = "var(--dt)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        if (!color) e.currentTarget.style.color = "var(--dt2)";
      }}
    >
      <span style={{ width: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

// ── Main Navbar ─────────────────────────────────────────────────────
export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { theme, toggle } = useDashTheme();
  const [dropOpen, setDropOpen] = useState(false);

  const initial =
    user?.fullName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const firstName =
    user?.fullName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

  // Build GitHub profile URL from email hint or fallback
  const githubProfileUrl = user?.githubUsername
    ? `https://github.com/${user.githubUsername}`
    : "https://github.com";

  const NAV_ITEMS = [
    { label: "New Review", path: "/dashboard", icon: <IcPlus />, primary: true },
    { label: "History", path: "/prs", icon: <IcHistory /> },
    { label: "Analytics", path: "/analytics", icon: <IcChart /> },
    { label: "Docs", path: "/docs", icon: <IcDoc /> },
  ];

  return (
    <nav
      style={{
        height: "56px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 20px",
        background: V("db2"), borderBottom: `1px solid ${V("dborder")}`,
        position: "sticky", top: 0, zIndex: 200,
        backdropFilter: "blur(12px)", flexShrink: 0,
      }}
    >
      {/* ── LEFT: Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex" }}>
          <Logo />
        </Link>
      </div>

      {/* ── CENTER: Nav items ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "8px",
              fontSize: "13px", fontWeight: item.primary ? 700 : 500,
              background: item.primary ? V("da") : "transparent",
              color: item.primary ? "#fff" : V("dt2"),
              border: "none", cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!item.primary) {
                e.currentTarget.style.background = V("db3");
                e.currentTarget.style.color = V("dt");
              } else {
                e.currentTarget.style.filter = "brightness(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!item.primary) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = V("dt2");
              } else {
                e.currentTarget.style.filter = "brightness(1)";
              }
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* ── RIGHT: Theme + User ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            width: 34, height: 34, borderRadius: "8px",
            background: V("db3"), border: `1px solid ${V("dborder")}`,
            cursor: "pointer", fontSize: "15px",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = V("da")}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = V("dborder")}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div style={{ width: "1px", height: "18px", background: V("dborder") }} />

        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: V("db3"), border: `1px solid ${V("dborder")}`,
              borderRadius: "10px", padding: "5px 10px",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = V("dborder2")}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = V("dborder")}
          >
            {/* Avatar */}
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "linear-gradient(135deg,var(--da),var(--dcyan))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 800, color: "#fff", flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <span
              style={{
                fontSize: "13px", color: V("dt"), fontWeight: 500,
                maxWidth: "90px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {firstName}
            </span>
            <svg
              width="10" height="10" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{
                color: V("dt2"),
                transform: dropOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 98 }}
                onClick={() => setDropOpen(false)}
              />
              <div
                style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 99,
                  background: V("db2"), border: `1px solid ${V("dborder")}`,
                  borderRadius: "14px", padding: "8px", minWidth: "210px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                }}
              >
                {/* User info header */}
                <div
                  style={{
                    padding: "10px 12px 10px",
                    borderBottom: `1px solid ${V("dborder")}`,
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg,var(--da),var(--dcyan))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 800, color: "#fff", flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: V("dt"), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.fullName || "User"}
                      </p>
                      <p style={{ fontSize: "11px", color: V("dt2"), fontFamily: "'Fira Code',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <DDItem
                  icon={<IcDash />}
                  label="Dashboard"
                  action={() => { navigate("/dashboard"); setDropOpen(false); }}
                />
                <DDItem
                  icon={<IcAnalytics />}
                  label="Analytics"
                  action={() => { navigate("/analytics"); setDropOpen(false); }}
                />
                <DDItem
                  icon={<IcSettings />}
                  label="Settings"
                  action={() => { navigate("/settings"); setDropOpen(false); }}
                />

                <div style={{ height: "1px", background: V("dborder"), margin: "6px 0" }} />

                {/* GitHub profile link */}
                <a
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none", display: "block" }}
                  onClick={() => setDropOpen(false)}
                >
                  <DDItem icon={<IcGitHub />} label="GitHub Profile" />
                </a>

                <div style={{ height: "1px", background: V("dborder"), margin: "6px 0" }} />

                {/* Sign out */}
                <DDItem
                  icon={<IcLogout />}
                  label="Sign out"
                  color="var(--dred)"
                  hoverBg="rgba(239,68,68,0.08)"
                  action={() => {
                    dispatch(logout());
                    navigate("/");
                    setDropOpen(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}