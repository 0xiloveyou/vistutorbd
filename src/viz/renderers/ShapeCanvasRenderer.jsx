"use client";

import { useEffect, useState } from "react";
import { pick, speak } from "./shared";
import ShapeConcept from "./scene/ShapeConcept";

const CONCEPT_MODES = new Set(["line-symmetry", "rotational", "circular"]);

export default function ShapeCanvasRenderer(props) {
  const mode = props.spec?.data?.mode;
  if (CONCEPT_MODES.has(mode)) {
    return <ShapeConcept {...props} />;
  }
  return <PlayShapeCanvas {...props} />;
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ec4899", "#8b5cf6"];
const BIN_TYPES = ["circle", "triangle", "square"];

function Shape({ type = "circle", size = 90, color = "var(--accent)", face = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="shape-svg"
      aria-hidden="true"
    >
      {type === "circle" ? (
        <circle cx="50" cy="50" r="42" fill={color} stroke="var(--accent-strong)" strokeWidth="4" />
      ) : null}
      {type === "triangle" ? (
        <polygon points="50,8 94,88 6,88" fill={color} stroke="var(--accent-strong)" strokeWidth="4" />
      ) : null}
      {type === "square" ? (
        <rect x="10" y="10" width="80" height="80" rx="4" fill={color} stroke="var(--accent-strong)" strokeWidth="4" />
      ) : null}
      {type === "rectangle" ? (
        <rect x="6" y="24" width="88" height="52" rx="4" fill={color} stroke="var(--accent-strong)" strokeWidth="4" />
      ) : null}
      {face ? (
        <g>
          <circle cx="38" cy="44" r="4" fill="#1f2937" />
          <circle cx="62" cy="44" r="4" fill="#1f2937" />
          <path
            d="M38 62q12 10 24 0"
            fill="none"
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </svg>
  );
}

function PlayShapeCanvas({ step, lang, spec, sound = true }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "friends";
  const shapes = data.shapes ?? [];
  const [selected, setSelected] = useState(null);
  const [solved, setSolved] = useState([]);
  const [traced, setTraced] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [sorted, setSorted] = useState(false);

  useEffect(() => {
    setSelected(null);
    setSolved([]);
    setTraced(false);
    setAligned(false);
    setSorted(false);
  }, [step]);

  if (mode === "friends") {
    return (
      <div className="shape-friends">
        {shapes.map((shape, index) => (
          <button
            key={index}
            type="button"
            className="shape-friend"
            onClick={() => speak(pick(shape.label, lang) || shape.type, lang, sound)}
          >
            <Shape
              type={shape.type}
              size={92}
              color={shape.color ?? COLORS[index % COLORS.length]}
              face
            />
            <strong>{pick(shape.label, lang) || shape.type}</strong>
          </button>
        ))}
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "hunt") {
    return (
      <div className="shape-hunt-wrap">
        <div className="shape-hunt">
          <span className="shape-scene" aria-hidden="true">
            {data.scene ?? "🏠"}
          </span>
          {shapes.map((shape, index) => (
            <button
              key={index}
              type="button"
              className={`hunt-shape${
                data.target === shape.type && solved.includes(index) ? " solved" : ""
              }`}
              style={{
                left: `${shape.x ?? 12 + index * 17}%`,
                top: `${shape.y ?? 18 + (index % 3) * 18}%`,
              }}
              onClick={() => {
                speak(pick(shape.label, lang) || shape.type, lang, sound);
                if (data.target === shape.type) {
                  setSolved((current) =>
                    current.includes(index) ? current : [...current, index],
                  );
                }
              }}
              aria-label={shape.type}
            >
              <Shape
                type={shape.type}
                size={52}
                color={shape.color ?? COLORS[index % COLORS.length]}
              />
            </button>
          ))}
        </div>
        <p className="oc-caption">
          {pick(data.prompt, lang) || `Find the ${data.target ?? "shapes"}.`}
        </p>
      </div>
    );
  }

  if (mode === "corners") {
    return (
      <div className="shape-corners">
        <Shape
          type={data.shape ?? "triangle"}
          size={170}
          color={data.color ?? COLORS[0]}
        />
        <div className="shape-fact">
          <span>
            <strong>{data.sides ?? 3}</strong> sides
          </span>
          <span>
            <strong>{data.corners ?? 3}</strong> corners
          </span>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "sorter") {
    return (
      <div className="shape-sorter">
        <div className="sorter-shapes">
          {shapes.map((shape, index) =>
            solved.includes(index) ? null : (
              <button
                key={index}
                type="button"
                className={`sorter-shape${selected === index ? " selected" : ""}`}
                onClick={() => {
                  setSelected(index);
                  speak(shape.type, lang, sound);
                }}
              >
                <Shape
                  type={shape.type}
                  size={58}
                  color={shape.color ?? COLORS[index % COLORS.length]}
                />
              </button>
            ),
          )}
        </div>
        <div className="sorter-bins">
          {BIN_TYPES.map((bin) => (
            <button
              key={bin}
              type="button"
              className="sorter-bin"
              onClick={() => {
                if (selected == null) return;
                if (shapes[selected]?.type === bin) {
                  setSolved((current) => [...current, selected]);
                  setSelected(null);
                }
              }}
            >
              <Shape type={bin} size={40} color="var(--surface-3)" />
              <span>{bin}</span>
            </button>
          ))}
        </div>
        <p className="oc-caption">
          {solved.length}/{shapes.length} sorted · {pick(data.caption, lang)}
        </p>
      </div>
    );
  }

  if (mode === "build") {
    return (
      <div className="shape-build">
        <div className="build-picture">
          <span className="build-sun">
            <Shape type="circle" size={54} color="#facc15" />
          </span>
          <span className="build-roof">
            <Shape type="triangle" size={150} color="#f59e0b" />
          </span>
          <span className="build-body">
            <Shape type="square" size={120} color="#3b82f6" />
          </span>
          <span className="build-door">
            <Shape type="rectangle" size={54} color="#8b5cf6" />
          </span>
        </div>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "trace") {
    return (
      <div className="shape-trace">
        <div className={`trace-shape${traced ? " filled" : ""}`}>
          <Shape
            type={data.shape ?? "circle"}
            size={180}
            color={traced ? "#10b981" : "transparent"}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setTraced(true);
            speak(pick(data.success, lang) || "Well done!", lang, sound);
          }}
        >
          {traced ? pick(data.success, lang) || "Traced!" : "Trace the shape"}
        </button>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "compare-length") {
    const lengths = data.lengths ?? [9, 4];
    return (
      <div className="shape-lengths">
        {lengths.map((length, index) => (
          <div className="length-row" key={index}>
            <span className="length-label">
              {pick(data.labels?.[index], lang) || `Rope ${index + 1}`}
            </span>
            <div className="length-track">
              <div
                className={`length-bar color-${index}`}
                style={{
                  width: `${Math.max(8, length * 9)}%`,
                  marginLeft: aligned ? 0 : `${index * 6}%`,
                }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setAligned(true)}
        >
          {aligned ? "Aligned!" : "Align the starts"}
        </button>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "order-size") {
    const items = (data.sizes ?? [35, 60, 90]).map((size, index) => ({
      size,
      emoji: data.emojis?.[index] ?? "🟢",
    }));
    const ordered = sorted
      ? [...items].sort((a, b) => a.size - b.size)
      : items;
    return (
      <div className="shape-order">
        <div className="order-row">
          {ordered.map((item, index) => (
            <button
              key={`${item.size}-${index}`}
              type="button"
              className="order-item"
              style={{ fontSize: `${item.size / 18}rem` }}
              onClick={() => speak(item.size, lang, sound)}
            >
              {item.emoji}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setSorted(true)}
        >
          {sorted ? "Smallest to biggest" : "Sort by size"}
        </button>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  if (mode === "digit") {
    return (
      <div className="shape-digit">
        <span className={`digit${traced ? " filled" : ""}`}>
          {data.digit ?? "1"}
        </span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setTraced(true);
            speak(pick(data.success, lang) || "Nice tracing!", lang, sound);
          }}
        >
          {traced ? "Traced!" : "Trace the digit"}
        </button>
        <p className="oc-caption">{pick(data.caption, lang)}</p>
      </div>
    );
  }

  return (
    <div className="shape-friends">
      <p className="oc-caption">{pick(data.caption, lang)}</p>
    </div>
  );
}
