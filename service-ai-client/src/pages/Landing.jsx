import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

const DARK = {
  bg:"#07080f",bg2:"#0c0e1a",bg3:"#11152a",bg4:"#181d36",
  border:"rgba(120,130,220,0.12)",borderH:"rgba(120,130,220,0.28)",
  text:"#eef0ff",text2:"#7b85b0",text3:"#3d4468",
  accent:"#c084fc",accent2:"#e879f9",accentDim:"rgba(192,132,252,0.1)",accentGlow:"rgba(192,132,252,0.22)",
  cyan:"#22d3ee",cyanDim:"rgba(34,211,238,0.1)",
  rose:"#fb7185",roseDim:"rgba(251,113,133,0.1)",
  green:"#4ade80",navBg:"rgba(7,8,15,0.85)",
};
const LIGHT = {
  bg:"#f9f8ff",bg2:"#f0eff9",bg3:"#e8e6f5",bg4:"#ddd9f0",
  border:"rgba(100,80,200,0.12)",borderH:"rgba(100,80,200,0.28)",
  text:"#12103a",text2:"#5b5490",text3:"#a09cc0",
  accent:"#7c3aed",accent2:"#a21caf",accentDim:"rgba(124,58,237,0.1)",accentGlow:"rgba(124,58,237,0.18)",
  cyan:"#0891b2",cyanDim:"rgba(8,145,178,0.1)",
  rose:"#e11d48",roseDim:"rgba(225,29,72,0.1)",
  green:"#16a34a",navBg:"rgba(249,248,255,0.92)",
};

const FEATURES=[
  {icon:"⬡",c:"accent",title:"MCP Tool Execution",desc:"Deterministic, auditable tools via FastMCP — file read/write, git ops, test/lint runners, and PR API calls all run through a secure Model Context Protocol server.",tag:"ai-agent/mcp/server.py"},
  {icon:"◈",c:"cyan",title:"HMAC Webhook Verification",desc:"Every GitHub webhook is validated with crypto.createHmac before processing. Spoofed payloads are rejected at the middleware layer before any DB writes.",tag:"middleware/webhook-signature.js"},
  {icon:"⬟",c:"rose",title:"Safe Branch Strategy",desc:"Zero direct writes to main. AI fixes land on isolated ai/fix-{prId}-{ts} branches, validated against CI, then PR'd. Merge only if all safety gates are green.",tag:"git-workflow / safety-guards"},
  {icon:"◉",c:"accent",title:"Socket.IO Live Streaming",desc:"FastAPI pushes each step to Node.js via POST /agent/webhook. Node.js broadcasts to React via pr:{prId} rooms. Watch every agent action as it happens.",tag:"ws / broadcastStep()"},
  {icon:"⬡",c:"cyan",title:"AI Reasoning Loop",desc:"FastAPI hosts the Claude/GPT-4o reasoning loop with tool-calling. Analyze diff → plan fixes → apply → run tests → retry up to 2× if CI fails → create PR.",tag:"agents/pr-analyzer.py"},
  {icon:"◈",c:"rose",title:"JWT Auth + Rate Limiting",desc:"Node.js issues signed JWTs on login with bcrypt hashing. BullMQ + Redis handle retry queues. Path traversal guards prevent ../../../ attacks in MCP tools.",tag:"middleware/auth.js"},
];

const STEPS=[
  {n:"01",title:"Submit a PR URL",desc:"Paste any GitHub PR URL. Node.js verifies your JWT, creates a PRRun record via Prisma, and fires an async HTTP POST to FastAPI /agent/analyze."},
  {n:"02",title:"Webhook triggers pipeline",desc:"GitHub fires a pull_request.opened event. HMAC-SHA256 signature is verified, Node.js creates a temp branch ai/fix-{prId}-{timestamp} from main."},
  {n:"03",title:"FastAPI agent clones & analyzes",desc:"FastAPI clones the repo to an isolated /tmp workspace, calls MCP get_pr_diff to fetch the unified diff, then the LLM reasons over the code with tool-calling."},
  {n:"04",title:"Fixes applied & validated",desc:"AI applies code changes via MCP write_file, then calls run_command to execute npm test / pytest / lint. If tests fail, the agent retries up to 2×."},
  {n:"05",title:"PR created → CI monitored",desc:"On green tests, FastAPI calls MCP create_pr to open ai/fix-* → main. Node.js polls GitHub Checks API and auto-merges only if all status checks pass."},
  {n:"06",title:"Live results on dashboard",desc:"Every step streams to your React dashboard in real time via Socket.IO rooms using the usePRWebSocket hook. Full transparency into what the agent did."},
];

