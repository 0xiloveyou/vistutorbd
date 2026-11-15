"use client";

import MathFormula from "@/components/MathFormula";
import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const WIDTH = 760;
const HEIGHT = 420;
const PAD = 56;

function BarChart({ values, labels, color = VIZ_COLORS.one, mean, highlight }) {
  const max = Math.max(...values.map(Number), 1);
  const plotWidth = WIDTH - PAD * 2;
  const plotHeight = HEIGHT - PAD * 2 - 20;
  const gap = plotWidth / Math.max(values.length, 1);
  const barWidth = Math.min(64, gap * 0.62);

  return (
    <SceneCanvas label="Chart">
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="var(--border-strong)" strokeWidth="2" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={HEIGHT - PAD} stroke="var(--border-strong)" strokeWidth="2" />
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <g key={fraction}>
          <line
            x1={PAD}
            y1={HEIGHT - PAD - plotHeight * fraction}
            x2={WIDTH - PAD}
            y2={HEIGHT - PAD - plotHeight * fraction}
            stroke={VIZ_COLORS.grid}
          />
          <text x={PAD - 10} y={HEIGHT - PAD - plotHeight * fraction + 4} textAnchor="end" fontSize="11" fill="var(--text-soft)">
            {fmt(max * fraction, 1)}
          </text>
        </g>
      ))}
      {values.map((raw, index) => {
        const value = Number(raw);
        const height = (value / max) * plotHeight;
        const x = PAD + gap * index + (gap - barWidth) / 2;
        const active = highlight === index;
        return (
          <g key={index}>
            <rect
              x={x}
              y={HEIGHT - PAD - height}
              width={barWidth}
              height={Math.max(2, height)}
              rx="6"
              fill={active ? VIZ_COLORS.two : color}
              fillOpacity={active ? 0.95 : 0.72}
            />
            <text x={x + barWidth / 2} y={HEIGHT - PAD - height - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">
              {fmt(value, 2)}
            </text>
            <text x={x + barWidth / 2} y={HEIGHT - PAD + 20} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
              {labels?.[index] ?? index + 1}
            </text>
          </g>
        );
      })}
      {Number.isFinite(mean) ? (
        <g>
          <line
            x1={PAD}
            y1={HEIGHT - PAD - (mean / max) * plotHeight}
            x2={WIDTH - PAD}
            y2={HEIGHT - PAD - (mean / max) * plotHeight}
            stroke={VIZ_COLORS.four}
            strokeWidth="2.5"
            strokeDasharray="7 5"
          />
          <text x={WIDTH - PAD} y={HEIGHT - PAD - (mean / max) * plotHeight - 8} textAnchor="end" fontSize="13" fontWeight="700" fill={VIZ_COLORS.four}>
            mean = {fmt(mean, 2)}
          </text>
        </g>
      ) : null}
    </SceneCanvas>
  );
}

function FactorialChart({ n }) {
  const values = Array.from({ length: Math.max(1, Math.min(n, 7)) }, (_, index) => {
    let total = 1;
    for (let factor = 2; factor <= index + 1; factor += 1) total *= factor;
    return total;
  });
  return (
    <BarChart
      values={values}
      labels={values.map((_, index) => `${index + 1}!`)}
      color={VIZ_COLORS.five}
    />
  );
}

