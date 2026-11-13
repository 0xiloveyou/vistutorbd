"use client";

import { useEffect, useMemo, useState } from "react";
import { pick, speak } from "./shared";

const sameNumber = (a, b) => String(a) === String(b);

export default function NumberLineRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const stones = useMemo(
    () =>
      Array.isArray(data.stones)
        ? data.stones
        : Array.from({ length: (data.max ?? 10) + 1 }, (_, index) => index),
    [data.stones, data.max],
  );
  const jumps = useMemo(
    () => (Array.isArray(data.jumps) ? data.jumps : []),
    [data.jumps],
  );
  const jumpKey = jumps
    .map((jump) => `${jump.from}->${jump.to}`)
    .join("|");
  const basePosition = jumps.length
    ? jumps[0].from
    : (data.position ?? data.start ?? stones[0]);
  const startIndex = stones.findIndex((stone) => sameNumber(stone, basePosition));

  const [revealed, setRevealed] = useState([]);
  const [frogIndex, setFrogIndex] = useState(Math.max(startIndex, 0));
  const [hopping, setHopping] = useState(false);

  useEffect(() => {
    const from = stones.findIndex((stone) => sameNumber(stone, basePosition));
    setRevealed([]);
    setFrogIndex(Math.max(from, 0));
    setHopping(false);

    if (!jumps.length) return undefined;

    const timers = [];
    let delay = 250;

    for (const jump of jumps) {
      const to = stones.findIndex((stone) => sameNumber(stone, jump.to));
      if (to < 0) continue;
      timers.push(
        window.setTimeout(() => {
          setFrogIndex(to);
          setHopping(true);
        }, delay),
      );
      timers.push(window.setTimeout(() => setHopping(false), delay + 750));
      delay += 950;
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [step, stones, basePosition, jumpKey]);

  const tap = (stone, index) => {
    if (stone === null || stone === undefined) {
      setRevealed((current) =>
        current.includes(index) ? current : [...current, index],
      );
      speak(data.answer ?? "?", lang, sound);
      return;
    }
    setFrogIndex(index);
    setHopping(true);
    window.setTimeout(() => setHopping(false), 700);
    speak(stone, lang, sound);
  };

  const frogLeft =
    stones.length > 0
      ? `${((frogIndex + 0.5) / stones.length) * 100}%`
      : "50%";

  return (
    <div className="nl-stage">
      <div className="nl-line" style={{ "--nl-count": stones.length }}>
        <div className="nl-frog-lane" aria-hidden="true">
          <span
            className={`nl-frog${hopping ? " hop" : ""}`}
            style={{ left: frogLeft }}
          >
            🐸
          </span>
        </div>
        <div className="nl-track" aria-hidden="true" />
        <div className="nl-stones">
          {stones.map((stone, index) => {
            const missing = stone === null || stone === undefined;
            const revealedValue = revealed.includes(index) ? data.answer : null;
            return (
              <button
                key={`${index}-${stone ?? "missing"}`}
                type="button"
                className={`nl-stone${missing ? " missing" : ""}${
                  revealedValue != null ? " revealed" : ""
                }${index === frogIndex ? " current" : ""}`}
                onClick={() => tap(stone, index)}
                aria-label={missing ? "Missing number" : `Number ${stone}`}
              >
                {missing ? (revealedValue ?? "?") : stone}
              </button>
            );
          })}
        </div>
      </div>
      {jumps.length ? (
        <div className="nl-jumps">
          {jumps.map((jump, index) => (
            <span
              key={index}
              className={`nl-jump ${
                jump.dir === "−" || jump.dir === "-" ? "back" : "forward"
              }`}
            >
              {jump.from} {jump.dir ?? "+"} {Math.abs(jump.to - jump.from)} ={" "}
              {jump.to}
            </span>
          ))}
        </div>
      ) : null}
      {data.prompt ? (
        <p className="nl-prompt">{pick(data.prompt, lang)}</p>
      ) : null}
    </div>
  );
}
