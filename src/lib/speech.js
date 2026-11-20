import { API_BASE_URL } from "./apiClient";

let activeAudio = null;
const stopListeners = new Set();

/**
 * Lets every Listen button reset when another message starts or stops audio, so
 * only one answer shows "Stop" at a time.
 */
export function subscribeSpeechStop(listener) {
  stopListeners.add(listener);
  return () => {
    stopListeners.delete(listener);
  };
}

const notifySpeechStopped = () => {
  for (const listener of stopListeners) {
    try {
      listener();
    } catch {
      // A broken listener must never block audio cleanup.
    }
  }
};

/** Strips Markdown/LaTeX so a voice reads words instead of symbols. */
export function cleanSpeechText(text) {
  return String(text ?? "")
    .replace(/\$\$?/g, " ")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}^_]/g, " ")
    .replace(/`{1,3}/g, " ")
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Stops any OpenRouter audio and any in-progress browser utterance. */
export function stopSpeech() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }

  if (speechSupported()) {
    window.speechSynthesis.cancel();
  }

  notifySpeechStopped();
}

/**
 * Free, on-device voice used when backend speech generation is unavailable.
 */
export function speakWithBrowser(text, lang, { onEnd, onError } = {}) {
  const clean = cleanSpeechText(text);

  if (!clean || !speechSupported()) {
    onError?.(new Error("Browser speech is not available."));
    return null;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = lang === "bn" ? "bn-BD" : "en-US";
  if (lang === "bn") {
    const banglaVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => /^bn(?:-|_)/i.test(voice.lang));
    if (!banglaVoice) {
      onError?.(new Error("No Bangla voice is installed in this browser."));
      return null;
    }
    utterance.voice = banglaVoice;
  }
  utterance.rate = 0.98;
  utterance.pitch = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => {
    onError?.(new Error(event?.error || "Browser speech failed."));
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/** Fetches MP3 speech from the backend's OpenRouter free TTS route. */
export async function synthesizeSpeech(text, lang = "en") {
  const response = await fetch(`${API_BASE_URL}/chat/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      text: cleanSpeechText(text),
      lang,
      format: "mp3",
    }),
  });

  if (!response.ok) {
    let message = "Voice is not available right now.";
    try {
      const data = await response.json();
      if (typeof data?.message === "string") message = data.message;
    } catch {
      // The endpoint may return HTML when the backend is restarting.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  if (!blob.size) throw new Error("Voice is not available right now.");
  return blob;
}

export async function playSpeechBlob(blob) {
  stopSpeech();

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  activeAudio = audio;

  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (activeAudio === audio) activeAudio = null;
  };

  audio.addEventListener("ended", cleanup, { once: true });
  audio.addEventListener("error", cleanup, { once: true });

  await audio.play();
  return audio;
}
