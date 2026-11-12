"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ClassContext = createContext(null);

export function ClassProvider({ bands = [], children }) {
  const [bandId, setBandId] = useState(null);
  const [levelId, setLevelId] = useState(null);

  useEffect(() => {
    try {
      const storedBand = localStorage.getItem("mathplay-band");
      const storedLevel = localStorage.getItem("mathplay-level");
      if (storedBand) setBandId(storedBand);
      if (storedLevel) setLevelId(storedLevel);
    } catch {}
  }, []);

  const select = useCallback((nextBandId, nextLevelId) => {
    setBandId(nextBandId || null);
    setLevelId(nextLevelId || null);
    try {
      if (nextBandId) localStorage.setItem("mathplay-band", nextBandId);
      if (nextLevelId) localStorage.setItem("mathplay-level", nextLevelId);
    } catch {}
  }, []);

  const band = useMemo(
    () => bands.find((item) => item.id === bandId) ?? null,
    [bands, bandId],
  );

  const level = useMemo(
    () => band?.levels?.find((item) => item.id === levelId) ?? null,
    [band, levelId],
  );

  const value = useMemo(
    () => ({ bands, bandId, levelId, band, level, select }),
    [bands, bandId, levelId, band, level, select],
  );

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
}

export function useClassSelection() {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClassSelection must be used inside ClassProvider");
  }
  return context;
}