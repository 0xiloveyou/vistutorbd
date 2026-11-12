"use client";

import { useEffect, useState } from "react";
import { pick, speak } from "./shared";

export default function NumberLineRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const stones =
    data.stones ??
    Array.from({ length: (data.max ?? 10) + 1 }, (_, index) => index);
  const [revealed, setRevealed] = useState([]);

  useEffect(() => setRevealed([]), [step]);

  const tap = (stone, index) => {
    if (stone === null || stone === undefined) {
      setRevealed((current) =>
        current.includes(index) ? current : [...current, index],
      );
      speak(data.answer ?? "?", lang, sound);
      return;
    }
    speak(stone, lang, sound);
  };

  return (
    <div className="nl-stage">
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
              }`}
              onClick={() => tap(stone, index)}
              aria-label={missing ? "Missing number" : `Number ${stone}`}
            >
              {missing ? revealedValue ?? "?" : stone}
            </button>
          );
        })}
      </div>
      {data.jumps?.length ? (
        <div className="nl-jumps">
          {data.jumps.map((jump, index) => (
            <span key={index} className="nl-jump">
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
