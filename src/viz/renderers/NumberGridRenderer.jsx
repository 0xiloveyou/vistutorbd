"use client";

import { useEffect, useState } from "react";
import { pick, range, speak } from "./shared";
import NumberGridConcept from "./scene/NumberGridConcept";

const CONCEPT_MODES = new Set(["pascal", "pascal-identity", "permutation", "series"]);

export default function NumberGridRenderer(props) {
  const mode = props.spec?.data?.mode;
  if (CONCEPT_MODES.has(mode)) {
    return <NumberGridConcept {...props} />;
  }
  return <PlayNumberGrid {...props} />;
}

function PlayNumberGrid({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const max = data.max ?? 10;
  const highlight = new Set(data.highlight ?? []);
  const target = data.target;
  const mode = data.mode ?? "parade";
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(null);

  useEffect(() => {
    setFound([]);
    setWrong(null);
  }, [step]);

  const tap = (number) => {
    speak(number, lang, sound);
    if (mode !== "find" || !target) return;
    if (number === target) {
      setFound((current) =>
        current.includes(number) ? current : [...current, number],
      );
    } else {
      setWrong(number);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="ng-stage">
      <div
        className={`number-grid-viz${max > 20 ? " dense" : ""}`}
        style={{ "--ng-cols": max > 20 ? 10 : 5 }}
      >
        {range(max).map((number) => (
          <button
            key={number}
            type="button"
            className={[
              "ng-cell",
              highlight.has(number) ? "hot" : "",
              found.includes(number) ? "found" : "",
              wrong === number ? "wrong" : "",
              mode === "song" && number % 10 === 0 ? "tens" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => tap(number)}
            aria-label={`Number ${number}`}
          >
            {number}
          </button>
        ))}
      </div>
      {target ? (
        <p className="ng-target">
          {pick(data.prompt, lang) || `Find ${target}`}
          {found.includes(target) ? " ✓" : ""}
        </p>
      ) : (
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      )}
    </div>
  );
}
