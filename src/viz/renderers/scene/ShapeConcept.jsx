"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

function LineSymmetry({ data }) {
  const lines = Number(data.lines ?? 4);
  return (
    <SceneCanvas label="Line symmetry">
      <rect x="270" y="110" width="220" height="220" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="3" />
      {lines >= 1 ? <line x1="380" y1="90" x2="380" y2="350" stroke={VIZ_COLORS.two} strokeWidth="2.4" strokeDasharray="8 6" /> : null}
      {lines >= 2 ? <line x1="250" y1="220" x2="510" y2="220" stroke={VIZ_COLORS.two} strokeWidth="2.4" strokeDasharray="8 6" /> : null}
      {lines >= 3 ? <line x1="300" y1="140" x2="460" y2="300" stroke={VIZ_COLORS.three} strokeWidth="2.4" strokeDasharray="8 6" /> : null}
      {lines >= 4 ? <line x1="460" y1="140" x2="300" y2="300" stroke={VIZ_COLORS.three} strokeWidth="2.4" strokeDasharray="8 6" /> : null}
      <text x="380" y="56" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        A square has {lines} lines of symmetry
      </text>
      <text x="380" y="388" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Fold along a line: the two halves must match exactly
      </text>
    </SceneCanvas>
  );
}

function RotationalSymmetry({ data }) {
  const order = Number(data.order ?? 4);
  return (
    <SceneCanvas label="Rotational symmetry">
      <circle cx="380" cy="220" r="130" fill={VIZ_COLORS.one} fillOpacity="0.08" stroke={VIZ_COLORS.one} strokeWidth="2" />
      <rect x="290" y="130" width="180" height="180" fill={VIZ_COLORS.one} fillOpacity="0.14" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <circle cx="380" cy="220" r="6" fill={VIZ_COLORS.two} />
      {Array.from({ length: order }, (_, index) => {
        const angle = ((360 / order) * index * Math.PI) / 180;
        return (
          <circle
            key={index}
            cx={380 + Math.cos(angle) * 148}
            cy={220 - Math.sin(angle) * 148}
            r="7"
            fill={VIZ_COLORS.two}
          />
        );
      })}
      <path d="M380 70 A150 150 0 0 1 510 140" fill="none" stroke={VIZ_COLORS.three} strokeWidth="3" />
      <polygon points="510,140 500,126 516,128" fill={VIZ_COLORS.three} />
      <text x="380" y="56" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        Turn by {fmt(360 / order, 1)}° and the square looks the same
      </text>
      <text x="380" y="388" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Order {order} means {order} matching positions in a full turn
      </text>
    </SceneCanvas>
  );
}

function CircularArrangements({ data }) {
  const n = Math.max(3, Math.min(9, Number(data.n ?? 5)));
  const factorial = (value) => {
    let result = 1;
    for (let index = 2; index <= value; index += 1) result *= index;
    return result;
  };
  return (
    <SceneCanvas label="Circular arrangements">
      <circle cx="380" cy="225" r="125" fill="none" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      {Array.from({ length: n }, (_, index) => {
        const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
        const x = 380 + Math.cos(angle) * 125;
        const y = 225 + Math.sin(angle) * 125;
        return (
          <g key={index}>
            <circle cx={x} cy={y} r="18" fill={VIZ_COLORS.two} fillOpacity="0.22" stroke={VIZ_COLORS.two} strokeWidth="2.2" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text)">
              {String.fromCharCode(65 + index)}
            </text>
          </g>
        );
      })}
      <text x="380" y="56" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        {n} people around a circle
      </text>
      <text x="380" y="372" textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.two}>
        (n − 1)! = {factorial(n - 1)} arrangements
      </text>
      <text x="380" y="402" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Rotations of the same seating count once
      </text>
    </SceneCanvas>
  );
}

export default function ShapeConcept({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "line-symmetry";

  let body;
  if (mode === "rotational") body = <RotationalSymmetry data={data} />;
  else if (mode === "circular") body = <CircularArrangements data={data} />;
  else body = <LineSymmetry data={data} />;

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.lines != null ? (
            <span className="concept-chip">
              <span>lines</span>
              <strong>{data.lines}</strong>
            </span>
          ) : null}
          {data.order != null ? (
            <span className="concept-chip">
              <span>order</span>
              <strong>{data.order}</strong>
            </span>
          ) : null}
          {data.n != null ? (
            <span className="concept-chip">
              <span>n</span>
              <strong>{data.n}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Shape"}
    >
      {body}
    </SceneShell>
  );
}
