import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearMessages } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import { AuthField, AuthBg, AuthLogoMark, DARK_T, LIGHT_T } from "../components/AuthField";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);
  const { landingTheme } = useTheme();
  const T = landingTheme === "dark" ? DARK_T : LIGHT_T;
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = [];

  useEffect(() => () => dispatch(clearMessages()), []);

  useEffect(() => {
    if (success && step === "email") {
      setStep("otp");
      setTimeout(() => inputRefs[0]?.focus(), 150);
    }
  }, [success]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs[index + 1]?.focus();
    if (next.every(d => d !== "")) {
      setTimeout(() => navigate("/reset-password", { state: { email, otp: next.join("") } }), 300);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => navigate("/reset-password", { state: { email, otp: pasted } }), 300);
  };

  const inp = {
    width: "100%", padding: "11px 14px",
    background: T.inputBg, border: `1px solid ${T.inputBorder}`,
    borderRadius: "10px", fontSize: "14px", color: T.text,
    fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", transition: "border-color 0.2s",
  };

  return (
    <AuthBg T={T}>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px" }}>
        <Link to="/login" style={{ fontSize: "13px", color: T.text3, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = T.accent}
          onMouseLeave={e => e.currentTarget.style.color = T.text3}
        >← Back to login</Link>

        <div style={{ background: T.bg2, borderRadius: "20px", border: `1px solid ${T.border}`, padding: "36px", boxShadow: landingTheme === "dark" ? "0 8px 60px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
            {["Email", "OTP"].map((label, i) => {
              const active = (i === 0 && step === "email") || (i === 1 && step === "otp");
              const done = i === 0 && step === "otp";
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", fontSize: "11px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? T.green : active ? T.accent : T.bg3,
                    color: done || active ? "#fff" : T.text3,
                    border: `1px solid ${done ? T.green : active ? T.accent : T.border}`,
                    transition: "all 0.3s",
                  }}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: "12px", color: active ? T.text : T.text3, fontWeight: active ? 600 : 400 }}>{label}</span>
                  {i === 0 && <div style={{ width: 24, height: 1, background: step === "otp" ? T.accent : T.border, transition: "background 0.3s" }} />}
                </div>
              );
            })}
          </div>

          {step === "email" && (
            <>
              <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${T.accent}18`, border: `1px solid ${T.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "18px" }}>🔐</div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px", color: T.text }}>Forgot password?</h1>
              <p style={{ color: T.text2, fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>Enter your email and we'll send a 6-digit OTP.</p>

              {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: T.rose, marginBottom: "16px" }}>{error}</div>}

              <form onSubmit={e => { e.preventDefault(); dispatch(clearMessages()); dispatch(forgotPassword({ email })); }} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <AuthField label="Email address" t={T}>
                  <input type="email" value={email} required placeholder="you@example.com"
                    onChange={e => setEmail(e.target.value)} style={inp}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = T.inputBorder}
                  />
                </AuthField>
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "13px",
                  background: loading ? T.bg3 : T.accent, color: "#fff", border: "none",
                  borderRadius: "10px", fontSize: "15px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: loading ? "none" : `0 4px 20px ${T.accentGlow}`,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>
                  {loading ? "Sending OTP..." : "Send OTP →"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "18px" }}>📬</div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "6px", color: T.text }}>Check your email</h1>
              <p style={{ color: T.text2, fontSize: "14px", marginBottom: "4px" }}>We sent a 6-digit code to</p>
              <p style={{ color: T.accent, fontSize: "14px", fontFamily: "'Fira Code',monospace", marginBottom: "28px", fontWeight: 500 }}>{email}</p>

              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }} onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => { inputRefs[i] = el; }}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    maxLength={1} inputMode="numeric"
                    style={{
                      width: "44px", height: "52px", textAlign: "center",
                      fontSize: "20px", fontWeight: 700, fontFamily: "'Fira Code',monospace",
                      background: T.inputBg, color: T.text, outline: "none",
                      border: `1.5px solid ${digit ? T.accent : T.inputBorder}`,
                      borderRadius: "10px", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = T.accent}
                    onBlur={e => e.target.style.borderColor = otp[i] ? T.accent : T.inputBorder}
                  />
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: "13px", color: T.text2, marginBottom: "12px" }}>
                Didn't get it?{" "}
                <button onClick={() => { dispatch(clearMessages()); setOtp(["", "", "", "", "", ""]); dispatch(forgotPassword({ email })); }}
                  style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                  Resend OTP
                </button>
              </p>
              <p style={{ textAlign: "center", fontSize: "11px", color: T.text3, marginBottom: "16px", fontFamily: "'Fira Code',monospace" }}>
                All 6 digits filled → auto redirects
              </p>

              <button
                onClick={() => navigate("/reset-password", { state: { email, otp: otp.join("") } })}
                disabled={otp.some(d => d === "")}
                style={{
                  width: "100%", padding: "12px",
                  background: otp.some(d => d === "") ? T.bg3 : T.accent,
                  color: otp.some(d => d === "") ? T.text3 : "#fff",
                  border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                  cursor: otp.some(d => d === "") ? "not-allowed" : "pointer",
                  opacity: otp.some(d => d === "") ? 0.5 : 1,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>
                Continue →
              </button>
            </>
          )}
        </div>
      </div>
    </AuthBg>
  );
}