"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CompanionContext = createContext(null);
const MODE_KEY = "viztutor-companion-mode";

/**
 * Holds the learner's visualization mode ("companion" | "default"), the
 * current visualization context so the dock chat can answer about the visible
 * step, and whether the companion chat is open.
 */
export function CompanionProvider({ children }) {
  const [mode, setModeState] = useState("default");
  const [context, setContextState] = useState({});
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MODE_KEY);
      if (stored === "companion" || stored === "default") setModeState(stored);
    } catch {
      // localStorage can be unavailable in private mode.
    }
  }, []);

  const setMode = useCallback((next) => {
    const value = next === "companion" ? "companion" : "default";
    setModeState(value);
    try {
      localStorage.setItem(MODE_KEY, value);
    } catch {}
  }, []);

  const setContext = useCallback((next) => {
    setContextState((current) => ({ ...current, ...next }));
  }, []);

  const value = useMemo(
    () => ({ mode, setMode, context, setContext, chatOpen, setChatOpen }),
    [mode, setMode, context, setContext, chatOpen],
  );

  return (
    <CompanionContext.Provider value={value}>
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const value = useContext(CompanionContext);

  if (!value) {
    throw new Error("useCompanion must be used inside CompanionProvider");
  }

  return value;
}
