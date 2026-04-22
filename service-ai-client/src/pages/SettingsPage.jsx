import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import DashLayout from "../components/layout/DashLayout";
import { useDashTheme } from "../hooks/useDashTheme";

const V = (p) => `var(--${p})`;

export default function SettingsPage() {
  const { theme, setTheme } = useDashTheme();
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appearance");

  // Track the user's preference separately (light / dark / system)
  // so System shows as selected even though theme is applied as light/dark
  const [themePreference, setThemePreference] = useState(
    () => localStorage.getItem("dash-theme-preference") || "dark"
  );

  const handleThemeSelect = (val) => {
    setThemePreference(val);
    localStorage.setItem("dash-theme-preference", val);

    if (val === "system") {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(sys);
    } else {
      setTheme(val);
    }
  };

  // Listen for system changes if system is selected
  useEffect(() => {
    if (themePreference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [themePreference]);

  const TABS = [
    { id: "appearance", label: "Appearance", icon: <IcPalette /> },
    { id: "account", label: "Account", icon: <IcUser /> },
    { id: "notifications", label: "Notifications", icon: <IcBell /> },
    { id: "api", label: "API & Webhooks", icon: <IcCode /> },
  ];

  const THEMES = [
    { val: "light", label: "Light", icon: "☀️", desc: "Clean light interface" },
    { val: "dark", label: "Dark", icon: "🌙", desc: "Easy on the eyes" },
    { val: "system", label: "System", icon: "🖥", desc: "Follows OS preference" },
  ];

  return (
    <DashLayout>
      <div style={{ maxWidth: "860px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>
            Settings
          </h1>
          <p style={{ color: V("dt2"), fontSize: "13px" }}>
            Manage your account and preferences
          </p>
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {/* Tab list */}
          <div style={{ width: "185px", flexShrink: 0 }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  width: "100%", padding: "9px 12px", borderRadius: "9px",
                  border: "none",
                  background: activeTab === tab.id ? V("dag") : "transparent",
                  color: activeTab === tab.id ? V("da") : V("dt2"),
                  fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: "pointer", textAlign: "left", marginBottom: "2px",
                  fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = V("db3");
                    e.currentTarget.style.color = V("dt");
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = V("dt2");
                  }
                }}
              >
                <span style={{ width: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── Appearance ── */}
            {activeTab === "appearance" && (
              <Section title="Theme" desc="Choose how Revuzen looks inside the dashboard. System follows your OS dark/light setting.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                  {THEMES.map((t) => {
                    const selected = themePreference === t.val;
                    return (
                      <button
                        key={t.val}
                        onClick={() => handleThemeSelect(t.val)}
                        style={{
                          padding: "18px 14px", borderRadius: "12px", cursor: "pointer",
                          background: selected ? V("dag") : V("db3"),
                          border: `2px solid ${selected ? V("da") : V("dborder")}`,
                          textAlign: "center", transition: "all 0.2s",
                          fontFamily: "'Plus Jakarta Sans',sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) e.currentTarget.style.borderColor = V("dborder2");
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.borderColor = V("dborder");
                        }}
                      >
                        <p style={{ fontSize: "26px", marginBottom: "8px" }}>{t.icon}</p>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: V("dt"), marginBottom: "3px" }}>
                          {t.label}
                        </p>
                        <p style={{ fontSize: "11px", color: V("dt2") }}>{t.desc}</p>
                        {selected && (
                          <div style={{
                            marginTop: "8px", fontSize: "11px", color: V("da"),
                            fontFamily: "'Fira Code',monospace",
                          }}>
                            ✓ active
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ── Account ── */}
            {activeTab === "account" && (
              <Section title="Account" desc="Your profile information and account settings">
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  <InfoRow label="Full name" value={user?.fullName || "—"} />
                  <InfoRow label="Email address" value={user?.email || "—"} mono />
                  <InfoRow label="Role" value={user?.role === 1 ? "Admin" : "User"} />
                  <InfoRow label="User ID" value={user?.id || "—"} mono />
                  <div style={{ paddingTop: "16px" }}>
                    <button
                      onClick={() => { dispatch(logout()); navigate("/"); }}
                      style={{
                        padding: "9px 20px",
                        background: "rgba(220,38,38,0.08)",
                        border: "1px solid rgba(220,38,38,0.2)",
                        borderRadius: "8px", color: V("dred"),
                        fontSize: "13px", fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.14)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.08)"}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <Section title="Notifications" desc="Control what you get notified about">
                <NotifRow
                  label="PR analysis completed"
                  desc="Get notified when a review finishes successfully"
                  defaultOn
                />
                <NotifRow
                  label="PR analysis failed"
                  desc="Alert when an analysis run encounters an error"
                  defaultOn
                />
                <NotifRow
                  label="Weekly digest"
                  desc="Summary of your review activity every Monday"
                  defaultOn={false}
                />
                <NotifRow
                  label="System announcements"
                  desc="Important updates about Revuzen AI features"
                  defaultOn
                />
              </Section>
            )}

            {/* ── API & Webhooks ── */}
            {activeTab === "api" && (
              <Section title="API & Webhooks" desc="Integrate Revuzen AI with your CI/CD workflow">
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  <InfoRow label="Agent webhook URL" value="POST /api/webhooks/agent" mono />
                  <InfoRow label="GitHub webhook URL" value="POST /api/webhooks/github" mono />
                  <InfoRow label="API base URL" value={`${window.location.protocol}//${window.location.host}/api`} mono />
                  <InfoRow label="Auth method" value="Bearer JWT (24h expiry)" />
                  <InfoRow label="Webhook auth" value="HMAC SHA256 x-signature" mono />
                </div>
                <div style={{ paddingTop: "16px", display: "flex", gap: "10px" }}>
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "9px 18px", background: V("dag"),
                      border: `1px solid ${V("da")}44`, borderRadius: "8px",
                      color: V("da"), fontSize: "13px", fontWeight: 600,
                      textDecoration: "none", transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = V("dag")}
                  >
                    <IcDocLink /> Open Swagger UI
                  </a>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </DashLayout>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function Section({ title, desc, children }) {
  return (
    <div style={{
      background: "var(--db2)", border: "1px solid var(--dborder)",
      borderRadius: "16px", padding: "24px",
    }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--dt)", marginBottom: "4px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "12px", color: "var(--dt2)", marginBottom: "20px", lineHeight: 1.6 }}>
        {desc}
      </p>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid var(--dborder)",
    }}>
      <span style={{ fontSize: "13px", color: "var(--dt2)" }}>{label}</span>
      <span style={{
        fontSize: "12px", color: "var(--dt)", fontWeight: 500,
        fontFamily: mono ? "'Fira Code',monospace" : "inherit",
        maxWidth: "60%", textAlign: "right", wordBreak: "break-all",
      }}>
        {value}
      </span>
    </div>
  );
}

function NotifRow({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn ?? true);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: "1px solid var(--dborder)",
    }}>
      <div style={{ flex: 1, paddingRight: "20px" }}>
        <p style={{ fontSize: "13px", color: "var(--dt)", fontWeight: 500, marginBottom: "2px" }}>
          {label}
        </p>
        <p style={{ fontSize: "12px", color: "var(--dt2)" }}>{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        style={{
          width: 44, height: 24, borderRadius: "12px",
          background: on ? "var(--da)" : "var(--db3)",
          border: `1px solid ${on ? "var(--da)" : "var(--dborder)"}`,
          cursor: "pointer", position: "relative", transition: "all 0.25s", flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          position: "absolute", top: "2px",
          left: on ? "22px" : "2px",
          transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ── Tab icons ───────────────────────────────────────────────────────
const IcPalette = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);
const IcUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IcBell = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IcCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IcDocLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);