"use client";

import { useId } from "react";

export const VIZ_COLORS = {
  one: "var(--viz-1, #4f46e5)",
  two: "var(--viz-2, #f59e0b)",
  three: "var(--viz-3, #10b981)",
  four: "var(--viz-4, #ec4899)",
  five: "var(--viz-5, #8b5cf6)",
  six: "var(--viz-6, #0ea5e9)",
  grid: "var(--viz-grid, rgba(120, 130, 170, 0.22))",
  ink: "currentColor",
};

export const fmt = (value, digits = 2) => {
  if (!Number.isFinite(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return String(rounded);
};

export function SceneShell({ children, controls, footer, label }) {
  return (
    <div className="concept-scene" role="group" aria-label={label}>
      {children}
      {controls ? <div className="concept-controls">{controls}</div> : null}
      {footer ? <div className="concept-footer">{footer}</div> : null}
    </div>
  );
}

export function SceneCanvas({ children, viewBox = "0 0 760 420", label }) {
  return (
    <svg
      className="concept-canvas"
      viewBox={viewBox}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, suffix = "" }) {
  return (
    <label className="concept-slider">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <strong>
        {value}
        {suffix}
      </strong>
    </label>
  );
}

export function ToggleRow({ options, value, onChange, label }) {
  return (
    <div className="concept-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Legend({ items }) {
  return (
    <ul className="concept-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="concept-legend-dot" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/** Arrow marker with a unique id so several SVGs can share a page safely. */
export function ArrowMarker({ id, color = VIZ_COLORS.one }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto-start-reverse"
    >
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  );
}

export function useMarkerId(prefix = "viz-arrow") {
  const raw = useId();
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function Axes({
  width = 760,
  height = 420,
  padding = 52,
  xMin,
  xMax,
  yMin,
  yMax,
  xStep,
  yStep,
  labelX = "x",
  labelY = "y",
}) {
  const sx = (x) => padding + ((x - xMin) / (xMax - xMin)) * (width - padding * 2);
  const sy = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - padding * 2);

  const xTicks = [];
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
    xTicks.push(Number(x.toFixed(6)));
  }
  const yTicks = [];
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
    yTicks.push(Number(y.toFixed(6)));
  }

  return (
    <g>
      <rect
        x={padding}
        y={padding}
        width={width - padding * 2}
        height={height - padding * 2}
        fill="none"
        stroke={VIZ_COLORS.grid}
        strokeWidth="1"
      />
      {xTicks.map((tick) => (
        <g key={`x-${tick}`}>
          <line
            x1={sx(tick)}
            y1={padding}
            x2={sx(tick)}
            y2={height - padding}
            stroke={VIZ_COLORS.grid}
            strokeWidth="1"
          />
          {Math.abs(tick) > 1e-9 ? (
            <text
              x={sx(tick)}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="var(--text-soft)"
            >
              {fmt(tick, 2)}
            </text>
          ) : null}
        </g>
      ))}
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={padding}
            y1={sy(tick)}
            x2={width - padding}
            y2={sy(tick)}
            stroke={VIZ_COLORS.grid}
            strokeWidth="1"
          />
          {Math.abs(tick) > 1e-9 ? (
            <text
              x={padding - 10}
              y={sy(tick) + 4}
              textAnchor="end"
              fontSize="12"
              fill="var(--text-soft)"
            >
              {fmt(tick, 2)}
            </text>
          ) : null}
        </g>
      ))}
      {xMin < 0 && xMax > 0 ? (
        <line x1={sx(0)} y1={padding} x2={sx(0)} y2={height - padding} stroke="var(--border-strong)" strokeWidth="1.6" />
      ) : null}
      {yMin < 0 && yMax > 0 ? (
        <line x1={padding} y1={sy(0)} x2={width - padding} y2={sy(0)} stroke="var(--border-strong)" strokeWidth="1.6" />
      ) : null}
      <text x={width - padding} y={height - padding + 38} textAnchor="end" fontSize="14" fill="var(--text-muted)">
        {labelX}
      </text>
      <text x={padding - 34} y={padding + 4} fontSize="14" fill="var(--text-muted)">
        {labelY}
      </text>
    </g>
  );
}

export function curvePath(fn, xMin, xMax, sx, sy, samples = 320) {
  let path = "";
  let drawing = false;

  for (let index = 0; index <= samples; index += 1) {
    const x = xMin + ((xMax - xMin) * index) / samples;
    const y = fn(x);

    if (!Number.isFinite(y) || Math.abs(y) > 1e6) {
      drawing = false;
      continue;
    }

    const px = sx(x);
    const py = sy(y);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      drawing = false;
      continue;
    }

    path += `${drawing ? "L" : "M"}${px.toFixed(2)} ${py.toFixed(2)} `;
    drawing = true;
  }

  return path.trim();
}
