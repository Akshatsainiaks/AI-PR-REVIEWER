import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import api from "../services/api";

const T = {
  bg: "#07080f", text: "#eef0ff", text2: "#7b85b0", text3: "#3d4468",
  accent: "#c084fc", accentGlow: "rgba(192,132,252,0.22)",
  green: "#4ade80", rose: "#fb7185",
};

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const error = params.get("error");

      if (error || !token) {
        setStatus("error");
        setTimeout(() => navigate("/login?error=github"), 2000);
        return;
      }

      try {
        // Save token so api interceptor can send it
        localStorage.setItem("token", token);

        // Fetch full user profile — includes githubUsername, avatarUrl, fullName
        let user = null;
        try {
          const res = await api.get("/auth/me");
          user = res.data.user;
        } catch {
          // Fallback: decode JWT for basic info only
          try {
            const base64 = token.split(".")[1];
            const decoded = JSON.parse(atob(base64));
            user = { id: decoded.id, email: "", fullName: "", role: decoded.role, githubUsername: null, avatarUrl: null };
          } catch {
            user = { id: "", email: "", fullName: "", role: 2, githubUsername: null, avatarUrl: null };
          }
        }

        // Save to Redux + localStorage
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(setUser({ token, user }));

        setUserName(user.fullName?.split(" ")[0] || user.email?.split("@")[0] || "");

        // Clean token from URL bar
        window.history.replaceState({}, "", "/oauth-success");
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 1200);
      } catch {
        localStorage.removeItem("token");
        setStatus("error");
        setTimeout(() => navigate("/login?error=github"), 2000);
      }
    };

    run();
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "20px",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,${T.accentGlow} 0%,transparent 70%)`, pointerEvents: "none", filter: "blur(70px)" }} />
      <div style={{ position: "fixed", inset: 0, backgroundImage: `radial-gradient(${T.text3} 1px,transparent 1px)`, backgroundSize: "32px 32px", opacity: 0.1, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>
        {status === "loading" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
              <GithubIcon />
              <span style={{ fontSize: "20px", fontWeight: 700, color: T.text }}>Signing in with GitHub</span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${T.accent}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ fontSize: "13px", color: T.text2, fontFamily: "'Fira Code',monospace" }}>
              Authenticating your account...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "2px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 20px", color: T.green }}>
              ✓
            </div>
            <p style={{ fontSize: "20px", fontWeight: 700, color: T.text, marginBottom: "8px" }}>
              {userName ? `Welcome, ${userName}!` : "Signed in successfully"}
            </p>
            <p style={{ fontSize: "13px", color: T.text2, fontFamily: "'Fira Code',monospace" }}>
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(251,113,133,0.1)", border: "2px solid rgba(251,113,133,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 20px", color: T.rose }}>
              ✕
            </div>
            <p style={{ fontSize: "20px", fontWeight: 700, color: T.text, marginBottom: "8px" }}>
              Authentication failed
            </p>
            <p style={{ fontSize: "13px", color: T.text2, fontFamily: "'Fira Code',monospace" }}>
              Redirecting back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const GithubIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#eef0ff">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);