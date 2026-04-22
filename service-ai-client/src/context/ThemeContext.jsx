import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [landingTheme, setLandingTheme] = useState(
    () => localStorage.getItem("landing-theme") || "dark"
  );
  const [dashTheme, setDashTheme] = useState(
    () => localStorage.getItem("dash-theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("landing-theme", landingTheme);
  }, [landingTheme]);

  useEffect(() => {
    localStorage.setItem("dash-theme", dashTheme);
  }, [dashTheme]);

  return (
    <ThemeContext.Provider
      value={{
        landingTheme,
        toggleLanding: () => setLandingTheme((t) => (t === "dark" ? "light" : "dark")),
        dashTheme,
        setDashTheme,
        toggleDash: () => setDashTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);