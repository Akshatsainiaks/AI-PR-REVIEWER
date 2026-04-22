import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearMessages } from "../store/slices/authSlice";
import { AuthField } from "./Login";

const T = {
  bg:"#07080f", bg2:"#0c0e1a", bg3:"#11152a",
  border:"rgba(120,130,220,0.12)", borderH:"rgba(120,130,220,0.28)",
  text:"#eef0ff", text2:"#7b85b0", text3:"#3d4468",
  accent:"#c084fc", accentGlow:"rgba(192,132,252,0.22)",
  green:"#4ade80", rose:"#fb7185",
  inputBg:"#0c0e1a", inputBorder:"rgba(120,130,220,0.2)",
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);

  // Pre-fill from ForgotPassword navigation state
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

  const inp = { width:"100%", padding:"11px 14px", background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:"10px", fontSize:"14px", color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", transition:"border-color 0.2s" };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative" }}>
      <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle,${T.accentGlow} 0%,transparent 70%)`, pointerEvents:"none", filter:"blur(70px)" }}/>
      <div style={{ position:"fixed", inset:0, backgroundImage:`radial-gradient(${T.text3} 1px,transparent 1px)`, backgroundSize:"32px 32px", opacity:0.12, pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"420px" }}>
        <Link to="/forgot-password" style={{ fontSize:"13px", color:T.text3, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px", marginBottom:"28px", transition:"color 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.color=T.accent}
          onMouseLeave={e=>e.currentTarget.style.color=T.text3}
        >← Back</Link>

        <div style={{ background:T.bg2, borderRadius:"20px", border:`1px solid ${T.border}`, padding:"36px", boxShadow:"0 8px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ width:44, height:44, borderRadius:"12px", background:"rgba(192,132,252,0.1)", border:`1px solid rgba(192,132,252,0.2)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", marginBottom:"18px" }}>🔑</div>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"26px", fontWeight:800, letterSpacing:"-0.5px", marginBottom:"6px", color:T.text }}>Create new password</h1>
          <p style={{ color:T.text2, fontSize:"14px", marginBottom:"24px" }}>
            {form.email && <><span style={{ color:T.accent, fontFamily:"'Fira Code',monospace" }}>{form.email}</span> · </>}
            OTP: <span style={{ color:T.accent, fontFamily:"'Fira Code',monospace", letterSpacing:"2px" }}>{form.otp || "——————"}</span>
          </p>

          {error && <div style={{ background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.2)", borderRadius:"10px", padding:"11px 14px", fontSize:"13px", color:T.rose, marginBottom:"16px" }}>{error}</div>}
          {success==="reset_success" && <div style={{ background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"10px", padding:"11px 14px", fontSize:"13px", color:T.green, marginBottom:"16px" }}>Password reset! Redirecting to login...</div>}

          <form onSubmit={e=>{e.preventDefault();dispatch(resetPassword(form));}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {/* Show email/otp fields only if not pre-filled */}
            {!location.state?.email && (
              <AuthField label="Email address" t={T}>
                <input type="email" value={form.email} required placeholder="you@example.com"
                  onChange={e=>setForm({...form,email:e.target.value})}
                  style={inp} onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </AuthField>
            )}
            {!location.state?.otp && (
              <AuthField label="OTP code" t={T}>
                <input value={form.otp} required placeholder="123456"
                  onChange={e=>setForm({...form,otp:e.target.value})} maxLength={6}
                  style={{ ...inp, fontFamily:"'Fira Code',monospace", letterSpacing:"6px", fontSize:"20px", textAlign:"center" }}
                  onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
              </AuthField>
            )}

            <AuthField label="New password" t={T}>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={form.newPassword} required placeholder="Min 8 chars, uppercase, number, special"
                  onChange={e=>setForm({...form,newPassword:e.target.value})}
                  style={{...inp,paddingRight:"44px"}}
                  onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.inputBorder}/>
                <button type="button" onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.text3, padding:"4px", display:"flex", alignItems:"center" }}>
                  {showPass ? <EyeOff/> : <Eye/>}
                </button>
              </div>
            </AuthField>

            {/* No eye button on confirm password */}
            <AuthField label="Confirm password" t={T}>
              <input type="password" value={form.confirmPassword} required placeholder="Repeat new password"
                onChange={e=>setForm({...form,confirmPassword:e.target.value})}
                style={{ ...inp, borderColor:form.confirmPassword&&form.confirmPassword!==form.newPassword?"rgba(251,113,133,0.5)":T.inputBorder }}
                onFocus={e=>e.target.style.borderColor=T.accent}
                onBlur={e=>e.target.style.borderColor=form.confirmPassword!==form.newPassword?"rgba(251,113,133,0.4)":T.inputBorder}
              />
              {form.confirmPassword && form.confirmPassword!==form.newPassword && (
                <p style={{ fontSize:"12px", color:T.rose, marginTop:"4px", fontFamily:"'Fira Code',monospace" }}>Passwords don't match</p>
              )}
            </AuthField>

            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:loading?T.bg3:T.accent, color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1, boxShadow:loading?"none":`0 4px 20px ${T.accentGlow}` }}>
              {loading?"Resetting...":"Set new password →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const Eye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
