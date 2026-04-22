import { useTheme } from "../context/ThemeContext";

export const useDashTheme = () => {
  const { dashTheme, setDashTheme, toggleDash } = useTheme();
  return { theme: dashTheme, toggle: toggleDash, setTheme: setDashTheme };
};