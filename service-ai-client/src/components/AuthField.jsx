// Shared form field wrapper used by Login, Register, ForgotPassword, ResetPassword
// Import from this file, NOT from Login.jsx

export function AuthField({ label, labelRight, children, t }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: t?.text || "#eef0ff" }}>
          {label}
        </label>
        {labelRight}
      </div>
      {children}
    </div>
  );
}

// Theme tokens used across all auth pages
export const DARK_T = {
  bg: "#07080f", bg2: "#0c0e1a", bg3: "#11152a",
  border: "rgba(120,130,220,0.12)", borderH: "rgba(120,130,220,0.28)",
  text: "#eef0ff", text2: "#7b85b0", text3: "#3d4468",
  accent: "#c084fc", accentGlow: "rgba(192,132,252,0.22)",
  green: "#4ade80", rose: "#fb7185",
  inputBg: "#0c0e1a", inputBorder: "rgba(120,130,220,0.2)",
};

export const LIGHT_T = {
  bg: "#f9f8ff", bg2: "#ffffff", bg3: "#f0eff9",
  border: "rgba(100,80,200,0.1)", borderH: "rgba(100,80,200,0.25)",
  text: "#0d0d1a", text2: "#5a5c7a", text3: "#9a9cb8",
  accent: "#7c3aed", accentGlow: "rgba(124,58,237,0.18)",
  green: "#16a34a", rose: "#dc2626",
  inputBg: "#f8f9fc", inputBorder: "rgba(100,80,200,0.15)",
};

// Shared icon components
export const Eye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export const GithubIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color || "currentColor"}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// Shared auth page wrapper glow/grid bg
export function AuthBg({ T, children }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", transition: "background 0.3s" }}>
      <div style={{ position: "fixed", top: "15%", right: "15%", width: 450, height: 450, borderRadius: "50%", background: `radial-gradient(circle,${T.accentGlow} 0%,transparent 70%)`, pointerEvents: "none", filter: "blur(70px)" }}/>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `radial-gradient(${T.text3} 1px,transparent 1px)`, backgroundSize: "32px 32px", opacity: 0.12, pointerEvents: "none" }}/>
      {children}
    </div>
  );
}

// Shared logo mark (text only — no SVG complexity)
export function AuthLogoMark({ T }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
      <div style={{ width: 30, height: 30, borderRadius: "8px", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polygon points="13,2 23,7.5 23,18.5 13,24 3,18.5 3,7.5" fill="none" stroke="white" strokeWidth="2"/>
          <circle cx="13" cy="13" r="3" fill="white"/>
        </svg>
      </div>
      <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "17px", color: T.text }}>
        Revuzen<span style={{ color: T.accent, fontWeight: 300 }}> AI</span>
      </span>
    </div>
  );
}