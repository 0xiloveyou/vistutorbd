"use client";

import { DEFAULT_THEME, isThemeId } from "@/lib/themes";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [mode, setModeState] = useState("light");

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("mathplay-theme");
      const storedMode = localStorage.getItem("mathplay-mode");
      if (storedTheme && isThemeId(storedTheme)) setThemeState(storedTheme);
      if (storedMode === "dark" || storedMode === "light") setModeState(storedMode);
    } catch {
      // localStorage can be unavailable in private mode.
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.mode = mode;
  }, [theme, mode]);

  const setTheme = useCallback((next) => {
    if (!isThemeId(next)) return;
    setThemeState(next);
    try {
      localStorage.setItem("mathplay-theme", next);
    } catch {}
  }, []);

  const setMode = useCallback((next) => {
    const value = next === "dark" ? "dark" : "light";
    setModeState(value);
    try {
      localStorage.setItem("mathplay-mode", value);
    } catch {}
  }, []);

  const toggleMode = useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [mode, setMode],
  );

  const value = useMemo(
    () => ({ theme, mode, setTheme, setMode, toggleMode }),
    [theme, mode, setTheme, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}