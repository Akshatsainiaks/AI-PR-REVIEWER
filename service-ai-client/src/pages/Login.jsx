import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearMessages } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import { AuthField, AuthBg, AuthLogoMark, GithubIcon, Eye, EyeOff, DARK_T, LIGHT_T } from "../components/AuthField";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);
  const { landingTheme } = useTheme();
  const T = landingTheme === "dark" ? DARK_T : LIGHT_T;
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (success === "login_success") navigate("/dashboard");
    return () => dispatch(clearMessages());
  }, [success]);

  const inp = {
    width: "100%", padding: "11px 14px",
    background: T.inputBg, border: `1px solid ${T.inputBorder}`,
    borderRadius: "10px", fontSize: "14px", color: T.text,
    fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", transition: "border-color 0.2s",
  };

  return (
    <AuthBg T={T}>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "460px" }}>
        <Link to="/" style={{ fontSize: "13px", color: T.text3, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >← Back to home</Link>

        <AuthLogoMark T={T} />

        <div style={{ background: T.bg2, borderRadius: "20px", border: `1px solid ${T.border}`, padding: "36px", boxShadow: landingTheme === "dark" ? "0 8px 60px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "6px", color: T.text }}>Welcome back</h1>
          <p style={{ color: T.text2, fontSize: "14px", marginBottom: "28px" }}>Sign in to your Revuzen account</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: T.rose, marginBottom: "18px" }}>
              {error}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); dispatch(login(form)); }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <AuthField label="Email address" t={T}>
              <input type="email" value={form.email} required placeholder="you@example.com"
                onChange={e => setForm({ ...form, email: e.target.value })} style={inp}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder}
              />
            </AuthField>

            <AuthField label="Password" t={T} labelRight={
              <Link to="/forgot-password" style={{ fontSize: "12px", color: T.accent, textDecoration: "none" }}>Forgot password?</Link>
            }>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} required
                  placeholder="Enter your password"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inp, paddingRight: "44px" }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.inputBorder}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.text3, padding: "4px", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </AuthField>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", marginTop: "4px",
              background: loading ? T.bg3 : T.accent, color: "#fff", border: "none",
              borderRadius: "10px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              boxShadow: loading ? "none" : `0 4px 20px ${T.accentGlow}`,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
            }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: T.border }} />
            <span style={{ fontSize: "12px", color: T.text3, fontFamily: "'Fira Code',monospace" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: T.border }} />
          </div>

          <a href={`${import.meta.env.VITE_API_URL}/auth/github`} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            width: "100%", padding: "12px", borderRadius: "10px",
            background: landingTheme === "dark" ? "rgba(255,255,255,0.04)" : T.bg3,
            border: `1px solid ${T.borderH}`,
            color: T.text, textDecoration: "none", fontSize: "14px", fontWeight: 500, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = landingTheme === "dark" ? "rgba(255,255,255,0.08)" : T.border; e.currentTarget.style.borderColor = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.background = landingTheme === "dark" ? "rgba(255,255,255,0.04)" : T.bg3; e.currentTarget.style.borderColor = T.borderH; }}
          >
            <GithubIcon color={T.text} /> Continue with GitHub
          </a>

          <p style={{ textAlign: "center", fontSize: "13px", color: T.text3, marginTop: "20px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: T.accent, textDecoration: "none", fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </AuthBg>
  );
}