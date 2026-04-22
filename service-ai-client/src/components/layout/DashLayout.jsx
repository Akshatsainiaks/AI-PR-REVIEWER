import { useState } from "react";
import { useDashTheme } from "../../hooks/useDashTheme";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useDashTheme();

  return (
    <div
      id="dash-root"
      className={`dash-${theme}`}
      style={{
        minHeight: "100vh",
        background: "var(--db)",
        color: "var(--dt)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "background 0.3s, color 0.3s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} />
        <main style={{
          flex: 1, minWidth: 0,
          padding: "28px 32px",
          overflowX: "hidden",
          transition: "all 0.25s",
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}