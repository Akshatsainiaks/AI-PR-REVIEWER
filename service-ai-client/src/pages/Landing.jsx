// import { useState, useEffect } from "react";

// const DARK = {
//   bg:"#07080f",bg2:"#0c0e1a",bg3:"#11152a",bg4:"#181d36",
//   border:"rgba(120,130,220,0.12)",borderH:"rgba(120,130,220,0.28)",
//   text:"#eef0ff",text2:"#7b85b0",text3:"#3d4468",
//   accent:"#c084fc",accent2:"#e879f9",accentDim:"rgba(192,132,252,0.1)",accentGlow:"rgba(192,132,252,0.22)",
//   cyan:"#22d3ee",cyanDim:"rgba(34,211,238,0.1)",
//   rose:"#fb7185",roseDim:"rgba(251,113,133,0.1)",
//   green:"#4ade80",navBg:"rgba(7,8,15,0.82)",
// };
// const LIGHT = {
//   bg:"#f9f8ff",bg2:"#f0eff9",bg3:"#e8e6f5",bg4:"#ddd9f0",
//   border:"rgba(100,80,200,0.12)",borderH:"rgba(100,80,200,0.28)",
//   text:"#12103a",text2:"#5b5490",text3:"#a09cc0",
//   accent:"#7c3aed",accent2:"#a21caf",accentDim:"rgba(124,58,237,0.1)",accentGlow:"rgba(124,58,237,0.18)",
//   cyan:"#0891b2",cyanDim:"rgba(8,145,178,0.1)",
//   rose:"#e11d48",roseDim:"rgba(225,29,72,0.1)",
//   green:"#16a34a",navBg:"rgba(249,248,255,0.88)",
// };

// const FEATURES=[
//   {icon:"⬡",c:"accent",title:"MCP Tool Execution",desc:"Deterministic, auditable tools via FastMCP — file read/write, git ops, test/lint runners, and PR API calls all run through a secure Model Context Protocol server.",tag:"ai-agent/mcp/server.py"},
//   {icon:"◈",c:"cyan",title:"HMAC Webhook Verification",desc:"Every GitHub webhook is validated with crypto.createHmac before processing. Spoofed payloads are rejected at the middleware layer before any DB writes.",tag:"middleware/webhook-signature.js"},
//   {icon:"⬟",c:"rose",title:"Safe Branch Strategy",desc:"Zero direct writes to main. AI fixes land on isolated ai/fix-{prId}-{ts} branches, validated against CI, then PR'd. Merge only if all safety gates are green.",tag:"git-workflow / safety-guards"},
//   {icon:"◉",c:"accent",title:"Socket.IO Live Streaming",desc:"FastAPI pushes each step to Node.js via POST /agent/webhook. Node.js broadcasts to React via pr:{prId} rooms. Watch every agent action as it happens.",tag:"ws / broadcastStep()"},
//   {icon:"⬡",c:"cyan",title:"AI Reasoning Loop",desc:"FastAPI hosts the Claude/GPT-4o reasoning loop with tool-calling. Analyze diff → plan fixes → apply → run tests → retry up to 2× if CI fails → create PR.",tag:"agents/pr-analyzer.py"},
//   {icon:"◈",c:"rose",title:"JWT Auth + Rate Limiting",desc:"Node.js issues signed JWTs on login with bcrypt hashing. BullMQ + Redis handle retry queues. Path traversal guards prevent ../../../ attacks in MCP tools.",tag:"middleware/auth.js"},
// ];
// const STEPS=[
//   {n:"01",title:"Submit a PR URL",desc:"Paste any GitHub PR URL. Node.js verifies your JWT, creates a PRRun record via Prisma, and fires an async HTTP POST to FastAPI /agent/analyze."},
//   {n:"02",title:"Webhook triggers pipeline",desc:"GitHub fires a pull_request.opened event. HMAC-SHA256 signature is verified, Node.js creates a temp branch ai/fix-{prId}-{timestamp} from main."},
//   {n:"03",title:"FastAPI agent clones & analyzes",desc:"FastAPI clones the repo to an isolated /tmp workspace, calls MCP get_pr_diff to fetch the unified diff, then the LLM reasons over the code with tool-calling."},
//   {n:"04",title:"Fixes applied & validated",desc:"AI applies code changes via MCP write_file, then calls run_command to execute npm test / pytest / lint. If tests fail, the agent retries up to 2×."},
//   {n:"05",title:"PR created → CI monitored",desc:"On green tests, FastAPI calls MCP create_pr to open ai/fix-* → main. Node.js polls GitHub Checks API and auto-merges only if all status checks pass."},
//   {n:"06",title:"Live results on dashboard",desc:"Every step streams to your React dashboard in real time via Socket.IO rooms using the usePRWebSocket hook. Full transparency into what the agent did."},
// ];
// const ARCH=[
//   {label:"React + Vite + Socket.IO",role:"Live dashboard, usePRWebSocket hook, step timeline",c:"accent"},
//   {label:"Node.js / Express + Prisma",role:"Orchestrator, Auth, Webhook receiver, WS broadcaster",c:"cyan"},
//   {label:"FastAPI + Uvicorn + FastMCP",role:"AI reasoning loop, MCP tool server, git workspace",c:"rose"},
//   {label:"PostgreSQL / Prisma ORM",role:"PRRun, StepLog, User models — full audit trail",c:"accent"},
//   {label:"GitHub API + Octokit",role:"PR diffs, branch management, CI status checks",c:"cyan"},
//   {label:"OpenAI GPT-4o / Claude",role:"LLM with tool-calling for code analysis and fix planning",c:"rose"},
// ];
// const PLANS=[
//   {name:"Starter",price:"$0",sub:"/mo",popular:false,cta:"Get started free",features:["5 PR reviews / month","GitHub OAuth login","Basic AI analysis","Socket.IO live steps","Community support"]},
//   {name:"Pro",price:"$19",sub:"/mo",popular:true,cta:"Start 14-day trial",features:["Unlimited PR reviews","HMAC webhook verification","Full MCP tool suite","Priority AI (GPT-4o / Claude)","BullMQ retry queues","Slack + email notifications","Priority support"]},
//   {name:"Team",price:"$79",sub:"/mo",popular:false,cta:"Contact sales",features:["Everything in Pro","Up to 20 members","Org-level analytics","Custom rules engine","SSO / SAML","CircleCI integration","Dedicated SLA"]},
// ];
// const TICKER=["MCP tool execution","HMAC webhooks","Safe branch strategy","AI reasoning loop","Socket.IO streaming","JWT auth","FastAPI agent","Zero main-branch writes","Auto PR creation","CircleCI ready"];

