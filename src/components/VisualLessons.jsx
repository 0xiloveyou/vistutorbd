"use client";

import { useEffect, useRef, useState } from "react";

export default function VisualLessons() {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const onMessage = (event) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.type !== "visual-lessons-height"
      ) return;

      const nextHeight = Number(event.data.height);
      if (Number.isFinite(nextHeight)) {
        setHeight(Math.min(1800, Math.max(520, nextHeight)));
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <section className="home-visual-lessons" aria-label="Interactive visual lessons">
      <iframe
        ref={frameRef}
        src="/visual-lessons.html"
        title="Interactive animated math lessons"
        loading="eager"
        style={{ height }}
      />
    </section>
  );
}
