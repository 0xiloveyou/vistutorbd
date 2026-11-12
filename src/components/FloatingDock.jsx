"use client";

import CompanionRobot from "@/components/companion/CompanionRobot";
import { useCompanion } from "@/providers/companion.provider";
import { useLocale } from "@/providers/locale.provider";
import { useCallback, useEffect, useState } from "react";
import ChatPanel from "./ChatPanel";

export default function FloatingDock() {
  const { t } = useLocale();
  const { chatOpen, setChatOpen } = useCompanion();
  const [mode, setMode] = useState("companion");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const scrollByPage = useCallback((direction) => {
    window.scrollBy({
      top: direction * Math.round(window.innerHeight * 0.8),
      behavior: "smooth",
    });
  }, []);

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

  return (
    <aside
      className={chatOpen ? "floating-dock chat-open" : "floating-dock"}
      aria-label={t("dock.utilities")}
    >
      {chatOpen ? (
        <div className="dock-chat">
          <ChatPanel compact onClose={() => setChatOpen(false)} />
        </div>
      ) : mode === "utilities" ? (
        <div className="dock-panel">
          <strong className="dock-tools-title">{t("dock.utilities")}</strong>
          <div className="dock-utilities">
            <button type="button" onClick={() => scrollByPage(-1)}>
              <span className="tool-sign" aria-hidden="true">↑</span>{t("dock.pageUp")}
            </button>
            <button type="button" onClick={() => scrollByPage(1)}>
              <span className="tool-sign" aria-hidden="true">↓</span>{t("dock.pageDown")}
            </button>
            <div className="dock-timer">
              <span className="timer-sign" aria-hidden="true">◷</span>
              <span className="mono">{formatted}</span>
              <button type="button" onClick={() => setRunning((value) => !value)} aria-label={running ? "Pause timer" : "Start timer"}>
                {running ? "Ⅱ" : "▶"}
              </button>
              <button type="button" onClick={() => { setRunning(false); setSeconds(0); }} aria-label="Reset timer">
                ↺
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="dock-buttons">
        <button
          type="button"
          className="dock-fab"
          onClick={() => setChatOpen((value) => !value)}
          aria-label={chatOpen ? t("chat.close") : t("chat.title")}
          title={chatOpen ? t("chat.close") : t("chat.title")}
          aria-expanded={chatOpen}
        >
          <CompanionRobot emotion="happy" className="dock-fab-robot" />
        </button>

        <button
          type="button"
          className={mode === "utilities" ? "dock-rotate tools-active" : "dock-rotate"}
          onClick={() => {
            setChatOpen(false);
            setMode((value) => value === "companion" ? "utilities" : "companion");
          }}
          aria-label={mode === "companion" ? t("dock.utilities") : t("dock.companion")}
          title={mode === "companion" ? t("dock.utilities") : t("dock.companion")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7.5 7.5A6.5 6.5 0 0 1 18 9l1.5 2M16.5 16.5A6.5 6.5 0 0 1 6 15l-1.5-2" />
            <path d="M19.5 7.5V11H16M4.5 16.5V13H8" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

