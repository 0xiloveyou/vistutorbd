"use client";

import MathFormula from "@/components/MathFormula";
import CompanionStage from "@/components/companion/CompanionStage";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRenderer } from "./renderers";
import { normalizeVizSpec } from "./spec";

export default function VizPlayer({
  vizId,
  spec,
  topicSlug,
  companionMode = false,
  initialStep = 0,
  soundEnabled = true,
  onStepChange,
  onAsk,
}) {
  const { locale, t } = useLocale();
  const playerSpec = useMemo(() => normalizeVizSpec(spec), [spec]);
  const steps = useMemo(() => playerSpec?.steps ?? [], [playerSpec]);
  const [index, setIndex] = useState(
    Math.min(Math.max(initialStep, 0), Math.max(steps.length - 1, 0)),
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(soundEnabled);
  const [lang, setLang] = useState(locale);
  const frameRef = useRef(null);
  const initialisedRef = useRef(false);

  const step = steps[index];
  const Renderer = getRenderer(playerSpec?.renderer ?? "placeholder");
  const hasSteps = steps.length > 0;

  useEffect(() => {
    setLang(locale);
  }, [locale]);

  // The spec arrives asynchronously, so the initial index is applied as soon
  // as the steps exist rather than being lost on the first render.
  useEffect(() => {
    if (initialisedRef.current || !steps.length) return;
    initialisedRef.current = true;
    setIndex(Math.min(Math.max(initialStep, 0), steps.length - 1));
  }, [initialStep, steps.length]);

  useEffect(() => {
    setIndex((current) =>
      Math.min(current, Math.max(steps.length - 1, 0)),
    );
  }, [steps.length]);

  useEffect(() => {
    if (!playing || !hasSteps) return undefined;

    const delay = 1400 / Math.max(speed, 0.25);
    frameRef.current = setTimeout(() => {
      setIndex((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, delay);

    return () => clearTimeout(frameRef.current);
  }, [playing, index, speed, steps.length, hasSteps]);

  useEffect(() => {
    onStepChange?.(index, step);
  }, [index, step, onStepChange]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setPlaying(false);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") {
        setIndex((value) => Math.min(value + 1, Math.max(steps.length - 1, 0)));
      }
      if (event.key === "ArrowLeft") {
        setIndex((value) => Math.max(value - 1, 0));
      }
      if (event.key.toLowerCase() === "r") {
        setIndex(0);
        setPlaying(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [steps.length]);

  const go = (next) => {
    setIndex(Math.min(Math.max(next, 0), Math.max(steps.length - 1, 0)));
  };

  return (
    <section className="viz-shell" aria-label={t("topic.visualization")}>
      <header className="viz-head">
        <div>
          <span className="eyebrow">{t("topic.visualization")}</span>
          <h2>{playerSpec?.title?.[lang] ?? vizId ?? "Visualization player"}</h2>
        </div>
        <div className="viz-meta">
          <span className="badge">{playerSpec?.kind ?? "stepper"}</span>
          <span className="badge">{playerSpec?.renderer ?? "placeholder"}</span>
        </div>
      </header>

      <div className="viz-stage">
        <Renderer step={step} lang={lang} spec={playerSpec} sound={sound} />
      </div>

      {companionMode ? (
        <CompanionStage
          vizId={vizId}
          topicSlug={topicSlug}
          step={step}
          stepIndex={index}
          steps={steps}
          onAsk={onAsk}
        />
      ) : (
        <div className="viz-narration" aria-live="polite">
          <p>{step?.narration?.[lang] ?? t("topic.noVisualization")}</p>
          {step?.formula ? <MathFormula formula={step.formula} block /> : null}
        </div>
      )}

      <div className="viz-controls">
        <button type="button" onClick={() => go(0)} disabled={!hasSteps}>
          ⏮
        </button>
        <button type="button" onClick={() => go(index - 1)} disabled={!hasSteps}>
          ◀
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setPlaying((value) => !value)}
          disabled={!hasSteps}
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button type="button" onClick={() => go(index + 1)} disabled={!hasSteps}>
          ▶
        </button>

        <label className="inline-field">
          Speed
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.25"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <span className="mono">{speed}×</span>
        </label>

        <button type="button" onClick={() => setSound((value) => !value)}>
          {sound ? "🔊" : "🔇"}
        </button>

        <div className="segmented" role="group" aria-label={t("common.language")}>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={lang === "bn" ? "active" : ""}
            onClick={() => setLang("bn")}
          >
            বাং
          </button>
        </div>
      </div>

      <input
        className="viz-scrub"
        type="range"
        min="0"
        max={Math.max(steps.length - 1, 0)}
        value={index}
        onChange={(event) => go(Number(event.target.value))}
        disabled={!hasSteps}
        aria-label="Timeline"
      />

      <footer className="viz-foot">
        <span className="mono">
          {hasSteps ? `${index + 1} / ${steps.length}` : "0 / 0"}
        </span>
        {onAsk ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onAsk(index, step)}>
            {t("topic.askCompanion")}
          </button>
        ) : null}
        <span className="muted mono">{vizId ?? "no vizId"}</span>
      </footer>
    </section>
  );
}