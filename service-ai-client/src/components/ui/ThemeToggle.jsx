import { useTheme } from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        cursor: "pointer",
        color: "var(--text-2)",
        fontSize: "16px",
        transition: "all 0.2s",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