const ARCH=[
  {label:"React + Vite + Socket.IO",role:"Live dashboard, usePRWebSocket hook, step timeline",c:"accent"},
  {label:"Node.js / Express + Prisma",role:"Orchestrator, Auth, Webhook receiver, WS broadcaster",c:"cyan"},
  {label:"FastAPI + Uvicorn + FastMCP",role:"AI reasoning loop, MCP tool server, git workspace",c:"rose"},
  {label:"PostgreSQL / Prisma ORM",role:"PRRun, StepLog, User models — full audit trail",c:"accent"},
  {label:"GitHub API + Octokit",role:"PR diffs, branch management, CI status checks",c:"cyan"},
  {label:"OpenAI GPT-4o / Claude",role:"LLM with tool-calling for code analysis and fix planning",c:"rose"},
];

// const PLANS=[
//   {name:"Starter",price:"$0",sub:"/mo",popular:false,cta:"Get started free",features:["5 PR reviews / month","GitHub OAuth login","Basic AI analysis","Socket.IO live steps","Community support"]},
//   {name:"Pro",price:"$19",sub:"/mo",popular:true,cta:"Start 14-day trial",features:["Unlimited PR reviews","HMAC webhook verification","Full MCP tool suite","Priority AI (GPT-4o / Claude)","BullMQ retry queues","Slack + email notifications","Priority support"]},
//   {name:"Team",price:"$79",sub:"/mo",popular:false,cta:"Contact sales",features:["Everything in Pro","Up to 20 members","Org-level analytics","Custom rules engine","SSO / SAML","CircleCI integration","Dedicated SLA"]},
// ];

const TICKER=["MCP tool execution","HMAC webhooks","Safe branch strategy","AI reasoning loop","Socket.IO streaming","JWT auth","FastAPI agent","Zero main-branch writes","Auto PR creation","CircleCI ready"];

const Logo = ({ t }) => (
  <svg width="148" height="34" viewBox="0 0 148 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={t.accent}/>
        <stop offset="100%" stopColor={t.cyan}/>
      </linearGradient>
    </defs>
    <polygon points="17,2 30,9.5 30,24.5 17,32 4,24.5 4,9.5" fill="none" stroke="url(#lg1)" strokeWidth="1.5"/>
    <polygon points="17,8 24,12 24,20 17,24 10,20 10,12" fill={t.accentDim} stroke={t.accent} strokeWidth="1" opacity="0.8"/>
    <circle cx="17" cy="16" r="3.5" fill={t.accent}/>
    <line x1="30" y1="16" x2="36" y2="16" stroke={t.accent} strokeWidth="1.2" opacity="0.4"/>
    <line x1="36" y1="16" x2="36" y2="11" stroke={t.accent} strokeWidth="1.2" opacity="0.4"/>
    <circle cx="36" cy="11" r="1.5" fill={t.accent} opacity="0.4"/>
    <line x1="4" y1="16" x2="0" y2="16" stroke={t.cyan} strokeWidth="1" opacity="0.3"/>
    <text x="44" y="22" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="800" fontSize="17" fill={t.text} letterSpacing="-0.5">Revuzen</text>
    <text x="114" y="22" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="300" fontSize="17" fill={t.accent}>AI</text>
  </svg>
);

const Dot = ({ status, t }) => {
  const c = { completed: t.green, running: t.accent, pending: t.text3, failed: t.rose };
  return (
    <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:c[status]||c.pending }}/>
      {status==="running" && (
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:c[status], animation:"l-ping 1.4s cubic-bezier(0,0,.2,1) infinite" }}/>
      )}
    </div>
  );
};