// const makeCSS=(t)=>`
//   @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@300;400;500&display=swap');
//   *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
//   html{scroll-behavior:smooth;}
//   body{background:${t.bg};color:${t.text};font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;transition:background .4s,color .4s;}
//   @keyframes fu{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
//   @keyframes float-y{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
//   @keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
//   @keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(2.2);opacity:0;}}
//   @keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 ${t.accentGlow};}50%{box-shadow:0 0 0 8px transparent;}}
//   @keyframes cursor-blink{0%,100%{opacity:1;}50%{opacity:0;}}
//   @keyframes gradient-shift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
//   @keyframes orbit{from{transform:rotate(0deg) translateX(120px) rotate(0deg);}to{transform:rotate(360deg) translateX(120px) rotate(-360deg);}}
//   @keyframes glow-breathe{0%,100%{opacity:0.4;}50%{opacity:0.8;}}
//   .fu1{animation:fu .7s cubic-bezier(.22,1,.36,1) .05s both;}
//   .fu2{animation:fu .7s cubic-bezier(.22,1,.36,1) .15s both;}
//   .fu3{animation:fu .7s cubic-bezier(.22,1,.36,1) .25s both;}
//   .fu4{animation:fu .7s cubic-bezier(.22,1,.36,1) .37s both;}
//   .fu5{animation:fu .7s cubic-bezier(.22,1,.36,1) .5s both;}
//   .nav{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 60px;background:${t.navBg};backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid ${t.border};transition:all .4s;}
//   .nav.scrolled{border-bottom-color:${t.borderH};box-shadow:0 2px 40px rgba(0,0,0,0.12);}
//   .btn-ghost{background:transparent;border:1px solid ${t.borderH};color:${t.text2};border-radius:10px;padding:8px 20px;font-size:13.5px;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s;font-weight:500;}
//   .btn-ghost:hover{border-color:${t.accent};color:${t.accent};background:${t.accentDim};}
//   .btn-primary{background:${t.accent};border:none;color:#fff;border-radius:10px;padding:9px 22px;font-size:13.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s;animation:pulse-ring 2.5s infinite;}
//   .btn-primary:hover{filter:brightness(1.15);transform:translateY(-2px);box-shadow:0 8px 32px ${t.accentGlow};}
//   .btn-xl{padding:14px 36px;font-size:16px;border-radius:12px;}
//   .btn-ghost-xl{padding:13px 36px;font-size:16px;border-radius:12px;border:1.5px solid ${t.borderH};color:${t.text2};background:transparent;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .2s;font-weight:500;}
//   .btn-ghost-xl:hover{border-color:${t.accent};color:${t.accent};background:${t.accentDim};}
//   .toggle-pill{width:52px;height:28px;border-radius:14px;border:1.5px solid ${t.borderH};background:${t.bg3};cursor:pointer;position:relative;transition:all .3s;display:flex;align-items:center;padding:0 3px;}
//   .toggle-knob{width:20px;height:20px;border-radius:10px;background:${t.accent};transition:transform .3s;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 8px ${t.accentGlow};}
//   .card{background:${t.bg2};border:1px solid ${t.border};border-radius:16px;transition:border-color .25s,transform .3s,box-shadow .3s;}
//   .card:hover{border-color:${t.borderH};transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.15);}
//   .terminal{background:${t.bg==="#07080f"?"#040509":t.bg3};border:1px solid ${t.borderH};border-radius:16px;overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,0.3);}
//   .terminal-bar{padding:10px 16px;display:flex;align-items:center;gap:7px;border-bottom:1px solid ${t.border};background:${t.bg3};}
//   .s-label{font-family:'Fira Code',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${t.accent};margin-bottom:14px;}
//   .s-title{font-weight:800;letter-spacing:-1.8px;line-height:1.04;color:${t.text};font-family:'Plus Jakarta Sans',sans-serif;}
//   .badge{display:inline-flex;align-items:center;gap:8px;background:${t.bg3};border:1px solid ${t.border};border-radius:999px;padding:6px 18px;font-family:'Fira Code',monospace;font-size:11.5px;color:${t.text2};}
//   .g-text{background:linear-gradient(135deg,${t.accent},${t.accent2},${t.cyan});background-size:200% 200%;animation:gradient-shift 4s ease infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
//   .mq-wrap{overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 12%,black 88%,transparent);}
//   .mq-inner{display:flex;width:max-content;animation:marquee 28s linear infinite;}
//   .mq-item{font-family:'Fira Code',monospace;font-size:12px;color:${t.text3};padding:0 28px;white-space:nowrap;display:flex;align-items:center;gap:10px;}
//   .mq-sep{color:${t.accent};opacity:0.5;}
//   .nav-a{font-size:14px;font-weight:500;color:${t.text2};background:none;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:color .2s;padding:0;}
//   .nav-a:hover{color:${t.text};}
//   .step-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid ${t.border};}
//   .step-row:last-child{border-bottom:none;}
//   .arch-box{background:${t.bg3};border:1px solid ${t.border};border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;transition:border-color .2s;}
//   .arch-box:hover{border-color:${t.borderH};}
//   .plan-pop{border-color:${t.accent}!important;background:linear-gradient(160deg,${t.accentDim} 0%,${t.bg2} 55%)!important;}
//   .fl{color:${t.text3};font-size:13.5px;cursor:pointer;transition:color .2s;}
//   .fl:hover{color:${t.text2};}
//   @media(max-width:960px){.nav{padding:0 20px;}.hide-m{display:none!important;}.g2{grid-template-columns:1fr!important;}.g3{grid-template-columns:1fr 1fr!important;}.fg{grid-template-columns:1fr 1fr!important;}}
//   @media(max-width:600px){.g3{grid-template-columns:1fr!important;}.fg{grid-template-columns:1fr!important;}}
// `;

