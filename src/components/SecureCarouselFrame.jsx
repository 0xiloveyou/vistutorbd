"use client";

import { getLearnCarousel } from "@/api";
import { synthesizeSpeech } from "@/lib/speech";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

const MIN_HEIGHT = 520;
const MAX_HEIGHT = 2400;
const DEFAULT_HEIGHT = 900;

const addBanglaSpeechBridge = (html) => {
  if (typeof html !== "string" || !html) return html;

  const bridge = `<script>
    (() => {
      if (!('speechSynthesis' in window)) return;
      const synth = window.speechSynthesis;
      const nativeSpeak = synth.speak.bind(synth);
      let audio;
      synth.speak = (utterance) => {
        if (!String(utterance.lang || '').toLowerCase().startsWith('bn')) {
          return nativeSpeak(utterance);
        }
        audio?.pause();
        parent.postMessage({ type: 'viztutor-bangla-speech', text: utterance.text }, '*');
      };
      synth.cancel = () => {
        audio?.pause();
        audio = null;
        parent.postMessage({ type: 'viztutor-bangla-speech-cancel' }, '*');
      };
      addEventListener('message', (event) => {
        if (event.source !== parent || event.data?.type !== 'viztutor-bangla-speech-result') return;
        if (event.data.error) return;
        audio?.pause();
        audio = new Audio('data:audio/mpeg;base64,' + event.data.audio);
        audio.play().catch(() => {});
      });
    })();
  </script>`;

  return /<head\b[^>]*>/i.test(html)
    ? html.replace(/<head\b[^>]*>/i, (head) => `${head}${bridge}`)
    : `${bridge}${html}`;
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Renders a carousel document that is stored in MongoDB and fetched from the
 * API at runtime. `srcDoc` keeps the markup out of the public folder, and the
 * sandbox gives the lesson scripts no access to the parent document.
 */
export default function SecureCarouselFrame({
  slug,
  title,
  onReady,
  carouselData,
  html: directHtml,
  fill = false,
}) {
  const frameRef = useRef(null);
  const speechGenerationRef = useRef(0);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const { t } = useLocale();
  const hasDirectHtml = typeof directHtml === "string" && directHtml.length > 0;

  const query = useQuery({
    queryKey: ["learn-carousel", slug],
    queryFn: () => getLearnCarousel(slug),
    enabled: Boolean(slug) && !hasDirectHtml,
    staleTime: 5 * 60 * 1000,
    initialData: carouselData,
  });

  const resolvedHtml = hasDirectHtml ? directHtml : query.data?.html;
  const frameHtml = useMemo(
    () => addBanglaSpeechBridge(resolvedHtml),
    [resolvedHtml],
  );
  const resolvedTitle = title || query.data?.title?.en;

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === "viztutor-bangla-speech-cancel") {
        speechGenerationRef.current += 1;
        return;
      }
      if (event.data?.type === "viztutor-bangla-speech") {
        const generation = ++speechGenerationRef.current;
        const text = String(event.data.text ?? "").trim().slice(0, 4000);
        if (!text) return;

        void synthesizeSpeech(text, "bn")
          .then(blobToBase64)
          .then((audio) => {
            if (generation !== speechGenerationRef.current) return;
            frameRef.current?.contentWindow?.postMessage(
              { type: "viztutor-bangla-speech-result", audio, text },
              "*",
            );
          })
          .catch(() => {
            if (generation !== speechGenerationRef.current) return;
            frameRef.current?.contentWindow?.postMessage(
              { type: "viztutor-bangla-speech-result", error: true, text },
              "*",
            );
          });
        return;
      }
      if (
        event.data?.type !== "learn-carousel-height" &&
        event.data?.type !== "visual-lessons-height"
      ) {
        return;
      }

      const raw = Number(event.data.height);
      if (!Number.isFinite(raw)) return;

      const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, raw));
      setHeight((current) => (current === next ? current : next));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (query.isError || (!query.isLoading && !resolvedHtml)) {
      onReady?.();
    }
  }, [onReady, resolvedHtml, query.isError, query.isLoading]);

  if (query.isLoading && !hasDirectHtml) {
    return (
      <div className="learn-carousel-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (query.isError || !resolvedHtml) {
    return (
      <div className="empty-panel learn-carousel-error">
        <p>{t("learn.carouselUnavailable")}</p>
      </div>
    );
  }

  return (
    <div className={`learn-carousel-frame${fill ? " is-fill" : ""}`}>
      <iframe
        ref={frameRef}
        title={resolvedTitle || "Interactive math carousel"}
        srcDoc={frameHtml}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        loading={onReady ? "eager" : "lazy"}
        allow="autoplay; fullscreen"
        style={fill ? undefined : { height }}
        onLoad={onReady}
      />
    </div>
  );
}
