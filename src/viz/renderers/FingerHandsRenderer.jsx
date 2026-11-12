"use client";

import { pick, range, speak } from "./shared";

function Hand({ side, lit, lang, sound }) {
  return (
    <div className={`finger-hand ${side}`} aria-label={`${side} hand`}>
      {range(5).map((finger) => (
        <button
          key={finger}
          type="button"
          className={`finger${finger <= lit ? " lit" : ""}`}
          onClick={() => speak(finger, lang, sound)}
          aria-label={`${side} finger ${finger}`}
        >
          <span>{finger}</span>
        </button>
      ))}
      <span className="finger-palm" aria-hidden="true" />
    </div>
  );
}

export default function FingerHandsRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const left = data.left ?? 0;
  const right = data.right ?? 0;
  const total = left + right;

  return (
    <div className="finger-stage">
      <div className="finger-hands">
        <Hand side="left" lit={left} lang={lang} sound={sound} />
        <span className="finger-plus" aria-hidden="true">
          +
        </span>
        <Hand side="right" lit={right} lang={lang} sound={sound} />
      </div>
      <div className="finger-total">
        <strong>{total}</strong>
        <span>{pick(data.label, lang) || "fingers"}</span>
      </div>
      <p className="oc-caption">{pick(data.caption, lang)}</p>
    </div>
  );
}
