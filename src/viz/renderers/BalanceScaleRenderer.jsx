"use client";

import { pick, speak } from "./shared";

export default function BalanceScaleRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const left = data.left ?? { emoji: "🐘", weight: 10 };
  const right = data.right ?? { emoji: "🐭", weight: 2 };
  const leftIsObject = left !== null && typeof left === "object";
  const rightIsObject = right !== null && typeof right === "object";
  const leftLabel = leftIsObject ? left.emoji : String(left);
  const rightLabel = rightIsObject ? right.emoji : String(right);
  const leftValue = leftIsObject ? left.weight : null;
  const rightValue = rightIsObject ? right.weight : null;
  const isEquation = !leftIsObject || !rightIsObject || data.mode === "solve";
  const tilt =
    data.tilt ??
    (isEquation
      ? "level"
      : leftValue > rightValue
        ? "left"
        : leftValue < rightValue
          ? "right"
          : "level");

  return (
    <div className="balance-viz">
      <div className={`balance-beam ${tilt}`}>
        <div className="balance-pan left">
          <button
            type="button"
            onClick={() => speak(leftLabel, lang, sound)}
            aria-label={`left side ${leftLabel}`}
          >
            {leftLabel}
          </button>
          <span className="balance-string" aria-hidden="true" />
          {leftValue != null ? <small>{leftValue}</small> : null}
        </div>
        <div className="balance-pivot" aria-hidden="true" />
        <div className="balance-pan right">
          <button
            type="button"
            onClick={() => speak(rightLabel, lang, sound)}
            aria-label={`right side ${rightLabel}`}
          >
            {rightLabel}
          </button>
          <span className="balance-string" aria-hidden="true" />
          {rightValue != null ? <small>{rightValue}</small> : null}
        </div>
      </div>
      <div className="balance-stand" aria-hidden="true" />
      <p className="oc-caption">
        {pick(data.caption, lang) ||
          (isEquation
            ? `${leftLabel} = ${rightLabel}`
            : tilt === "level"
              ? "They balance!"
              : `${tilt} is heavier.`)}
      </p>
    </div>
  );
}
