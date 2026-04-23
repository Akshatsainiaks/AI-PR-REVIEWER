import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearMessages } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import { AuthField, AuthBg, AuthLogoMark, GithubIcon, Eye, EyeOff, DARK_T, LIGHT_T } from "../components/AuthField";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);
  const { landingTheme } = useTheme();
  const T = landingTheme === "dark" ? DARK_T : LIGHT_T;
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (success === "register_success") setTimeout(() => navigate("/login"), 1500);
    return () => dispatch(clearMessages());
  }, [success]);

  const inp = {
    width: "100%", padding: "11px 14px",
    background: T.inputBg, border: `1px solid ${T.inputBorder}`,
    borderRadius: "10px", fontSize: "14px", color: T.text,
    fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", transition: "border-color 0.2s",
  };

  const checks = [
    { ok: form.password.length >= 8, label: "8+ chars" },
    { ok: /[A-Z]/.test(form.password), label: "Uppercase" },
    { ok: /\d/.test(form.password), label: "Number" },
    { ok: /[@$!%*?&]/.test(form.password), label: "Special" },
  ];

  return (
    <AuthBg T={T}>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "460px" }}>
        <Link to="/" style={{ fontSize: "13px", color: T.text3, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >← Back to home</Link>

        <AuthLogoMark T={T} />

        <div style={{ background: T.bg2, borderRadius: "20px", border: `1px solid ${T.border}`, padding: "36px", boxShadow: landingTheme === "dark" ? "0 8px 60px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)" }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "6px", color: T.text }}>Create your account</h1>
          <p style={{ color: T.text2, fontSize: "14px", marginBottom: "28px" }}>Start reviewing PRs with AI — free forever</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: T.rose, marginBottom: "18px" }}>
              {error}
            </div>
          )}
          {success === "register_success" && (
            <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: T.green, marginBottom: "18px" }}>
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); dispatch(register(form)); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <AuthField label="Full name" t={T}>
              <input type="text" value={form.fullName} required placeholder="John Doe"
                onChange={e => setForm({ ...form, fullName: e.target.value })} style={inp}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder}
              />
            </AuthField>

            <AuthField label="Email address" t={T}>
              <input type="email" value={form.email} required placeholder="you@example.com"
                onChange={e => setForm({ ...form, email: e.target.value })} style={inp}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.inputBorder}
              />
            </AuthField>

            <AuthField label="Password" t={T}>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} required
                  placeholder="Min 8 chars, uppercase, number, special"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inp, paddingRight: "44px" }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.inputBorder}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.text3, padding: "4px", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                {checks.map(({ ok, label }) => (
                  <span key={label} style={{
                    fontSize: "11px", padding: "2px 8px", borderRadius: "999px",
                    fontFamily: "'Fira Code',monospace",
                    background: ok ? "rgba(74,222,128,0.08)" : T.bg3,
                    color: ok ? T.green : T.text3,
                    border: `1px solid ${ok ? "rgba(74,222,128,0.2)" : T.border}`,
                    transition: "all 0.2s",
                  }}>
                    {ok ? "✓" : "·"} {label}
                  </span>
                ))}
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
              {loading ? "Creating account..." : "Create account →"}
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
            Already have an account?{" "}
            <Link to="/login" style={{ color: T.accent, textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: T.text3, marginTop: "16px" }}>
          By signing up you agree to our{" "}
          <a href="#" style={{ color: T.accent, textDecoration: "none" }}>Terms</a> &{" "}
          <a href="#" style={{ color: T.accent, textDecoration: "none" }}>Privacy</a>
        </p>
      </div>
    </AuthBg>
  );
}