// const Logo=({t})=>(
//   <svg width="148" height="34" viewBox="0 0 148 34" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <defs>
//       <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
//         <stop offset="0%" stopColor={t.accent}/>
//         <stop offset="100%" stopColor={t.cyan}/>
//       </linearGradient>
//     </defs>
//     <polygon points="17,2 30,9.5 30,24.5 17,32 4,24.5 4,9.5" fill="none" stroke="url(#lg1)" strokeWidth="1.5"/>
//     <polygon points="17,8 24,12 24,20 17,24 10,20 10,12" fill={t.accentDim} stroke={t.accent} strokeWidth="1" opacity="0.8"/>
//     <circle cx="17" cy="16" r="3.5" fill={t.accent}/>
//     <line x1="30" y1="16" x2="36" y2="16" stroke={t.accent} strokeWidth="1.2" opacity="0.4"/>
//     <line x1="36" y1="16" x2="36" y2="11" stroke={t.accent} strokeWidth="1.2" opacity="0.4"/>
//     <circle cx="36" cy="11" r="1.5" fill={t.accent} opacity="0.4"/>
//     <line x1="4" y1="16" x2="0" y2="16" stroke={t.cyan} strokeWidth="1" opacity="0.3"/>
//     <text x="44" y="22" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="800" fontSize="17" fill={t.text} letterSpacing="-0.5">Revuzen</text>
//     <text x="114" y="22" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="300" fontSize="17" fill={t.accent}>AI</text>
//   </svg>
// );

// const Dot=({status,t})=>{
//   const c={completed:t.green,running:t.accent,pending:t.text3,failed:t.rose};
//   return(
//     <div style={{position:"relative",width:8,height:8,flexShrink:0}}>
//       <div style={{width:8,height:8,borderRadius:"50%",background:c[status]||c.pending}}/>
//       {status==="running"&&<div style={{position:"absolute",inset:0,borderRadius:"50%",background:c[status],animation:"ping 1.4s cubic-bezier(0,0,.2,1) infinite"}}/>}
//     </div>
//   );
// };