function MotionGraph({ data }) {
  const u = Number(data.u ?? 0);
  const a = Number(data.a ?? 2);
  const t = Number(data.t ?? 5);
  const view = { xMin: 0, xMax: Math.max(t, 1), yMin: 0, yMax: Math.max(10, (u + a * t) * t) };
  const sx = (x) => PAD + ((x - view.xMin) / (view.xMax - view.xMin)) * (WIDTH - PAD * 2);
  const sy = (y) => HEIGHT - PAD - ((y - view.yMin) / (view.yMax - view.yMin)) * (HEIGHT - PAD * 2);
  const path = (fn) => {
    let output = "";
    for (let index = 0; index <= 80; index += 1) {
      const x = view.xMin + ((view.xMax - view.xMin) * index) / 80;
      const y = fn(x);
      output += `${index === 0 ? "M" : "L"}${sx(x)} ${sy(y)} `;
    }
    return output;
  };
  return (
    <SceneCanvas label="Motion graphs">
      <Axes
        width={WIDTH}
        height={HEIGHT}
        padding={PAD}
        xMin={view.xMin}
        xMax={view.xMax}
        yMin={view.yMin}
        yMax={view.yMax}
        xStep={1}
        yStep={Math.max(1, Math.round(view.yMax / 6))}
        labelX="t"
        labelY="value"
      />
      <path d={path((x) => u + a * x)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <path d={path((x) => u * x + 0.5 * a * x * x)} fill="none" stroke={VIZ_COLORS.three} strokeWidth="3" />
      <text x={PAD + 12} y={PAD + 20} fontSize="13" fill={VIZ_COLORS.one}>v = u + at</text>
      <text x={PAD + 12} y={PAD + 40} fontSize="13" fill={VIZ_COLORS.three}>s = ut + ½at²</text>
    </SceneCanvas>
  );
}

function GreatestTerm({ n, p }) {
  const values = [];
  for (let k = 0; k <= n; k += 1) {
    let coefficient = 1;
    for (let i = 1; i <= k; i += 1) coefficient = (coefficient * (n - i + 1)) / i;
    values.push(coefficient * Math.pow(p, k) * Math.pow(1 - p, n - k));
  }
  return (
    <BarChart
      values={values.map((value) => Number(value.toFixed(4)))}
      labels={values.map((_, index) => `k=${index}`)}
      color={VIZ_COLORS.six}
      highlight={values.indexOf(Math.max(...values))}
    />
  );
}

export default function ChartScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "histogram";

  const values = (data.values ?? [4, 8, 12, 9, 6]).map(Number);
  const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length
    ? sorted.length % 2
      ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : NaN;

  let body;
  if (mode === "factorial") body = <FactorialChart n={Number(data.n ?? 5)} />;
  else if (mode === "motion-graphs") body = <MotionGraph data={data} />;
  else if (mode === "greatest-term") body = <GreatestTerm n={Number(data.n ?? 8)} p={Number(data.p ?? 0.5)} />;
  else if (mode === "range-iqr") {
    const range = sorted.length ? sorted[sorted.length - 1] - sorted[0] : NaN;
    const q1 = sorted[Math.floor((sorted.length - 1) * 0.25)];
    const q3 = sorted[Math.floor((sorted.length - 1) * 0.75)];
    body = (
      <>
        <BarChart values={sorted} labels={sorted.map((value) => String(value))} color={VIZ_COLORS.one} mean={mean} />
        <div className="chart-note">
          range {fmt(range, 2)} · Q1 {fmt(q1, 2)} · Q3 {fmt(q3, 2)} · IQR {fmt(q3 - q1, 2)}
        </div>
      </>
    );
  } else if (mode === "random-variable") {
    body = (
      <BarChart
        values={(data.probs ?? [0.25, 0.5, 0.25]).map((value) => Number(value) * 100)}
        labels={(data.values ?? [0, 1, 2]).map((value) => `x=${value}`)}
        color={VIZ_COLORS.five}
      />
    );
  } else if (mode === "variance" || mode === "mean-deviation" || mode === "grouped-dispersion") {
    const variance = values.length
      ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
      : NaN;
    body = (
      <>
        <BarChart values={values} labels={values.map((value) => String(value))} color={VIZ_COLORS.three} mean={mean} />
        <div className="chart-note">
          mean {fmt(mean, 2)} · median {fmt(median, 2)} · SD {fmt(Math.sqrt(variance), 2)}
        </div>
      </>
    );
  } else if (mode === "cv") {
    body = (
      <BarChart
        values={[Number(data.sd1 ?? 5), Number(data.sd2 ?? 10)]}
        labels={[`Set 1 (mean ${data.mean1 ?? 50})`, `Set 2 (mean ${data.mean2 ?? 80})`]}
        color={VIZ_COLORS.six}
      />
    );
  } else {
    body = (
      <BarChart
        values={values}
        labels={data.labels ?? values.map((_, index) => `class ${index + 1}`)}
        color={VIZ_COLORS.one}
        mean={mode === "mean" || mode === "histogram" ? mean : undefined}
      />
    );
  }

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          <span className="concept-chip">
            <span>mean</span>
            <strong>{fmt(mean, 2)}</strong>
          </span>
          <span className="concept-chip">
            <span>median</span>
            <strong>{fmt(median, 2)}</strong>
          </span>
          {step?.formula ? <MathFormula formula={step.formula} /> : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Statistics"}
    >
      {body}
    </SceneShell>
  );
}
