"use client";

import { pick, speak } from "./shared";

export default function BalanceScaleRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const left = data.left ?? { emoji: "🐘", weight: 10 };
  const right = data.right ?? { emoji: "🐭", weight: 2 };
  const tilt =
    data.tilt ??
    (left.weight > right.weight
      ? "left"
      : left.weight < right.weight
        ? "right"
        : "level");

  return (
    <div className="balance-viz">
      <div className={`balance-beam ${tilt}`}>
        <div className="balance-pan left">
          <button
            type="button"
            onClick={() => speak(left.weight, lang, sound)}
            aria-label={`left side ${left.weight}`}
          >
            {left.emoji}
          </button>
          <span className="balance-string" aria-hidden="true" />
          <small>{left.weight}</small>
        </div>
        <div className="balance-pivot" aria-hidden="true" />
        <div className="balance-pan right">
          <button
            type="button"
            onClick={() => speak(right.weight, lang, sound)}
            aria-label={`right side ${right.weight}`}
          >
            {right.emoji}
          </button>
          <span className="balance-string" aria-hidden="true" />
          <small>{right.weight}</small>
        </div>
      </div>
      <div className="balance-stand" aria-hidden="true" />
      <p className="oc-caption">
        {pick(data.caption, lang) ||
          (tilt === "level" ? "They balance!" : `${tilt} is heavier.`)}
      </p>
    </div>
  );
}