// export default function Landing(){
//   const [dark,setDark]=useState(true);
//   const [scrolled,setScrolled]=useState(false);
//   const [animStep,setAnimStep]=useState(1);
//   const t=dark?DARK:LIGHT;

//   useEffect(()=>{
//     const fn=()=>setScrolled(window.scrollY>20);
//     window.addEventListener("scroll",fn);
//     return()=>window.removeEventListener("scroll",fn);
//   },[]);

//   useEffect(()=>{
//     const id=setInterval(()=>setAnimStep(s=>s<4?s+1:0),2400);
//     return()=>clearInterval(id);
//   },[]);

//   const go=(id)=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
//   const aC=(k)=>({accent:t.accent,cyan:t.cyan,rose:t.rose}[k]||t.accent);
//   const dC=(k)=>({accent:t.accentDim,cyan:t.cyanDim,rose:t.roseDim}[k]||t.accentDim);

//   const preview=[
//     {step:"fetch_pr_diff",status:animStep>=1?"completed":"pending"},
//     {step:"clone_repo",status:animStep>=2?"completed":animStep===1?"running":"pending"},
//     {step:"analyze_code",status:animStep>=3?"completed":animStep===2?"running":"pending"},
//     {step:"apply_fixes",status:animStep>=4?"completed":animStep===3?"running":"pending"},
//     {step:"create_pr",status:animStep===4?"running":"pending"},
//   ];

//   return(
//     <>
//       <style>{makeCSS(t)}</style>

//       {/* NAV */}
//       <nav className={`nav${scrolled?" scrolled":""}`}>
//         <Logo t={t}/>
//         <div style={{display:"flex",alignItems:"center",gap:20}}>
//           {[["features","Features"],["how-it-works","Pipeline"],["architecture","Arch"],["pricing","Pricing"]].map(([id,l])=>(
//             <button key={id} className="nav-a hide-m" onClick={()=>go(id)}>{l}</button>
//           ))}
//           <button className="toggle-pill" onClick={()=>setDark(d=>!d)} title="Toggle theme">
//             <div className="toggle-knob" style={{transform:dark?"translateX(0)":"translateX(24px)"}}>
//               {dark?"🌙":"☀️"}
//             </div>
//           </button>
//           <button className="btn-ghost">Sign in</button>
//           <button className="btn-primary">Get started</button>
//         </div>
//       </nav>

//       {/* HERO */}
//       <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"100px 24px 80px",textAlign:"center",position:"relative",overflow:"hidden"}}>
//         {/* Animated orbs */}
//         <div style={{position:"absolute",top:"8%",left:"18%",width:550,height:550,borderRadius:"50%",background:`radial-gradient(circle,${t.accentGlow} 0%,transparent 65%)`,pointerEvents:"none",filter:"blur(70px)",animation:"glow-breathe 6s ease-in-out infinite"}}/>
//         <div style={{position:"absolute",bottom:"12%",right:"12%",width:380,height:380,borderRadius:"50%",background:`radial-gradient(circle,${t.cyanDim} 0%,transparent 70%)`,pointerEvents:"none",filter:"blur(55px)",animation:"glow-breathe 8s ease-in-out infinite reverse"}}/>
//         <div style={{position:"absolute",top:"50%",left:"5%",width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${t.roseDim} 0%,transparent 70%)`,pointerEvents:"none",filter:"blur(40px)"}}/>
//         {/* Dot grid - subtle */}
//         <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(${t.text3} 1px,transparent 1px)`,backgroundSize:"32px 32px",opacity:0.3,pointerEvents:"none"}}/>

//         <div className="badge fu1">
//           <div style={{position:"relative",width:7,height:7}}>
//             <div style={{width:7,height:7,borderRadius:"50%",background:t.accent,position:"absolute"}}/>
//             <div style={{width:7,height:7,borderRadius:"50%",background:t.accent,position:"absolute",animation:"ping 1.5s cubic-bezier(0,0,.2,1) infinite"}}/>
//           </div>
//           AI-powered PR reviewer · Node.js + FastAPI + MCP
//         </div>

//         <h1 className="s-title fu2" style={{fontSize:"clamp(52px,8.5vw,100px)",maxWidth:920,marginTop:30,marginBottom:22}}>
//           Code reviews by{" "}
//           <span className="g-text">AI that actually</span>
//           <br/>understands your code
//         </h1>

//         <p className="fu3" style={{fontSize:18,color:t.text2,maxWidth:560,lineHeight:1.82,marginBottom:46,fontWeight:300}}>
//           Submit a GitHub PR and watch our AI agent analyze, fix, test, and open a review PR — all in real time, step by step, with zero direct writes to main.
//         </p>