// ── Navbar sub-component for cleanliness ──────────────────────────────────────
const NavLink = ({ label, onClick, t }) => (
  <button
    onClick={onClick}
    style={{
      fontSize: 13.5,
      fontWeight: 500,
      color: t.text2,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "6px 10px",
      borderRadius: 8,
      transition: "color .2s, background .2s",
      letterSpacing: 0.1,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.color = t.text;
      e.currentTarget.style.background = t.accentDim;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = t.text2;
      e.currentTarget.style.background = "transparent";
    }}
  >
    {label}
  </button>
);

export default function Landing() {
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);

  const { landingTheme, toggleLanding } = useTheme();
  const dark = landingTheme === "dark";

  const [scrolled, setScrolled] = useState(false);
  const [animStep, setAnimStep] = useState(1);
  const t = dark ? DARK : LIGHT;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setAnimStep(s => s < 4 ? s + 1 : 0), 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--l-bg", t.bg);
    document.body.style.background = t.bg;
    document.body.style.color = t.text;
    document.body.style.transition = "background .4s, color .4s";
  }, [dark]);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  const aC = (k) => ({ accent:t.accent, cyan:t.cyan, rose:t.rose }[k] || t.accent);
  const dC = (k) => ({ accent:t.accentDim, cyan:t.cyanDim, rose:t.roseDim }[k] || t.accentDim);

  const preview = [
    { step:"fetch_pr_diff",   status: animStep >= 1 ? "completed" : "pending" },
    { step:"clone_repo",      status: animStep >= 2 ? "completed" : animStep === 1 ? "running" : "pending" },
    { step:"analyze_code",    status: animStep >= 3 ? "completed" : animStep === 2 ? "running" : "pending" },
    { step:"apply_fixes",     status: animStep >= 4 ? "completed" : animStep === 3 ? "running" : "pending" },
    { step:"create_pr",       status: animStep === 4 ? "running" : "pending" },
  ];

  const themeVars = `
    :root {
      --l-bg: ${t.bg};
      --l-bg2: ${t.bg2};
      --l-bg3: ${t.bg3};
      --l-border: ${t.border};
      --l-borderH: ${t.borderH};
      --l-text: ${t.text};
      --l-text2: ${t.text2};
      --l-text3: ${t.text3};
      --l-accent: ${t.accent};
      --l-accent2: ${t.accent2};
      --l-accentDim: ${t.accentDim};
      --l-accentGlow: ${t.accentGlow};
      --l-cyan: ${t.cyan};
      --l-cyanDim: ${t.cyanDim};
      --l-rose: ${t.rose};
      --l-roseDim: ${t.roseDim};
      --l-green: ${t.green};
      --l-navBg: ${t.navBg};
      --l-terminal-bg: ${dark ? "#040509" : t.bg3};
    }
  `;

  // Nav links — "Pricing" removed since section is commented out
  const NAV_LINKS = [
    ["features",      "Features"],
    ["how-it-works",  "Pipeline"],
    ["architecture",  "Arch"],
    ["about",         "About"],
  ];

  return (
    <>
      <style>{themeVars}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav
        className={`l-nav${scrolled ? " scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 200,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          background: t.navBg,
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: `1px solid ${scrolled ? t.borderH : t.border}`,
          boxShadow: scrolled ? `0 2px 32px rgba(0,0,0,${dark ? 0.18 : 0.07})` : "none",
          transition: "border-color .3s, box-shadow .3s, background .4s",
        }}
      >
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <Logo t={t}/>
        </div>

        {/* Centre nav links */}
        <div
          className="hide-m"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {NAV_LINKS.map(([id, label]) => (
            <NavLink key={id} label={label} onClick={() => go(id)} t={t}/>
          ))}
        </div>

        {/* Right-side actions */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleLanding}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${t.border}`,
              background: t.bg3,
              color: t.text2,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: "pointer",
              transition: "all .2s",
              letterSpacing: 0.2,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = t.borderH;
              e.currentTarget.style.color = t.text;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = t.border;
              e.currentTarget.style.color = t.text2;
            }}
          >
            <span style={{ fontSize: 14 }}>{dark ? "☀️" : "🌙"}</span>
            <span className="hide-m">{dark ? "Light" : "Dark"}</span>
          </button>

          {/* Divider */}
          <div style={{ width:1, height:22, background:t.border, margin:"0 2px" }} className="hide-m"/>

          {token ? (
            <button
              className="l-btn-primary"
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "8px 20px",
                fontSize: 13.5,
                fontWeight: 700,
                borderRadius: 10,
              }}
            >
              Dashboard →
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "7px 18px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: t.text2,
                  background: "transparent",
                  border: `1px solid ${t.borderH}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "all .2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = t.accent;
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.background = t.accentDim;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = t.text2;
                  e.currentTarget.style.borderColor = t.borderH;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign in
              </button>
              <button
                className="l-btn-primary"
                onClick={() => navigate("/register")}
                style={{
                  padding: "8px 20px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  borderRadius: 10,
                }}
              >
                Get started
              </button>
            </>
          )}
        </div>
      </nav>
      {/* ── /NAV ────────────────────────────────────────────────────────────── */}

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"100px 24px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"8%", left:"18%", width:550, height:550, borderRadius:"50%", background:`radial-gradient(circle,${t.accentGlow} 0%,transparent 65%)`, pointerEvents:"none", filter:"blur(70px)", animation:"l-glow-breathe 6s ease-in-out infinite" }}/>
        <div style={{ position:"absolute", bottom:"12%", right:"12%", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,${t.cyanDim} 0%,transparent 70%)`, pointerEvents:"none", filter:"blur(55px)", animation:"l-glow-breathe 8s ease-in-out infinite reverse" }}/>
        <div style={{ position:"absolute", top:"50%", left:"5%", width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${t.roseDim} 0%,transparent 70%)`, pointerEvents:"none", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(${t.text3} 1px,transparent 1px)`, backgroundSize:"32px 32px", opacity:0.3, pointerEvents:"none" }}/>

        <div className="l-badge fu1">
          <div style={{ position:"relative", width:7, height:7 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:t.accent, position:"absolute" }}/>
            <div style={{ width:7, height:7, borderRadius:"50%", background:t.accent, position:"absolute", animation:"l-ping 1.5s cubic-bezier(0,0,.2,1) infinite" }}/>
          </div>
          AI-powered PR reviewer · Node.js + FastAPI + MCP
        </div>

        <h1 className="l-s-title fu2" style={{ fontSize:"clamp(52px,8.5vw,100px)", maxWidth:920, marginTop:30, marginBottom:22 }}>
          Code reviews by{" "}
          <span className="l-g-text">AI that actually</span>
          <br/>understands your code
        </h1>

        <p className="fu3" style={{ fontSize:18, color:t.text2, maxWidth:560, lineHeight:1.82, marginBottom:46, fontWeight:300 }}>
          Submit a GitHub PR and watch our AI agent analyze, fix, test, and open a review PR — all in real time, step by step, with zero direct writes to main.
        </p>

        <div className="fu4" style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginBottom:80 }}>
          <button className="l-btn-primary l-btn-xl" onClick={() => navigate("/register")}>
            Start reviewing free →
          </button>
          <button className="l-btn-ghost-xl" onClick={() => go("how-it-works")}>
            See how it works
          </button>
        </div>

        {/* Terminal */}
        <div className="fu5 l-terminal" style={{ maxWidth:540, width:"100%", animation:"l-float-y 5s ease-in-out infinite" }}>
          <div className="l-terminal-bar">
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#ff5f57" }}/>
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#febc2e" }}/>
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#28c840" }}/>
            <span style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:t.text3, marginLeft:10 }}>revuzen · pr-agent · live</span>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ position:"relative", width:7, height:7 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:t.accent, position:"absolute" }}/>
                <div style={{ width:7, height:7, borderRadius:"50%", background:t.accent, position:"absolute", animation:"l-ping 1.2s infinite" }}/>
              </div>
              <span style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:t.accent, letterSpacing:1 }}>LIVE</span>
            </div>
          </div>
          <div style={{ padding:"20px 20px 16px" }}>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:t.text3, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:t.accent }}>$</span>
              <span>revuzen analyze github.com/acme/api/pull/142</span>
              <span style={{ animation:"l-cursor-blink 1s infinite", color:t.accent }}>▋</span>
            </div>
            {preview.map(s => (
              <div key={s.step} className="l-step-row">
                <Dot status={s.status} t={t}/>
                <span style={{ fontFamily:"'Fira Code',monospace", fontSize:12, color:s.status==="pending"?t.text3:t.text, flex:1 }}>{s.step}</span>
                <span style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:s.status==="completed"?t.green:s.status==="running"?t.accent:t.text3 }}>
                  {s.status==="completed" ? "✓ done" : s.status==="running" ? "running…" : "queued"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}`, background:t.bg2, padding:"14px 0" }}>
        <div className="l-mq-wrap">
          <div className="l-mq-inner">
            {[...TICKER,...TICKER].map((x,i) => (
              <span key={i} className="l-mq-item">{x}<span className="l-mq-sep">◆</span></span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding:"110px 60px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ marginBottom:60 }}>
          <p className="l-s-label">What's inside</p>
          <h2 className="l-s-title" style={{ fontSize:"clamp(36px,4.5vw,54px)", maxWidth:520 }}>Built for serious<br/>engineering teams</h2>
        </div>
        <div className="l-fg" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="l-card" style={{ padding:"28px 24px" }}>
              <div style={{ width:46, height:46, borderRadius:12, background:dC(f.c), border:`1px solid ${aC(f.c)}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:18, color:aC(f.c) }}>{f.icon}</div>
              <h3 style={{ fontWeight:700, fontSize:16, color:t.text, marginBottom:10, letterSpacing:-0.3 }}>{f.title}</h3>
              <p style={{ fontSize:13.5, color:t.text2, lineHeight:1.76, marginBottom:18 }}>{f.desc}</p>
              <span style={{ fontFamily:"'Fira Code',monospace", fontSize:10.5, color:t.text3, background:t.bg3, border:`1px solid ${t.border}`, borderRadius:5, padding:"3px 9px" }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding:"110px 60px", background:t.bg2 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ marginBottom:64, maxWidth:500 }}>
            <p className="l-s-label">Pipeline</p>
            <h2 className="l-s-title" style={{ fontSize:"clamp(36px,4.5vw,54px)" }}>From webhook to<br/>merged PR in 60s</h2>
          </div>
          <div className="l-g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ padding:"36px 32px", borderBottom:i<4?`1px solid ${t.border}`:"none", borderRight:i%2===0?`1px solid ${t.border}`:"none" }}>
                <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:t.accent, letterSpacing:2.5, marginBottom:16 }}>{s.n}</div>
                <div style={{ width:28, height:2, background:`linear-gradient(90deg,${t.accent},transparent)`, marginBottom:16, opacity:0.5 }}/>
                <h3 style={{ fontWeight:700, fontSize:17, color:t.text, marginBottom:10, letterSpacing:-0.4 }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:t.text2, lineHeight:1.78 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" style={{ padding:"110px 60px", maxWidth:1100, margin:"0 auto" }}>
        <div className="l-g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>
          <div>
            <p className="l-s-label">Architecture</p>
            <h2 className="l-s-title" style={{ fontSize:"clamp(36px,4.5vw,52px)", marginBottom:22 }}>Three services,<br/>one coherent system</h2>
            <p style={{ color:t.text2, lineHeight:1.82, fontSize:14.5, marginBottom:28 }}>Node.js orchestrates everything — auth, webhooks, WebSocket broadcasting. FastAPI hosts the AI agent and MCP tool server. React consumes live events. PostgreSQL tracks every step.</p>
            <div style={{ fontFamily:"'Fira Code',monospace", fontSize:12, background:t.bg2, border:`1px solid ${t.border}`, borderRadius:12, padding:"18px 20px", lineHeight:2.2 }}>
              {[
                {lbl:"[GitHub Webhook]",col:t.text2},
                {lbl:"↓",col:t.text3,pad:16},
                {lbl:"[Node.js]",col:t.text,suf:"→ HMAC verify → Prisma",sufC:t.accent},
                {lbl:"↓ async HTTP POST",col:t.text3,pad:16},
                {lbl:"[FastAPI]",col:t.text,suf:"→ MCP tools → LLM loop",sufC:t.cyan},
                {lbl:"↓ /agent/webhook",col:t.text3,pad:16},
                {lbl:"[Node.js WS]",col:t.text,suf:"→ React dashboard",sufC:t.accent},
                {lbl:"↓",col:t.text3,pad:16},
                {lbl:"[GitHub API]",col:t.text,suf:"→ create_pr → CI check",sufC:t.green},
              ].map((row,i) => (
                <div key={i} style={{ paddingLeft:row.pad||0, color:row.col }}>
                  {row.lbl}{row.suf && <span style={{ color:row.sufC }}>{" "}{row.suf}</span>}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {ARCH.map((a,i) => (
              <div key={i} className="l-arch-box">
                <div style={{ width:10, height:10, borderRadius:"50%", background:aC(a.c), flexShrink:0, boxShadow:`0 0 8px ${aC(a.c)}66` }}/>
                <div>
                  <div style={{ fontWeight:600, fontSize:14.5, color:t.text, marginBottom:3 }}>{a.label}</div>
                  <div style={{ fontFamily:"'Fira Code',monospace", fontSize:11, color:t.text3 }}>{a.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding:"110px 60px", background:t.bg2 }}>
        <div className="l-g2" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <div>
            <p className="l-s-label">About us</p>
            <h2 className="l-s-title" style={{ fontSize:"clamp(36px,4.5vw,50px)", marginBottom:22 }}>Built by engineers<br/>who ship at scale</h2>
            <p style={{ color:t.text2, lineHeight:1.86, fontSize:14.5, marginBottom:18 }}>Revuzen started as an internal tool. We were tired of slow reviews, inconsistent feedback, and bugs slipping to production. So we built an AI agent that understands git diffs, runs your tests, and never touches main without CI being green.</p>
            <p style={{ color:t.text2, lineHeight:1.86, fontSize:14.5, marginBottom:36 }}>Every MCP tool call is logged, every step is tracked in PostgreSQL, and every review is reproducible. Auditability is not an afterthought — it's the foundation.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
              {[["14k+","PRs analyzed"],["<60s","Avg review time"],["99.2%","CI pass rate"]].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontWeight:800, fontSize:30, color:t.accent, letterSpacing:-1 }}>{n}</div>
                  <div style={{ fontSize:12, color:t.text3, marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              {name:"Akshat Saini",role:"",init:"AS",c:"accent"},
              {name:"Meetraj Singh",role:"",init:"MS",c:"cyan"},
              {name:"Harsh Dangi",role:"",init:"HD",c:"rose"},
            ].map(m => (
              <div key={m.name} className="l-card" style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:dC(m.c), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:aC(m.c), flexShrink:0, border:`1.5px solid ${aC(m.c)}44` }}>{m.init}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14.5, color:t.text }}>{m.name}</div>
                  <div style={{ fontSize:12, color:t.text3 }}>{m.role}</div>
                </div>
              </div>
            ))}
            <div className="l-card" style={{ padding:"16px 18px", marginTop:4 }}>
              <div style={{ fontFamily:"'Fira Code',monospace", fontSize:10.5, color:t.text3, marginBottom:12 }}>// deployment stack</div>
              {[["Node.js","node:20-alpine","port 3000"],["FastAPI","python:3.11-slim","port 8000"],["React","nginx:alpine","dist/"]].map(([svc,img,note],i) => (
                <div key={svc} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<2?`1px solid ${t.border}`:"none", fontSize:12 }}>
                  <span style={{ color:t.text, fontWeight:500 }}>{svc}</span>
                  <span style={{ fontFamily:"'Fira Code',monospace", color:t.text3, fontSize:11 }}>{img}</span>
                  <span style={{ color:t.accent, fontFamily:"'Fira Code',monospace", fontSize:11 }}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING — commented out ─────────────────────────────────────────── */}
      {/* <section id="pricing" style={{ padding:"110px 60px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p className="l-s-label">Pricing</p>
            <h2 className="l-s-title" style={{ fontSize:"clamp(36px,4.5vw,54px)", marginBottom:14 }}>Transparent pricing</h2>
            <p style={{ color:t.text2, fontSize:16, fontWeight:300 }}>Start free. No credit card required. Upgrade as your team grows.</p>
          </div>
          <div className="l-g3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {PLANS.map(p => (
              <div key={p.name} className={`l-card${p.popular?" l-plan-pop":""}`} style={{ padding:"32px 28px", position:"relative" }}>
                {p.popular && (
                  <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:t.accent, color:"#fff", borderRadius:999, padding:"4px 16px", fontSize:10.5, fontWeight:700, letterSpacing:1, fontFamily:"'Fira Code',monospace", whiteSpace:"nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontWeight:700, fontSize:17, color:t.text, marginBottom:8 }}>{p.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:26 }}>
                  <span style={{ fontWeight:800, fontSize:48, color:p.popular?t.accent:t.text, letterSpacing:-2 }}>{p.price}</span>
                  <span style={{ color:t.text3, fontSize:14 }}>{p.sub}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:30 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:14, color:t.text2 }}>
                      <span style={{ color:p.popular?t.accent:t.cyan, fontSize:12, marginTop:2, flexShrink:0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                {p.popular
                  ? <button className="l-btn-primary" style={{ width:"100%", padding:"12px", fontSize:14 }} onClick={() => navigate("/register")}>{p.cta}</button>
                  : <button className="l-btn-ghost" style={{ width:"100%", padding:"11px", fontSize:14 }} onClick={() => navigate("/register")}>{p.cta}</button>
                }
              </div>
            ))}
          </div>
        </div>
      </section> */}
      {/* ── /PRICING ────────────────────────────────────────────────────────── */}

      {/* CTA */}
      <section style={{ padding:"90px 24px", textAlign:"center", background:t.bg2, borderTop:`1px solid ${t.border}`, borderBottom:`1px solid ${t.border}` }}>
        <div style={{ maxWidth:620, margin:"0 auto" }}>
          <h2 className="l-s-title" style={{ fontSize:"clamp(34px,5vw,54px)", marginBottom:18 }}>
            Stop merging bugs.<br/>
            <span className="l-g-text">Ship with AI confidence.</span>
          </h2>
          <p style={{ color:t.text2, fontSize:16, lineHeight:1.78, marginBottom:38, fontWeight:300 }}>
            5 free reviews per month. CircleCI-ready in production. Upgrade anytime.
          </p>
          <button className="l-btn-primary l-btn-xl" onClick={() => navigate("/register")}>
            Get started free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:t.bg, borderTop:`1px solid ${t.border}`, padding:"56px 60px 32px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:44, marginBottom:52 }} className="l-g3">
            <div>
              <div style={{ marginBottom:16 }}><Logo t={t}/></div>
              <p style={{ fontSize:13.5, color:t.text3, lineHeight:1.78, maxWidth:250 }}>
                AI-powered PR reviews on Node.js, FastAPI, and MCP. Real-time. Secure. Zero writes to main.
              </p>
            </div>
            {[
              {title:"Product", links:["Features","Changelog","API Docs","Status"]},
              {title:"Company", links:["About","Blog","Careers","Press","Security"]},
              {title:"Legal",   links:["Privacy","Terms","DPA","Cookie policy"]},
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:600, fontSize:12, color:t.text, marginBottom:16, letterSpacing:0.5 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {col.links.map(l => <span key={l} className="l-fl">{l}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${t.border}`, paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <span style={{ fontSize:12, color:t.text3, fontFamily:"'Fira Code',monospace" }}>
              © 2026 Revuzen AI · All rights reserved · Built with Node.js, FastAPI & MCP
            </span>
            <div style={{ display:"flex", gap:22 }}>
              {["GitHub","Twitter","LinkedIn"].map(s => <span key={s} className="l-fl">{s}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}