"use client";

import { getLearnCarousel } from "@/api";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 520;
const MAX_HEIGHT = 2400;
const DEFAULT_HEIGHT = 900;

/**
 * Renders a carousel document that is stored in MongoDB and fetched from the
 * API at runtime. `srcDoc` keeps the markup out of the public folder, and the
 * sandbox gives the lesson scripts no access to the parent document.
 */
export default function SecureCarouselFrame({ slug, title, onReady, loadingFallback }) {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const { t } = useLocale();

  const query = useQuery({
    queryKey: ["learn-carousel", slug],
    queryFn: () => getLearnCarousel(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const onMessage = (event) => {
      if (event.source !== frameRef.current?.contentWindow) return;
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
    if (query.isError || (!query.isLoading && !query.data?.html)) {
      onReady?.();
    }
  }, [onReady, query.data?.html, query.isError, query.isLoading]);

  if (query.isLoading) {
    if (loadingFallback) return loadingFallback;
    return (
      <div className="learn-carousel-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (query.isError || !query.data?.html) {
    return (
      <div className="empty-panel learn-carousel-error">
        <p>{t("learn.carouselUnavailable")}</p>
      </div>
    );
  }

  return (
    <div className="learn-carousel-frame">
      <iframe
        ref={frameRef}
        title={title || query.data.title?.en || "Interactive math carousel"}
        srcDoc={query.data.html}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        loading="lazy"
        allow="autoplay; fullscreen"
        style={{ height }}
        onLoad={onReady}
      />
    </div>
  );
}
