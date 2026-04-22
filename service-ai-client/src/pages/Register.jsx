
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearMessages } from "../store/slices/authSlice";
import { AuthField } from "./Login";

const T = {
  bg:"#07080f", bg2:"#0c0e1a", bg3:"#11152a",
  border:"rgba(120,130,220,0.12)", borderH:"rgba(120,130,220,0.28)",
  text:"#eef0ff", text2:"#7b85b0", text3:"#3d4468",
  accent:"#c084fc", accentDim:"rgba(192,132,252,0.1)", accentGlow:"rgba(192,132,252,0.22)",
  cyan:"#22d3ee", green:"#4ade80", rose:"#fb7185",
  inputBg:"#0c0e1a", inputBorder:"rgba(120,130,220,0.2)",
};

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ fullName:"", email:"", password:"" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (success === "register_success") setTimeout(() => navigate("/login"), 1500);
    return () => dispatch(clearMessages());
  }, [success]);

  const inp = {
    width:"100%", padding:"11px 14px",
    background:T.inputBg, border:`1px solid ${T.inputBorder}`,
    borderRadius:"10px", fontSize:"14px", color:T.text,
    fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", transition:"border-color 0.2s",
  };

  const checks = [
    {ok:form.password.length>=8, label:"8+ chars"},
    {ok:/[A-Z]/.test(form.password), label:"Uppercase"},
    {ok:/\d/.test(form.password), label:"Number"},
    {ok:/[@$!%*?&]/.test(form.password), label:"Special"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative" }}>
      {/* Glow orbs */}
      <div style={{ position:"fixed", top:"10%", right:"15%", width:450, height:450, borderRadius:"50%", background:`radial-gradient(circle,${T.accentGlow} 0%,transparent 70%)`, pointerEvents:"none", filter:"blur(70px)" }}/>
      <div style={{ position:"fixed", bottom:"15%", left:"10%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 70%)", pointerEvents:"none", filter:"blur(50px)" }}/>
      <div style={{ position:"fixed", inset:0, backgroundImage:`radial-gradient(${T.text3} 1px,transparent 1px)`, backgroundSize:"32px 32px", opacity:0.12, pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"460px" }}>
        {/* Back */}
        <Link to="/" style={{ fontSize:"13px", color:T.text3, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:"4px", marginBottom:"28px", transition:"color 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.color=T.accent}
          onMouseLeave={e=>e.currentTarget.style.color=T.text3}
        >
          ← Back to home
        </Link>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"28px" }}>
          <div style={{ width:30, height:30, borderRadius:"8px", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:"17px", color:T.text }}>Revuzen<span style={{ color:T.accent, fontWeight:300 }}> AI</span></span>
        </div>

        {/* Card */}
        <div style={{
          background:T.bg2, borderRadius:"20px",
          border:`1px solid ${T.border}`, padding:"36px",
          boxShadow:"0 8px 60px rgba(0,0,0,0.4)",
        }}>
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"28px", fontWeight:800, letterSpacing:"-1px", marginBottom:"6px", color:T.text }}>
            Create your account
          </h1>
          <p style={{ color:T.text2, fontSize:"14px", marginBottom:"28px" }}>
            Start reviewing PRs with AI — free forever
          </p>

          {error && (
            <div style={{ background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.2)", borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:T.rose, marginBottom:"18px" }}>
              {error}
            </div>
          )}
          {success==="register_success" && (
            <div style={{ background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"10px", padding:"12px 16px", fontSize:"13px", color:T.green, marginBottom:"18px" }}>
              Account created! Redirecting to login...
            </div>
          )}

          <form onSubmit={e=>{e.preventDefault();dispatch(register(form));}} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <AuthField label="Full name" t={T}>
              <input type="text" value={form.fullName} required placeholder="John Doe"
                onChange={e=>setForm({...form,fullName:e.target.value})}
                style={inp}
                onFocus={e=>e.target.style.borderColor=T.accent}
                onBlur={e=>e.target.style.borderColor=T.inputBorder}
              />
            </AuthField>

            <AuthField label="Email address" t={T}>
              <input type="email" value={form.email} required placeholder="you@example.com"
                onChange={e=>setForm({...form,email:e.target.value})}
                style={inp}
                onFocus={e=>e.target.style.borderColor=T.accent}
                onBlur={e=>e.target.style.borderColor=T.inputBorder}
              />
            </AuthField>

            <AuthField label="Password" t={T}>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={form.password} required
                  placeholder="Min 8 chars, uppercase, number, special"
                  onChange={e=>setForm({...form,password:e.target.value})}
                  style={{...inp, paddingRight:"44px"}}
                  onFocus={e=>e.target.style.borderColor=T.accent}
                  onBlur={e=>e.target.style.borderColor=T.inputBorder}
                />
                <button type="button" onClick={()=>setShowPass(v=>!v)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.text3, padding:"4px", display:"flex", alignItems:"center" }}>
                  {showPass ? <EyeOff/> : <Eye/>}
                </button>
              </div>
              {/* Password strength pills */}
              <div style={{ display:"flex", gap:"6px", marginTop:"8px", flexWrap:"wrap" }}>
                {checks.map(({ok,label})=>(
                  <span key={label} style={{
                    fontSize:"11px", padding:"2px 8px", borderRadius:"999px",
                    fontFamily:"'Fira Code',monospace",
                    background:ok?"rgba(74,222,128,0.08)":T.bg3,
                    color:ok?T.green:T.text3,
                    border:`1px solid ${ok?"rgba(74,222,128,0.2)":T.border}`,
                    transition:"all 0.2s",
                  }}>
                    {ok?"✓":"·"} {label}
                  </span>
                ))}
              </div>
            </AuthField>

            <button type="submit" disabled={loading} style={{
              width:"100%", padding:"13px", marginTop:"4px",
              background:loading?T.bg3:T.accent, color:"#fff", border:"none",
              borderRadius:"10px", fontSize:"15px", fontWeight:700,
              cursor:loading?"not-allowed":"pointer",
              transition:"all 0.2s", opacity:loading?0.6:1,
              boxShadow:loading?"none":`0 4px 20px ${T.accentGlow}`,
            }}>
              {loading?"Creating account...":"Create account →"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"20px 0" }}>
            <div style={{ flex:1, height:"1px", background:T.border }}/>
            <span style={{ fontSize:"12px", color:T.text3, fontFamily:"'Fira Code',monospace" }}>or</span>
            <div style={{ flex:1, height:"1px", background:T.border }}/>
          </div>

          <a href={`${import.meta.env.VITE_API_URL}/auth/github`} style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
            width:"100%", padding:"12px", borderRadius:"10px",
            background:"rgba(255,255,255,0.04)", border:`1px solid ${T.borderH}`,
            color:T.text, textDecoration:"none", fontSize:"14px", fontWeight:500, transition:"all 0.2s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.borderColor=T.accent;}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=T.borderH;}}
          >
            <GithubIcon/> Continue with GitHub
          </a>

          <p style={{ textAlign:"center", fontSize:"13px", color:T.text3, marginTop:"20px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color:T.accent, textDecoration:"none", fontWeight:600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign:"center", fontSize:"12px", color:T.text3, marginTop:"16px" }}>
          By signing up you agree to our{" "}
          <a href="#" style={{ color:T.accent, textDecoration:"none" }}>Terms</a> &{" "}
          <a href="#" style={{ color:T.accent, textDecoration:"none" }}>Privacy</a>
        </p>
      </div>
    </div>
  );
};

const Eye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const GithubIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;

export default Register;
