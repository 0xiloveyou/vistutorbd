"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function RatioBars({ data }) {
  const parts = Array.isArray(data.parts) ? data.parts.map(Number) : [3, 5];
  const total = Number(data.total ?? 64);
  const sum = parts.reduce((value, part) => value + part, 0);
  const unit = total / sum;
  const width = 560;
  const height = 60;
  const startX = 100;
  const y = 180;

  let cursor = startX;
  return (
    <SceneCanvas label="Ratio bars">
      <text x="380" y="56" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Share {total} in the ratio {parts.join(" : ")}
      </text>
      {parts.map((part, index) => {
        const blockWidth = (part / sum) * width;
        const x = cursor;
        cursor += blockWidth;
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={blockWidth}
              height={height}
              fill={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two, VIZ_COLORS.five][index % 4]}
              fillOpacity="0.3"
              stroke={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two, VIZ_COLORS.five][index % 4]}
              strokeWidth="2.5"
            />
            <text x={x + blockWidth / 2} y={y + 26} textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>
              {part} parts
            </text>
            <text x={x + blockWidth / 2} y={y + 48} textAnchor="middle" fontSize="13" fill={MUTED}>
              {fmt(part * unit, 1)}
            </text>
          </g>
        );
      })}
      <line x1={startX} y1={y + height + 16} x2={startX + width} y2={y + height + 16} stroke="var(--border-strong)" strokeWidth="2" />
      <text x={startX + width / 2} y={y + height + 42} textAnchor="middle" fontSize="14" fill={MUTED}>
        whole = {total}
      </text>
      <text x="380" y="338" textAnchor="middle" fontSize="16" fontWeight="700" fill={VIZ_COLORS.three}>
        {sum} parts → 1 part = {fmt(unit, 2)}
      </text>
      <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
        Multiply each ratio number by the value of one part
      </text>
    </SceneCanvas>
  );
}

function ProportionScene({ data }) {
  const a = Number(data.a ?? 3);
  const b = Number(data.b ?? 4);
  const c = Number(data.c ?? 9);
  const d = Number(data.d ?? (b * c) / a);
  const bars = [
    { label: `${a} : ${b}`, values: [a, b], colors: [VIZ_COLORS.one, VIZ_COLORS.three] },
    { label: `${c} : ${d}`, values: [c, d], colors: [VIZ_COLORS.two, VIZ_COLORS.five] },
  ];

  return (
    <SceneCanvas label="Proportion">
      <text x="380" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Equal ratios: a : b = c : d
      </text>
      {bars.map((bar, rowIndex) => {
        const total = bar.values[0] + bar.values[1] || 1;
        const y = 120 + rowIndex * 120;
        let cursor = 140;
        return (
          <g key={rowIndex}>
            <text x="100" y={y + 28} fontSize="14" fontWeight="700" fill={MUTED}>
              {bar.label}
            </text>
            {bar.values.map((value, index) => {
              const width = (value / total) * 480;
              const x = cursor;
              cursor += width;
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height="52"
                    fill={bar.colors[index]}
                    fillOpacity="0.28"
                    stroke={bar.colors[index]}
                    strokeWidth="2.5"
                  />
                  <text x={x + width / 2} y={y + 32} textAnchor="middle" fontSize="16" fontWeight="800" fill={INK}>
                    {fmt(value, 1)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <text x="380" y="330" textAnchor="middle" fontSize="16" fontWeight="700" fill={VIZ_COLORS.two}>
        {a} × {fmt(d, 2)} = {b} × {c} = {fmt(a * d, 2)}
      </text>
      <text x="380" y="370" textAnchor="middle" fontSize="14" fill={MUTED}>
        Cross-multiply: ad = bc
      </text>
    </SceneCanvas>
  );
}

export default function TapeScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "ratio";

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.d != null ? (
            <span className="concept-chip">
              <span>d</span>
              <strong>{data.d}</strong>
            </span>
          ) : null}
          {Array.isArray(data.shares) ? (
            <span className="concept-chip">
              <span>shares</span>
              <strong>{data.shares.join(", ")}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Ratio"}
    >
      {mode === "ratio" ? <RatioBars data={data} /> : <ProportionScene data={data} />}
    </SceneShell>
  );
}
