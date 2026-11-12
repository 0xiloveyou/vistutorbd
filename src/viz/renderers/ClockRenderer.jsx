"use client";

import { useEffect, useState } from "react";
import { pick, speak } from "./shared";

const activityForHour = (hour) => {
  if (hour >= 5 && hour < 12) return { emoji: "🌅", label: { en: "Morning", bn: "সকাল" } };
  if (hour >= 12 && hour < 17) return { emoji: "☀️", label: { en: "Noon", bn: "দুপুর" } };
  if (hour >= 17 && hour < 20) return { emoji: "🌇", label: { en: "Evening", bn: "সন্ধ্যা" } };
  return { emoji: "🌙", label: { en: "Night", bn: "রাত" } };
};

export default function ClockRenderer({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const [hour, setHour] = useState(data.hour ?? 3);
  const [minute, setMinute] = useState(data.minute ?? 0);

  useEffect(() => {
    setHour(data.hour ?? 3);
    setMinute(data.minute ?? 0);
  }, [step, data.hour, data.minute]);

  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  const activity = activityForHour(hour);
  const digital = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const changeHour = (delta) => {
    const next = (hour + delta + 24) % 24;
    setHour(next);
    speak(next, lang, sound);
  };

  const changeMinute = (delta) => {
    const next = (minute + delta + 60) % 60;
    setMinute(next);
  };

  return (
    <div className="clock-viz">
      <div className="clock-face-wrap">
        <svg viewBox="0 0 200 200" className="clock-face" role="img" aria-label={`Clock ${digital}`}>
          <circle cx="100" cy="100" r="92" className="clock-rim" />
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={index}
              x1="100"
              y1="16"
              x2="100"
              y2="26"
              className="clock-tick"
              transform={`rotate(${index * 30} 100 100)`}
            />
          ))}
          {Array.from({ length: 12 }, (_, index) => {
            const angle = (index * 30 * Math.PI) / 180;
            return (
              <text
                key={index}
                x={100 + 70 * Math.sin(angle)}
                y={100 - 70 * Math.cos(angle) + 5}
                className="clock-number"
                textAnchor="middle"
              >
                {index === 0 ? 12 : index}
              </text>
            );
          })}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="48"
            className="clock-hand hour"
            transform={`rotate(${hourAngle} 100 100)`}
          />
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            className="clock-hand minute"
            transform={`rotate(${minuteAngle} 100 100)`}
          />
          <circle cx="100" cy="100" r="7" className="clock-center" />
        </svg>
        <div className="clock-digital">{digital}</div>
      </div>

      <div className="clock-side">
        <div className="clock-activity">
          <span aria-hidden="true">{data.emoji ?? activity.emoji}</span>
          <strong>{pick(data.activity, lang) || pick(activity.label, lang)}</strong>
        </div>
        <div className="clock-buttons">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => changeHour(1)}>
            +1 hour
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => changeHour(-1)}>
            −1 hour
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => changeMinute(5)}>
            +5 min
          </button>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    </div>
  );
}