//         <div className="fu4" style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center",marginBottom:80}}>
//           <button className="btn-primary btn-xl">Start reviewing free →</button>
//           <button className="btn-ghost-xl" onClick={()=>go("how-it-works")}>See how it works</button>
//         </div>

//         {/* Terminal card */}
//         <div className="fu5 terminal" style={{maxWidth:540,width:"100%",animation:"float-y 5s ease-in-out infinite"}}>
//           <div className="terminal-bar">
//             <div style={{width:11,height:11,borderRadius:"50%",background:"#ff5f57"}}/>
//             <div style={{width:11,height:11,borderRadius:"50%",background:"#febc2e"}}/>
//             <div style={{width:11,height:11,borderRadius:"50%",background:"#28c840"}}/>
//             <span style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:t.text3,marginLeft:10}}>revuzen · pr-agent · live</span>
//             <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
//               <div style={{position:"relative",width:7,height:7}}>
//                 <div style={{width:7,height:7,borderRadius:"50%",background:t.accent,position:"absolute"}}/>
//                 <div style={{width:7,height:7,borderRadius:"50%",background:t.accent,position:"absolute",animation:"ping 1.2s infinite"}}/>
//               </div>
//               <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:t.accent,letterSpacing:1}}>LIVE</span>
//             </div>
//           </div>
//           <div style={{padding:"20px 20px 16px"}}>
//             <div style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:t.text3,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
//               <span style={{color:t.accent}}>$</span>
//               <span>revuzen analyze github.com/acme/api/pull/142</span>
//               <span style={{animation:"cursor-blink 1s infinite",color:t.accent}}>▋</span>
//             </div>
//             {preview.map(s=>(
//               <div key={s.step} className="step-row">
//                 <Dot status={s.status} t={t}/>
//                 <span style={{fontFamily:"'Fira Code',monospace",fontSize:12,color:s.status==="pending"?t.text3:t.text,flex:1}}>{s.step}</span>
//                 <span style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:s.status==="completed"?t.green:s.status==="running"?t.accent:t.text3}}>
//                   {s.status==="completed"?"✓ done":s.status==="running"?"running…":"queued"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* TICKER */}
//       <div style={{borderTop:`1px solid ${t.border}`,borderBottom:`1px solid ${t.border}`,background:t.bg2,padding:"14px 0"}}>
//         <div className="mq-wrap">
//           <div className="mq-inner">
//             {[...TICKER,...TICKER].map((x,i)=><span key={i} className="mq-item">{x}<span className="mq-sep">◆</span></span>)}
//           </div>
//         </div>
//       </div>

