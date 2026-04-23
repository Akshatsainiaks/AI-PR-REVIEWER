import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

export const useDashTheme = () => {
  const [dashTheme, setDashTheme] = useState({});
  const [toggleDash, setToggleDash] = useState(() => () => {});

  useEffect(() => {
    const { dashTheme, setDashTheme, toggleDash } = useTheme();
    setDashTheme(dashTheme);
    setToggleDash(toggleDash);
  }, []);

  return { theme: dashTheme, toggle: toggleDash, setTheme: setDashTheme };
};