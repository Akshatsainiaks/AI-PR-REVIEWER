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
              <Section title="Account" desc="Manage your account security">
                <ChangePasswordForm email={user?.email} />

                <div style={{ paddingTop: "16px", marginTop: "24px", borderTop: "1px solid var(--dborder)" }}>
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
      <p style={{ fontSize: "12px", color: "var(--dt2)", marginBottom: "20px", lineHeight: 1.6 }}>{desc}</p>
      {children}
    </div>
  );
}



function ChangePasswordForm({ email }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match");
    if (form.newPassword.length < 8) return setError("Password must be at least 8 characters");
    
    setError("");
    setLoading(true);
    try {
      // 1. Verify current password via login API
      const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.currentPassword })
      });
      if (!loginRes.ok) {
        setLoading(false);
        return setError("Incorrect current password");
      }
      
      // 2. Request OTP via forgot-password API
      const forgotRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!forgotRes.ok) throw new Error("Failed to send OTP. Try again later.");
      
      setStep(2);
      setSuccess("OTP sent to your email. Please enter it to confirm changes.");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 3. Confirm change via reset-password API
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: form.otp, newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      setStep(3);
      setSuccess("Password updated successfully!");
    } catch (err) {
      setError(err.message || "Invalid OTP or error occurred");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "9px 12px", background: "var(--db3)", border: "1px solid var(--dborder)",
    borderRadius: "8px", color: "var(--dt)", fontSize: "13px", outline: "none", marginBottom: "12px",
    fontFamily: "'Plus Jakarta Sans',sans-serif"
  };

  if (step === 3) {
    return <div style={{ marginTop: "24px", padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--dgreen)", borderRadius: "8px", fontSize: "13px", fontWeight: 500 }}>{success}</div>;
  }

  return (
    <div>
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--dt)", marginBottom: "4px" }}>Change Password</h3>
      <p style={{ fontSize: "12px", color: "var(--dt2)", marginBottom: "16px" }}>Update your password using your current password and email confirmation.</p>
      
      {error && <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dred)", fontSize: "12px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>}
      {success && step === 2 && <div style={{ padding: "10px 12px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--dgreen)", fontSize: "12px", borderRadius: "8px", marginBottom: "16px" }}>{success}</div>}

      {step === 1 ? (
        <form onSubmit={handleInitialSubmit}>
          <input style={inp} type="password" required placeholder="Current Password" value={form.currentPassword} onChange={e => setForm({...form, currentPassword: e.target.value})} />
          <input style={inp} type="password" required placeholder="New Password" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} />
          <input style={inp} type="password" required placeholder="Confirm New Password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
          <button disabled={loading} style={{ padding: "9px 16px", background: "var(--da)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit}>
          <input style={inp} type="text" required placeholder="Enter 6-digit OTP from email" value={form.otp} onChange={e => setForm({...form, otp: e.target.value})} />
          <div style={{ display: "flex", gap: "12px" }}>
            <button disabled={loading} style={{ padding: "9px 16px", background: "var(--da)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Updating..." : "Confirm & Change Password"}
            </button>
            <button type="button" onClick={() => { setStep(1); setSuccess(""); setError(""); }} style={{ padding: "9px 16px", background: "transparent", color: "var(--dt2)", border: "1px solid var(--dborder)", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}