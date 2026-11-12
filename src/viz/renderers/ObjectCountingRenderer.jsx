"use client";

import { useEffect, useState } from "react";
import { pick, range, speak } from "./shared";

const merge = (spec, step) => ({ ...(spec?.data ?? {}), ...(step?.data ?? {}) });

function Items({ count, emoji, counted, autoCount, onTap, fadedFrom = Infinity }) {
  return (
    <div className="oc-items">
      {range(count).map((number) => {
        const isCounted = counted.includes(number) || number <= autoCount;
        const isGone = number >= fadedFrom;
        return (
          <button
            key={number}
            type="button"
            className={`oc-item${isCounted ? " counted" : ""}${isGone ? " gone" : ""}`}
            onClick={() => onTap?.(number)}
            aria-label={`${emoji} ${number}`}
          >
            <span aria-hidden="true">{emoji}</span>
            <small>{number}</small>
          </button>
        );
      })}
    </div>
  );
}

export default function ObjectCountingRenderer({ step, lang, spec, sound = true }) {
  const data = merge(spec, step);
  const mode = data.mode ?? "count";
  const emoji = data.emoji ?? "🍎";
  const groups = data.groups ?? [{ emoji, count: data.items ?? 5 }];
  const total = groups.reduce((sum, group) => sum + (group.count ?? 0), 0);
  const removed = data.removed ?? 0;
  const remaining = Math.max(0, total - removed);
  const autoCount = data.count ?? 0;
  const [counted, setCounted] = useState([]);

  useEffect(() => setCounted([]), [step]);

  const tap = (number) => {
    setCounted((current) =>
      current.includes(number)
        ? current.filter((item) => item !== number)
        : [...current, number],
    );
    speak(number, lang, sound);
  };

  if (mode === "join") {
    return (
      <div className="oc-stage">
        <div className="oc-join">
          {groups.map((group, index) => (
            <span key={index} className="oc-join-part">
              {index > 0 ? <span className="oc-op">+</span> : null}
              <span className="oc-group">
                <Items
                  count={group.count ?? 0}
                  emoji={group.emoji ?? emoji}
                  counted={[]}
                  autoCount={group.count ?? 0}
                  onTap={(number) => speak(number, lang, sound)}
                />
                <strong>{group.count ?? 0}</strong>
              </span>
            </span>
          ))}
          <span className="oc-op">=</span>
          <strong className="oc-big-number">{total}</strong>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "take" || mode === "zero") {
    return (
      <div className="oc-stage">
        <div className="oc-take">
          <Items
            count={total}
            emoji={emoji}
            counted={[]}
            autoCount={remaining}
            fadedFrom={remaining + 1}
            onTap={(number) => speak(number, lang, sound)}
          />
          <div className="oc-total">
            <span className="oc-number">{remaining}</span>
            <span>{pick(data.label, lang) || "left"}</span>
          </div>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "compare" || mode === "compare-size") {
    return (
      <div className="oc-stage">
        <div className="oc-compare">
          {groups.map((group, index) => (
            <span key={index} className="oc-compare-group">
              {mode === "compare-size" ? (
                <span
                  className="oc-size"
                  style={{ fontSize: `${(group.size ?? 1) * 2.6}rem` }}
                  aria-hidden="true"
                >
                  {group.emoji ?? emoji}
                </span>
              ) : (
                <Items
                  count={group.count ?? 0}
                  emoji={group.emoji ?? emoji}
                  counted={[]}
                  autoCount={0}
                  onTap={(number) => speak(number, lang, sound)}
                />
              )}
              <strong>{pick(group.label, lang) || group.count}</strong>
            </span>
          ))}
        </div>
        {data.pair ? <div className="oc-pair-line" aria-hidden="true" /> : null}
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "match") {
    const numeral = data.numeral ?? total;
    const matched = counted.length === numeral;
    return (
      <div className="oc-stage">
        <div className="oc-match">
          <div className="oc-numeral">{numeral}</div>
          <Items
            count={total}
            emoji={emoji}
            counted={counted}
            autoCount={0}
            onTap={tap}
          />
        </div>
        <p className={`oc-caption${matched ? " success" : ""}`}>
          {matched
            ? pick(data.success, lang) || "Match!"
            : pick(data.caption, lang) || `Tap ${numeral} objects.`}
        </p>
      </div>
    );
  }

  return (
    <div className="oc-stage">
      <Items
        count={total}
        emoji={emoji}
        counted={counted}
        autoCount={autoCount}
        onTap={tap}
      />
      <div className="oc-total">
        <span className="oc-number">{counted.length || autoCount}</span>
        <span>{pick(data.label, lang) || "counted"}</span>
      </div>
      <p className="oc-caption">{pick(data.caption, lang)}</p>
    </div>
  );
}
