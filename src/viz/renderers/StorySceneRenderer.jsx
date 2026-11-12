"use client";

import { useEffect, useState } from "react";
import { pick, range, speak } from "./shared";

function Tappable({ emoji, label, index, tapped, onTap, className = "" }) {
  return (
    <button
      type="button"
      className={`story-item${tapped.includes(index) ? " tapped" : ""} ${className}`}
      onClick={() => onTap(index, label ?? emoji)}
      aria-label={String(label ?? emoji)}
    >
      {emoji}
    </button>
  );
}

export default function StorySceneRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const scene = data.scene ?? "birds-tree";
  const [tapped, setTapped] = useState([]);

  useEffect(() => setTapped([]), [step]);

  const tap = (index, label) => {
    setTapped((current) =>
      current.includes(index) ? current : [...current, index],
    );
    speak(label, lang, sound);
  };

  if (scene === "tall-giraffe") {
    const heights = data.heights ?? [1.2, 2, 2.8];
    const ordered = data.ordered ? [...heights].sort((a, b) => a - b) : heights;
    return (
      <div className="story-scene tall">
        <div className="giraffe-row">
          {ordered.map((height, index) => (
            <button
              key={index}
              type="button"
              className="giraffe"
              style={{ fontSize: `${height}rem` }}
              onClick={() => speak(index + 1, lang, sound)}
            >
              🦒
            </button>
          ))}
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (scene === "day-strip" || scene === "today-tomorrow") {
    const days = data.days ?? [
      { label: { en: "Yesterday", bn: "গতকাল" }, emoji: "🌙" },
      { label: { en: "Today", bn: "আজ" }, emoji: "☀️" },
      { label: { en: "Tomorrow", bn: "আগামীকাল" }, emoji: "🌈" },
    ];
    return (
      <div className="story-scene day-strip">
        {days.map((day, index) => (
          <button
            key={index}
            type="button"
            className={`day-card${data.active === index ? " active" : ""}`}
            onClick={() => tap(index, pick(day.label, lang))}
          >
            <span aria-hidden="true">{day.emoji}</span>
            <strong>{pick(day.label, lang)}</strong>
          </button>
        ))}
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (scene === "plus-minus") {
    return (
      <div className="story-scene plus-minus">
        <button type="button" className="sign-card plus" onClick={() => tap(0, "plus")}>
          <span>+</span>
          <strong>{pick(data.plus, lang) || "more"}</strong>
        </button>
        <button type="button" className="sign-card minus" onClick={() => tap(1, "minus")}>
          <span>−</span>
          <strong>{pick(data.minus, lang) || "less"}</strong>
        </button>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (scene === "story-sum") {
    const groups = data.groups ?? [2, 1];
    return (
      <div className="story-scene story-sum">
        <div className="sum-row">
          {groups.map((count, index) => (
            <span key={index} className="sum-group">
              {index > 0 ? <span className="oc-op">+</span> : null}
              <span className="sum-items">
                {range(count).map((item) => (
                  <span key={item} aria-hidden="true">
                    {data.emoji ?? "🍎"}
                  </span>
                ))}
              </span>
              <strong>{count}</strong>
            </span>
          ))}
          <span className="oc-op">=</span>
          <strong className="oc-big-number">
            {groups.reduce((sum, count) => sum + count, 0)}
          </strong>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (scene === "big-small") {
    return (
      <div className="story-scene big-small">
        <span className="big-animal" aria-hidden="true">
          {data.big ?? "🐘"}
        </span>
        <span className="small-animal" aria-hidden="true">
          {data.small ?? "🐭"}
        </span>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  const items = data.items ?? 5;
  return (
    <div className="story-scene birds">
      <div className="story-tree" aria-hidden="true">
        🌳
      </div>
      <div className="story-birds">
        {range(items).map((item) => (
          <Tappable
            key={item}
            emoji={data.emoji ?? "🐦"}
            label={item}
            index={item}
            tapped={tapped}
            onTap={tap}
          />
        ))}
      </div>
      <p className="oc-caption">{pick(data.caption, lang)}</p>
    </div>
  );
}