//       {/* FEATURES */}
//       <section id="features" style={{padding:"110px 60px",maxWidth:1200,margin:"0 auto"}}>
//         <div style={{marginBottom:60}}>
//           <p className="s-label">What's inside</p>
//           <h2 className="s-title" style={{fontSize:"clamp(36px,4.5vw,54px)",maxWidth:520}}>Built for serious<br/>engineering teams</h2>
//         </div>
//         <div className="fg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
//           {FEATURES.map((f,i)=>(
//             <div key={i} className="card" style={{padding:"28px 24px"}}>
//               <div style={{width:46,height:46,borderRadius:12,background:dC(f.c),border:`1px solid ${aC(f.c)}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:18,color:aC(f.c)}}>{f.icon}</div>
//               <h3 style={{fontWeight:700,fontSize:16,color:t.text,marginBottom:10,letterSpacing:-0.3}}>{f.title}</h3>
//               <p style={{fontSize:13.5,color:t.text2,lineHeight:1.76,marginBottom:18}}>{f.desc}</p>
//               <span style={{fontFamily:"'Fira Code',monospace",fontSize:10.5,color:t.text3,background:t.bg3,border:`1px solid ${t.border}`,borderRadius:5,padding:"3px 9px"}}>{f.tag}</span>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="how-it-works" style={{padding:"110px 60px",background:t.bg2}}>
//         <div style={{maxWidth:1100,margin:"0 auto"}}>
//           <div style={{marginBottom:64,maxWidth:500}}>
//             <p className="s-label">Pipeline</p>
//             <h2 className="s-title" style={{fontSize:"clamp(36px,4.5vw,54px)"}}>From webhook to<br/>merged PR in 60s</h2>
//           </div>
//           <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
//             {STEPS.map((s,i)=>(
//               <div key={i} style={{padding:"36px 32px",borderBottom:i<4?`1px solid ${t.border}`:"none",borderRight:i%2===0?`1px solid ${t.border}`:"none"}}>
//                 <div style={{fontFamily:"'Fira Code',monospace",fontSize:10,color:t.accent,letterSpacing:2.5,marginBottom:16}}>{s.n}</div>
//                 <div style={{width:28,height:2,background:`linear-gradient(90deg,${t.accent},transparent)`,marginBottom:16,opacity:0.5}}/>
//                 <h3 style={{fontWeight:700,fontSize:17,color:t.text,marginBottom:10,letterSpacing:-0.4}}>{s.title}</h3>
//                 <p style={{fontSize:13.5,color:t.text2,lineHeight:1.78}}>{s.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ARCHITECTURE */}
//       <section id="architecture" style={{padding:"110px 60px",maxWidth:1100,margin:"0 auto"}}>
//         <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"start"}}>
//           <div>
//             <p className="s-label">Architecture</p>
//             <h2 className="s-title" style={{fontSize:"clamp(36px,4.5vw,52px)",marginBottom:22}}>Three services,<br/>one coherent system</h2>
//             <p style={{color:t.text2,lineHeight:1.82,fontSize:14.5,marginBottom:28}}>Node.js orchestrates everything — auth, webhooks, WebSocket broadcasting. FastAPI hosts the AI agent and MCP tool server. React consumes live events. PostgreSQL tracks every step.</p>
//             <div style={{fontFamily:"'Fira Code',monospace",fontSize:12,background:t.bg2,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",lineHeight:2.2}}>
//               {[
//                 {lbl:"[GitHub Webhook]",col:t.text2},
//                 {lbl:"↓",col:t.text3,pad:16},
//                 {lbl:"[Node.js]",col:t.text,suf:"→ HMAC verify → Prisma",sufC:t.accent},
//                 {lbl:"↓ async HTTP POST",col:t.text3,pad:16},
//                 {lbl:"[FastAPI]",col:t.text,suf:"→ MCP tools → LLM loop",sufC:t.cyan},
//                 {lbl:"↓ /agent/webhook",col:t.text3,pad:16},
//                 {lbl:"[Node.js WS]",col:t.text,suf:"→ React dashboard",sufC:t.accent},
//                 {lbl:"↓",col:t.text3,pad:16},
//                 {lbl:"[GitHub API]",col:t.text,suf:"→ create_pr → CI check",sufC:t.green},
//               ].map((row,i)=>(
//                 <div key={i} style={{paddingLeft:row.pad||0,color:row.col}}>
//                   {row.lbl}{row.suf&&<span style={{color:row.sufC}}>{" "}{row.suf}</span>}
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div style={{display:"flex",flexDirection:"column",gap:10}}>
//             {ARCH.map((a,i)=>(
//               <div key={i} className="arch-box">
//                 <div style={{width:10,height:10,borderRadius:"50%",background:aC(a.c),flexShrink:0,boxShadow:`0 0 8px ${aC(a.c)}66`}}/>
//                 <div>
//                   <div style={{fontWeight:600,fontSize:14.5,color:t.text,marginBottom:3}}>{a.label}</div>
//                   <div style={{fontFamily:"'Fira Code',monospace",fontSize:11,color:t.text3}}>{a.role}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ABOUT */}
//       <section id="about" style={{padding:"110px 60px",background:t.bg2}}>
//         <div className="g2" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center"}}>
//           <div>
//             <p className="s-label">About us</p>
//             <h2 className="s-title" style={{fontSize:"clamp(36px,4.5vw,50px)",marginBottom:22}}>Built by engineers<br/>who ship at scale</h2>
//             <p style={{color:t.text2,lineHeight:1.86,fontSize:14.5,marginBottom:18}}>Revuzen started as an internal tool. We were tired of slow reviews, inconsistent feedback, and bugs slipping to production. So we built an AI agent that understands git diffs, runs your tests, and never touches main without CI being green.</p>
//             <p style={{color:t.text2,lineHeight:1.86,fontSize:14.5,marginBottom:36}}>Every MCP tool call is logged, every step is tracked in PostgreSQL, and every review is reproducible. Auditability is not an afterthought — it's the foundation.</p>
//             <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
//               {[["14k+","PRs analyzed"],["<60s","Avg review time"],["99.2%","CI pass rate"]].map(([n,l])=>(
//                 <div key={l}>
//                   <div style={{fontWeight:800,fontSize:30,color:t.accent,letterSpacing:-1}}>{n}</div>
//                   <div style={{fontSize:12,color:t.text3,marginTop:4}}>{l}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div style={{display:"flex",flexDirection:"column",gap:12}}>
//             {[{name:"Arjun Mehta",role:"Co-founder & CEO",init:"AM",c:"accent"},{name:"Sofia Reyes",role:"Co-founder & CTO",init:"SR",c:"cyan"},{name:"Liam Chen",role:"Head of AI",init:"LC",c:"rose"}].map(m=>(
//               <div key={m.name} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px"}}>
//                 <div style={{width:44,height:44,borderRadius:"50%",background:dC(m.c),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:aC(m.c),flexShrink:0,border:`1.5px solid ${aC(m.c)}44`}}>{m.init}</div>
//                 <div>
//                   <div style={{fontWeight:600,fontSize:14.5,color:t.text}}>{m.name}</div>
//                   <div style={{fontSize:12,color:t.text3}}>{m.role}</div>
//                 </div>
//               </div>
//             ))}
//             <div className="card" style={{padding:"16px 18px",marginTop:4}}>
//               <div style={{fontFamily:"'Fira Code',monospace",fontSize:10.5,color:t.text3,marginBottom:12}}>// deployment stack</div>
//               {[["Node.js","node:20-alpine","port 3000"],["FastAPI","python:3.11-slim","port 8000"],["React","nginx:alpine","dist/"]].map(([svc,img,note],i)=>(
//                 <div key={svc} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<2?`1px solid ${t.border}`:"none",fontSize:12}}>
//                   <span style={{color:t.text,fontWeight:500}}>{svc}</span>
//                   <span style={{fontFamily:"'Fira Code',monospace",color:t.text3,fontSize:11}}>{img}</span>
//                   <span style={{color:t.accent,fontFamily:"'Fira Code',monospace",fontSize:11}}>{note}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* PRICING */}
//       <section id="pricing" style={{padding:"110px 60px"}}>
//         <div style={{maxWidth:1100,margin:"0 auto"}}>
//           <div style={{textAlign:"center",marginBottom:60}}>
//             <p className="s-label">Pricing</p>
//             <h2 className="s-title" style={{fontSize:"clamp(36px,4.5vw,54px)",marginBottom:14}}>Transparent pricing</h2>
//             <p style={{color:t.text2,fontSize:16,fontWeight:300}}>Start free. No credit card required. Upgrade as your team grows.</p>
//           </div>
//           <div className="g3" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
//             {PLANS.map(p=>(
//               <div key={p.name} className={`card${p.popular?" plan-pop":""}`} style={{padding:"32px 28px",position:"relative"}}>
//                 {p.popular&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:t.accent,color:"#fff",borderRadius:999,padding:"4px 16px",fontSize:10.5,fontWeight:700,letterSpacing:1,fontFamily:"'Fira Code',monospace",whiteSpace:"nowrap"}}>MOST POPULAR</div>}
//                 <div style={{fontWeight:700,fontSize:17,color:t.text,marginBottom:8}}>{p.name}</div>
//                 <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:26}}>
//                   <span style={{fontWeight:800,fontSize:48,color:p.popular?t.accent:t.text,letterSpacing:-2}}>{p.price}</span>
//                   <span style={{color:t.text3,fontSize:14}}>{p.sub}</span>
//                 </div>
//                 <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:30}}>
//                   {p.features.map(f=>(
//                     <div key={f} style={{display:"flex",gap:10,alignItems:"flex-start",fontSize:14,color:t.text2}}>
//                       <span style={{color:p.popular?t.accent:t.cyan,fontSize:12,marginTop:2,flexShrink:0}}>✓</span>{f}
//                     </div>
//                   ))}
//                 </div>
//                 {p.popular
//                   ?<button className="btn-primary" style={{width:"100%",padding:"12px",fontSize:14}}>{p.cta}</button>
//                   :<button className="btn-ghost" style={{width:"100%",padding:"11px",fontSize:14}}>{p.cta}</button>
//                 }
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section style={{padding:"90px 24px",textAlign:"center",background:t.bg2,borderTop:`1px solid ${t.border}`,borderBottom:`1px solid ${t.border}`}}>
//         <div style={{maxWidth:620,margin:"0 auto"}}>
//           <h2 className="s-title" style={{fontSize:"clamp(34px,5vw,54px)",marginBottom:18}}>
//             Stop merging bugs.<br/>
//             <span className="g-text">Ship with AI confidence.</span>
//           </h2>
//           <p style={{color:t.text2,fontSize:16,lineHeight:1.78,marginBottom:38,fontWeight:300}}>5 free reviews per month. CircleCI-ready in production. Upgrade anytime.</p>
//           <button className="btn-primary btn-xl">Get started free →</button>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer style={{background:t.bg,borderTop:`1px solid ${t.border}`,padding:"56px 60px 32px"}}>
//         <div style={{maxWidth:1100,margin:"0 auto"}}>
//           <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:44,marginBottom:52}} className="g3">
//             <div>
//               <div style={{marginBottom:16}}><Logo t={t}/></div>
//               <p style={{fontSize:13.5,color:t.text3,lineHeight:1.78,maxWidth:250}}>AI-powered PR reviews on Node.js, FastAPI, and MCP. Real-time. Secure. Zero writes to main.</p>
//             </div>
//             {[
//               {title:"Product",links:["Features","Pricing","Changelog","API Docs","Status"]},
//               {title:"Company",links:["About","Blog","Careers","Press","Security"]},
//               {title:"Legal",links:["Privacy","Terms","DPA","Cookie policy"]},
//             ].map(col=>(
//               <div key={col.title}>
//                 <div style={{fontWeight:600,fontSize:12,color:t.text,marginBottom:16,letterSpacing:0.5}}>{col.title}</div>
//                 <div style={{display:"flex",flexDirection:"column",gap:10}}>
//                   {col.links.map(l=><span key={l} className="fl">{l}</span>)}
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div style={{borderTop:`1px solid ${t.border}`,paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
//             <span style={{fontSize:12,color:t.text3,fontFamily:"'Fira Code',monospace"}}>© 2026 Revuzen AI · All rights reserved · Built with Node.js, FastAPI & MCP</span>
//             <div style={{display:"flex",gap:22}}>
//               {["GitHub","Twitter","LinkedIn"].map(s=><span key={s} className="fl">{s}</span>)}
//             </div>
//           </div>
//         </div>
//       </footer>
//     </>
//   );
// }




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
  green:"#4ade80",navBg:"rgba(7,8,15,0.82)",
};
const LIGHT = {
  bg:"#f9f8ff",bg2:"#f0eff9",bg3:"#e8e6f5",bg4:"#ddd9f0",
  border:"rgba(100,80,200,0.12)",borderH:"rgba(100,80,200,0.28)",
  text:"#12103a",text2:"#5b5490",text3:"#a09cc0",
  accent:"#7c3aed",accent2:"#a21caf",accentDim:"rgba(124,58,237,0.1)",accentGlow:"rgba(124,58,237,0.18)",
  cyan:"#0891b2",cyanDim:"rgba(8,145,178,0.1)",
  rose:"#e11d48",roseDim:"rgba(225,29,72,0.1)",
  green:"#16a34a",navBg:"rgba(249,248,255,0.88)",
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

const PLANS=[
  {name:"Starter",price:"$0",sub:"/mo",popular:false,cta:"Get started free",features:["5 PR reviews / month","GitHub OAuth login","Basic AI analysis","Socket.IO live steps","Community support"]},
  {name:"Pro",price:"$19",sub:"/mo",popular:true,cta:"Start 14-day trial",features:["Unlimited PR reviews","HMAC webhook verification","Full MCP tool suite","Priority AI (GPT-4o / Claude)","BullMQ retry queues","Slack + email notifications","Priority support"]},
  {name:"Team",price:"$79",sub:"/mo",popular:false,cta:"Contact sales",features:["Everything in Pro","Up to 20 members","Org-level analytics","Custom rules engine","SSO / SAML","CircleCI integration","Dedicated SLA"]},
];

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

export default function Landing() {
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);

  // ── Use ThemeContext instead of local state so theme persists ──
  const { landingTheme, toggleLanding } = useTheme();
  const dark = landingTheme === "dark";
  // ─────────────────────────────────────────────────────────────

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

  // Apply theme tokens to <html> so body background updates
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

  // ── CSS vars injected as a single <style> block scoped to landing ──
  // We only inject theme-dependent tokens here. Animations & layout
  // classes are in index.css as .l-* classes so they aren't duplicated.
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

  return (
    <>
      {/* Only inject CSS custom properties — all class rules live in index.css */}
      <style>{themeVars}</style>

      {/* NAV */}
      <nav className={`l-nav${scrolled ? " scrolled" : ""}`}>
        <Logo t={t}/>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {[["features","Features"],["how-it-works","Pipeline"],["architecture","Arch"],["pricing","Pricing"]].map(([id,l]) => (
            <button key={id} className="l-nav-a hide-m" onClick={() => go(id)}>{l}</button>
          ))}

          {/* Theme toggle — uses ThemeContext via toggleLanding */}
          <button className="l-theme-btn" onClick={toggleLanding}>
            <span style={{ fontSize:15 }}>{dark ? "☀️" : "🌙"}</span>
            {dark ? "Light" : "Dark"}
          </button>

          {token ? (
            <button className="l-btn-primary" onClick={() => navigate("/dashboard")}>
              Dashboard →
            </button>
          ) : (
            <>
              <button className="l-btn-ghost" onClick={() => navigate("/login")}>
                Sign in
              </button>
              <button className="l-btn-primary" onClick={() => navigate("/register")}>
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

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
              {name:"Arjun Mehta",role:"Co-founder & CEO",init:"AM",c:"accent"},
              {name:"Sofia Reyes",role:"Co-founder & CTO",init:"SR",c:"cyan"},
              {name:"Liam Chen",role:"Head of AI",init:"LC",c:"rose"},
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

      {/* PRICING */}
      <section id="pricing" style={{ padding:"110px 60px" }}>
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
      </section>

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
              {title:"Product", links:["Features","Pricing","Changelog","API Docs","Status"]},
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