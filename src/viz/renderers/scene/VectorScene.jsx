"use client";

import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  curvePath,
  fmt,
} from "./SceneKit";
import { compileExpression } from "./mathEval";

const WIDTH = 760;
const HEIGHT = 420;
const PAD = 52;
const LIMIT = 6;

const sx = (x) => PAD + ((x - -LIMIT) / (LIMIT * 2)) * (WIDTH - PAD * 2);
const sy = (y) => HEIGHT - PAD - ((y - -LIMIT) / (LIMIT * 2)) * (HEIGHT - PAD * 2);

function Grid({ labelX = "x", labelY = "y" }) {
  return (
    <Axes
      width={WIDTH}
      height={HEIGHT}
      padding={PAD}
      xMin={-LIMIT}
      xMax={LIMIT}
      yMin={-LIMIT}
      yMax={LIMIT}
      xStep={1}
      yStep={1}
      labelX={labelX}
      labelY={labelY}
    />
  );
}

function Arrow({ from = [0, 0], to, color = VIZ_COLORS.one, label, width = 3.2 }) {
  const headSize = 8;
  const x1 = sx(from[0]);
  const y1 = sy(from[1]);
  const x2 = sx(to[0]);
  const y2 = sy(to[1]);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const backX = x2 - Math.cos(angle) * headSize;
  const backY = y2 - Math.sin(angle) * headSize;
  return (
    <g>
      <line x1={x1} y1={y1} x2={backX} y2={backY} stroke={color} strokeWidth={width} />
      <polygon
        points={`${x2},${y2} ${backX - Math.sin(angle) * 5},${backY + Math.cos(angle) * 5} ${backX + Math.sin(angle) * 5},${backY - Math.cos(angle) * 5}`}
        fill={color}
      />
      {label ? (
        <text x={x2 + 8} y={y2 - 8} fontSize="13" fontWeight="800" fill={color}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function Field({ note = "y′ = 2x · solution family y = x² + C" }) {
  const expression = "2x";
  const field = compileExpression(expression);
  const arrows = [];
  for (let x = -5; x <= 5; x += 1) {
    for (let y = -5; y <= 5; y += 1) {
      const slope = field(x);
      if (!Number.isFinite(slope)) continue;
      const dx = 0.32 / Math.sqrt(1 + slope * slope);
      const dy = slope * dx;
      arrows.push({ x, y, dx, dy });
    }
  }
  const curves = [-5, -3, 0, 2, 5].map((constant) => {
    const fn = (x) => x * x + constant;
    return curvePath(fn, -LIMIT, LIMIT, sx, sy, 120);
  });

  return (
    <SceneCanvas label="Slope field">
      <Grid />
      {arrows.map((arrow, index) => (
        <line
          key={index}
          x1={sx(arrow.x - arrow.dx)}
          y1={sy(arrow.y - arrow.dy)}
          x2={sx(arrow.x + arrow.dx)}
          y2={sy(arrow.y + arrow.dy)}
          stroke={VIZ_COLORS.one}
          strokeWidth="1.8"
          opacity="0.65"
        />
      ))}
      {curves.map((curve, index) => (
        <path key={index} d={curve} fill="none" stroke={VIZ_COLORS.two} strokeWidth="2.2" opacity="0.75" />
      ))}
      <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
        {note}
      </text>
    </SceneCanvas>
  );
}

function vectorPair(data) {
  const a = Array.isArray(data.a) ? data.a.map(Number) : [3, 4];
  const b = Array.isArray(data.b) ? data.b.map(Number) : [1, 2];
  return [a, b];
}

export default function VectorScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "vector-basics";
  const [a, b] = vectorPair(data);

  const dot = a[0] * b[0] + a[1] * b[1];
  const magnitude = Math.hypot(a[0], a[1]);

  const body = (() => {
    switch (mode) {
      case "vector-add":
      case "dot-cross":
      case "add-subtract":
      case "addition":
      case "subtraction": {
        const sum = [a[0] + b[0], a[1] + b[1]];
        const difference = [a[0] - b[0], a[1] - b[1]];
        return (
          <SceneCanvas label="Vector addition">
            <Grid />
            <Arrow to={a} color={VIZ_COLORS.one} label="a" />
            <Arrow to={b} color={VIZ_COLORS.three} label="b" />
            <line x1={sx(b[0])} y1={sy(b[1])} x2={sx(sum[0])} y2={sy(sum[1])} stroke={VIZ_COLORS.one} strokeDasharray="6 4" opacity="0.6" />
            <line x1={sx(a[0])} y1={sy(a[1])} x2={sx(sum[0])} y2={sy(sum[1])} stroke={VIZ_COLORS.three} strokeDasharray="6 4" opacity="0.6" />
            <Arrow to={sum} color={VIZ_COLORS.two} label={`a+b (${sum[0]}, ${sum[1]})`} />
            <Arrow to={difference} color={VIZ_COLORS.five} label={`a−b (${difference[0]}, ${difference[1]})`} />
          </SceneCanvas>
        );
      }

      case "section-formula": {
        const start = Array.isArray(data.a) ? data.a.map(Number) : [0, 0];
        const end = Array.isArray(data.b) ? data.b.map(Number) : [6, 3];
        const ratio = Array.isArray(data.ratio) ? data.ratio.map(Number) : [1, 2];
        const point = [
          (ratio[1] * end[0] + ratio[0] * start[0]) / (ratio[0] + ratio[1]),
          (ratio[1] * end[1] + ratio[0] * start[1]) / (ratio[0] + ratio[1]),
        ];
        return (
          <SceneCanvas label="Section formula">
            <Grid />
            <line x1={sx(start[0])} y1={sy(start[1])} x2={sx(end[0])} y2={sy(end[1])} stroke={VIZ_COLORS.one} strokeWidth="3" />
            <circle cx={sx(start[0])} cy={sy(start[1])} r="5" fill={VIZ_COLORS.one} />
            <circle cx={sx(end[0])} cy={sy(end[1])} r="5" fill={VIZ_COLORS.one} />
            <circle cx={sx(point[0])} cy={sy(point[1])} r="7" fill={VIZ_COLORS.two} />
            <text x={sx(point[0]) + 10} y={sy(point[1]) - 10} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>
              P({fmt(point[0], 2)}, {fmt(point[1], 2)})
            </text>
            <text x={sx(start[0]) - 18} y={sy(start[1]) + 20} fontSize="13" fill="var(--text-muted)">A</text>
            <text x={sx(end[0]) + 8} y={sy(end[1]) - 8} fontSize="13" fill="var(--text-muted)">B</text>
          </SceneCanvas>
        );
      }

      case "dot-product":
      case "projection": {
        const unit = magnitude || 1;
        const projection = dot / unit;
        const end = [(a[0] / unit) * projection, (a[1] / unit) * projection];
        return (
          <SceneCanvas label="Dot product">
            <Grid />
            <Arrow to={a} color={VIZ_COLORS.one} label="a" />
            <Arrow to={b} color={VIZ_COLORS.three} label="b" />
            <line x1={sx(b[0])} y1={sy(b[1])} x2={sx(end[0])} y2={sy(end[1])} stroke="var(--text-soft)" strokeDasharray="5 5" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(end[0])} y2={sy(end[1])} stroke={VIZ_COLORS.two} strokeWidth="6" opacity="0.6" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              a · b = {fmt(dot, 2)} · projection = {fmt(projection, 2)}
            </text>
          </SceneCanvas>
        );
      }

      case "perpendicular": {
        return (
          <SceneCanvas label="Perpendicular vectors">
            <Grid />
            <Arrow to={a} color={VIZ_COLORS.one} label="a" />
            <Arrow to={b} color={VIZ_COLORS.three} label="b" />
            <rect x={sx(0)} y={sy(0) - 18} width="18" height="18" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              a · b = {fmt(dot, 2)} → perpendicular
            </text>
          </SceneCanvas>
        );
      }

      case "slope-field":
        return <Field />;

      case "separable-ode":
        return <Field note="Separate the variables, then integrate each side" />;

      case "force-vector":
      case "parallelogram-law": {
        const forces = Array.isArray(data.forces)
          ? data.forces.map((force) => force.map(Number))
          : [a, b];
        const sum = forces.reduce((total, force) => [total[0] + force[0], total[1] + force[1]], [0, 0]);
        return (
          <SceneCanvas label="Resultant force">
            <Grid />
            {forces.map((force, index) => (
              <Arrow
                key={index}
                to={force}
                color={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.five, VIZ_COLORS.four][index % 4]}
                label={`F${index + 1}`}
              />
            ))}
            <Arrow to={sum} color={VIZ_COLORS.two} label={`resultant (${fmt(Math.hypot(sum[0], sum[1]), 2)})`} width="4" />
          </SceneCanvas>
        );
      }

      case "resolve": {
        const magnitudeValue = Number(data.magnitude ?? 10);
        const angle = (Number(data.angle ?? 30) * Math.PI) / 180;
        const resolved = [magnitudeValue * Math.cos(angle), magnitudeValue * Math.sin(angle)];
        return (
          <SceneCanvas label="Resolving a vector">
            <Grid />
            <Arrow to={resolved} color={VIZ_COLORS.one} label={`${magnitudeValue} at ${data.angle ?? 30}°`} />
            <line x1={sx(resolved[0])} y1={sy(resolved[1])} x2={sx(resolved[0])} y2={sy(0)} stroke={VIZ_COLORS.three} strokeDasharray="5 4" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(resolved[0])} y2={sy(0)} stroke={VIZ_COLORS.five} strokeWidth="3" />
            <text x={sx(resolved[0] / 2)} y={sy(0) + 24} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.five}>
              {fmt(resolved[0], 2)}
            </text>
            <text x={sx(resolved[0]) + 10} y={sy(resolved[1] / 2)} fontSize="13" fill={VIZ_COLORS.three}>
              {fmt(resolved[1], 2)}
            </text>
          </SceneCanvas>
        );
      }

      case "lami": {
        return (
          <SceneCanvas label="Lami's theorem">
            <Grid />
            {[0, 120, 240].map((angle) => {
              const radians = (angle * Math.PI) / 180;
              return (
                <Arrow
                  key={angle}
                  to={[4 * Math.cos(radians), 4 * Math.sin(radians)]}
                  color={VIZ_COLORS.one}
                  label={`${angle}°`}
                />
              );
            })}
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              P / sin α = Q / sin β = R / sin γ
            </text>
          </SceneCanvas>
        );
      }

      default: {
        return (
          <SceneCanvas label="Vector">
            <Grid />
            <Arrow to={a} color={VIZ_COLORS.one} label={`a (${a[0]}, ${a[1]})`} />
            <line x1={sx(a[0])} y1={sy(a[1])} x2={sx(a[0])} y2={sy(0)} stroke="var(--text-soft)" strokeDasharray="5 4" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(a[0])} y2={sy(0)} stroke="var(--text-soft)" strokeDasharray="5 4" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              |a| = √({a[0]}² + {a[1]}²) = {fmt(magnitude, 2)}
            </text>
          </SceneCanvas>
        );
      }
    }
  })();

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {mode === "separable-ode" || mode === "slope-field" ? (
            <span className="concept-chip">
              <span>method</span>
              <strong>separate → integrate</strong>
            </span>
          ) : (
            <>
              <span className="concept-chip">
                <span>a</span>
                <strong>({a[0]}, {a[1]})</strong>
              </span>
              <span className="concept-chip">
                <span>b</span>
                <strong>({b[0]}, {b[1]})</strong>
              </span>
              <span className="concept-chip">
                <span>a · b</span>
                <strong>{fmt(dot, 2)}</strong>
              </span>
            </>
          )}
        </>
      }
      label={spec?.title?.[lang] ?? "Vectors"}
    >
      {body}
    </SceneShell>
  );
}
