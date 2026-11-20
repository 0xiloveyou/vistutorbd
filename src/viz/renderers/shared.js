import {
  playSpeechBlob,
  speakWithBrowser,
  stopSpeech,
  synthesizeSpeech,
} from "@/lib/speech";

let banglaSpeechRequest = 0;

export function pick(value, lang = "en") {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return value[lang] ?? value.en ?? "";
}

export function speak(text, lang = "en", enabled = true) {
  if (!enabled || typeof window === "undefined") return;

  if (lang === "bn") {
    const requestId = ++banglaSpeechRequest;
    stopSpeech();
    void synthesizeSpeech(text, "bn")
      .then((blob) => {
        if (requestId === banglaSpeechRequest) return playSpeechBlob(blob);
        return undefined;
      })
      .catch(() => {
        if (requestId === banglaSpeechRequest) speakWithBrowser(text, "bn");
      });
    return;
  }

  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = lang === "bn" ? "bn-BD" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech is a nice-to-have; never break a lesson because a voice is missing.
  }
}

export const range = (count) =>
  Array.from({ length: Math.max(0, count) }, (_, index) => index + 1);
