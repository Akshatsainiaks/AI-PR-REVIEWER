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

  const [themePreference, setThemePreference] = useState(
    () => localStorage.getItem("dash-theme-preference") || theme
  );

  const handleThemeSelect = (val) => {
    setThemePreference(val);
    localStorage.setItem("dash-theme-preference", val);
    if (val === "system") {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(sys);
    } else {
      setTheme(val);
    }
  };

  useEffect(() => {
    if (themePreference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [themePreference]);

  const TABS = [
    { id: "appearance",    label: "Appearance",     icon: "🎨" },
    { id: "account",       label: "Account",         icon: "👤" },
    { id: "notifications", label: "Notifications",   icon: "🔔" },
    { id: "api",           label: "API & Webhooks",  icon: "⚡" },
  ];

  const THEMES = [
    { val: "light",  label: "Light",  icon: "☀️", desc: "Clean light interface" },
    { val: "dark",   label: "Dark",   icon: "🌙", desc: "Easy on the eyes" },
    { val: "system", label: "System", icon: "🖥",  desc: "Follows OS preference" },
  ];

  return (
    <DashLayout>
      <div style={{ maxWidth: "100%" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: V("dt"), marginBottom: "4px" }}>Settings</h1>
          <p style={{ color: V("dt2"), fontSize: "13px" }}>Manage your account and preferences</p>
        </div>

        <div style={{ display: "flex", gap: "24px" }}>
          {/* Tab list */}
          <div style={{ width: "190px", flexShrink: 0 }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: "flex", alignItems: "center", gap: "9px", width: "100%",
                padding: "9px 12px", borderRadius: "9px", border: "none",
                background: activeTab === tab.id ? V("dag") : "transparent",
                color: activeTab === tab.id ? V("da") : V("dt2"),
                fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: "pointer", textAlign: "left", marginBottom: "2px",
                fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = V("db3"); e.currentTarget.style.color = V("dt"); } }}
                onMouseLeave={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = V("dt2"); } }}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {activeTab === "appearance" && (
              <Section title="Theme" desc="Choose how the Revuzen dashboard looks. This setting is independent from the landing page theme.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
                  {THEMES.map((t) => {
                    const selected = themePreference === t.val;
                    return (
                      <button key={t.val} onClick={() => handleThemeSelect(t.val)} style={{
                        padding: "18px 14px", borderRadius: "12px", cursor: "pointer",
                        background: selected ? V("dag") : V("db3"),
                        border: `2px solid ${selected ? V("da") : V("dborder")}`,
                        textAlign: "center", transition: "all 0.2s",
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                      }}>
                        <p style={{ fontSize: "26px", marginBottom: "8px" }}>{t.icon}</p>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: V("dt"), marginBottom: "3px" }}>{t.label}</p>
                        <p style={{ fontSize: "11px", color: V("dt2") }}>{t.desc}</p>
                        {selected && <p style={{ marginTop: "8px", fontSize: "11px", color: V("da"), fontFamily: "'Fira Code',monospace" }}>✓ active</p>}
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {activeTab === "account" && (
              <Section title="Account" desc="Your profile and account information">
                <InfoRow label="Full name" value={user?.fullName || "—"} />
                <InfoRow label="Email address" value={user?.email || "—"} mono />
                <InfoRow label="Role" value={user?.role === 1 ? "Admin" : "User"} />
                <InfoRow label="User ID" value={user?.id || "—"} mono />
                <div style={{ paddingTop: "16px" }}>
                  <button onClick={() => { dispatch(logout()); navigate("/"); }} style={{
                    padding: "9px 20px", background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.2)", borderRadius: "8px",
                    color: V("dred"), fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}>
                    Sign out
                  </button>
                </div>
              </Section>
            )}

            {activeTab === "notifications" && (
              <Section title="Notifications" desc="Control what you get notified about">
                <NotifRow label="PR analysis completed" desc="Get notified when a review finishes" defaultOn />
                <NotifRow label="PR analysis failed" desc="Alert when an analysis run encounters an error" defaultOn />
                <NotifRow label="Weekly digest" desc="Summary of your review activity every Monday" defaultOn={false} />
                <NotifRow label="System announcements" desc="Important Revuzen AI feature updates" defaultOn />
              </Section>
            )}

            {activeTab === "api" && (
              <Section title="API & Webhooks" desc="Integrate Revuzen AI with your CI/CD workflow">
                <InfoRow label="Agent webhook" value="POST /api/webhooks/agent" mono />
                <InfoRow label="GitHub webhook" value="POST /api/webhooks/github" mono />
                <InfoRow label="Base URL" value={`${window.location.protocol}//${window.location.host}/api`} mono />
                <InfoRow label="Auth" value="Bearer JWT (24h expiry)" />
                <InfoRow label="Webhook auth" value="HMAC SHA256 · x-signature header" mono />
                <div style={{ paddingTop: "16px" }}>
                  <a href="/api/docs" target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "9px 18px", background: V("dag"),
                    border: `1px solid ${V("da")}44`, borderRadius: "8px",
                    color: V("da"), fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  }}>
                    Open Swagger UI ↗
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

function Section({ title, desc, children }) {
  return (
    <div style={{ background: "var(--db2)", border: "1px solid var(--dborder)", borderRadius: "16px", padding: "24px" }}>
      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--dt)", marginBottom: "4px" }}>{title}</h2>