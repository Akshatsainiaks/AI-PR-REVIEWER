import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearMessages } from "../store/slices/authSlice";
import { use Theme } from "../context/ThemeContext";
import { AuthField, AuthBg, Eye, EyeOff, DARK_T, LIGHT_T } from "../components/AuthField";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);
  const { landingTheme } = useTheme();
  const T = landingTheme === "dark" ? DARK_T : LIGHT_T;

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: location.state?.otp || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (success === "reset_success") setTimeout(() => navigate("/login"), 2000);
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
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>
        <Link to="/forgot-password" style={{ fontSize: "13px", color: T.text3, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >← Back</Link>

        <div style={{ background: T.bg2, borderRadius: "20px", border: `1px solid ${T.border}`, padding: "36px", boxShadow: landingTheme === "dark" ? "0 8px 60px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${T.accent}18`, border: `1px solid ${T.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "18px" }}>🔑</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px", color: T.text }}>Create new password</h1>

          {form.email && (
            <p style={{ color: T.text2, fontSize: "13px", marginBottom: "20px", fontFamily: "'Fira Code',monospace" }}>
              <span style={{ color: T.accent }}>{form.email}</span>
              {form.otp && <> · OTP: <span style={{ color: T.green, letterSpacing: "2px" }}>{form.otp}</span></>}
            </p>
          )}

          {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: T.rose, marginBottom: "16px" }}>{error}</div>}
          {success === "reset_success" && <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: T.green, marginBottom: "16px" }}>Password reset! Redirecting to login...</div>}

          <form onSubmit={e => { e.preventDefault(); dispatch(resetPassword(form)); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {!location.state?.email && (
              <AuthField label="Email address" t={T}>
                <input type="email" value={form.email} required placeholder="you@example.com"
                  onChange={e => setForm({ ...form, email: e.target.value })} style={inp}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.inputBorder}
                />
              </AuthField>
            )}
            {!location.state?.otp && (
              <AuthField label="OTP code" t={T}>
                <input value={form.otp} required placeholder="123456"
                  onChange={e => setForm({ ...form, otp: e.target.value })} maxLength={6}
                  style={{ ...inp, fontFamily: "'Fira Code',monospace", letterSpacing: "6px", fontSize: "20px", textAlign: "center" }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.inputBorder}
                />
              </AuthField>
            )}

            <AuthField label="New password" t={T}>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.newPassword} required
                  placeholder="Min 8 chars, uppercase, number, special"
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  style={{ ...inp, paddingRight: "44px" }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.inputBorder}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.text3, padding: "4px", display: "flex", alignItems: "center" }}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </AuthField>

            <AuthField label="Confirm password" t={T}>
              <input type="password" value={form.confirmPassword} required placeholder="Repeat new password"
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                style={{ ...inp, borderColor: form.confirmPassword && form.confirmPassword !== form.newPassword ? "rgba(239,68,68,0.5)" : T.inputBorder }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = form.confirmPassword !== form.newPassword ? "rgba(239,68,68,0.4)" : T.inputBorder}
              />
              {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                <p style={{ fontSize: "12px", color: T.rose, marginTop: "4px", fontFamily: "'Fira Code',monospace" }}>Passwords don't match</p>
              )}
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
              {loading ? "Resetting..." : "Set new password →"}
            </button>
          </form>
        </div>
      </div>
    </AuthBg>
  );
}