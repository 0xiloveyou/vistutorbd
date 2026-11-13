"use client";

import {
  playSpeechBlob,
  speakWithBrowser,
  stopSpeech,
  subscribeSpeechStop,
  synthesizeSpeech,
} from "@/lib/speech";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useState } from "react";

/**
 * Listen button for a companion answer. English uses the free OpenRouter TTS
 * model (via the backend); Bangla uses the device's free browser voice, with
 * a graceful fallback in both directions.
 */
export default function SpeakButton({ text, lang, className = "" }) {
  const { locale, t } = useLocale();
  const language = lang ?? locale;
  const [state, setState] = useState("idle");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeechStop(() => setState("idle"));
    return unsubscribe;
  }, []);

  const browserVoice = () => {
    const utterance = speakWithBrowser(text, language, {
      onEnd: () => setState("idle"),
      onError: () => {
        setState("idle");
        setFailed(true);
      },
    });

    if (utterance) setState("playing");
  };

  const toggle = async () => {
    if (state === "playing" || state === "loading") {
      stopSpeech();
      setState("idle");
      return;
    }

    setFailed(false);

    if (language === "bn") {
      browserVoice();
      return;
    }

    setState("loading");

    try {
      const blob = await synthesizeSpeech(text);
      const audio = await playSpeechBlob(blob);
      setState("playing");
      audio.addEventListener("ended", () => setState("idle"), { once: true });
      audio.addEventListener("error", () => setState("idle"), { once: true });
    } catch {
      // OpenRouter TTS unavailable: fall back to the device voice.
      browserVoice();
    }
  };

  const label =
    state === "playing"
      ? t("chat.stop")
      : state === "loading"
        ? t("chat.voiceLoading")
        : failed
          ? t("chat.voiceUnavailable")
          : t("chat.listen");

  return (
    <button
      type="button"
      className={`chip chip-speak ${className}`.trim()}
      onClick={toggle}
      disabled={!String(text ?? "").trim()}
      aria-pressed={state === "playing"}
      aria-label={label}
      title={failed ? t("chat.voiceUnavailable") : label}
    >
      <span aria-hidden="true">
        {state === "playing" ? "■" : state === "loading" ? "…" : "🔊"}
      </span>
      {label}
    </button>
  );
}
