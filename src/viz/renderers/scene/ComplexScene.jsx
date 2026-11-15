"use client";

import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const WIDTH = 760;
const HEIGHT = 420;
const PAD = 52;
const LIMIT = 5;

function Plane({ children, label = "Argand plane" }) {
  return (
    <SceneCanvas label={label}>
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
        labelX="Re"
        labelY="Im"
      />
      {children}
    </SceneCanvas>
  );
}

function toScreen(x, y) {
  const sx = PAD + ((x - -LIMIT) / (LIMIT * 2)) * (WIDTH - PAD * 2);
  const sy = HEIGHT - PAD - ((y - -LIMIT) / (LIMIT * 2)) * (HEIGHT - PAD * 2);
  return { x: sx, y: sy };
}

function Vector({ re, im, color = VIZ_COLORS.one, label, dashed = false }) {
  const start = toScreen(0, 0);
  const end = toScreen(re, im);
  return (
    <g>
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={color}
        strokeWidth="3"
        strokeDasharray={dashed ? "7 5" : undefined}
      />
      <circle cx={end.x} cy={end.y} r="6" fill={color} stroke="var(--surface)" strokeWidth="2" />
      {label ? (
        <text x={end.x + 10} y={end.y - 10} fontSize="14" fontWeight="800" fill={color}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function pointOf(data, fallback = [3, 4]) {
  if (Array.isArray(data.point)) return data.point.map(Number);
  if (Array.isArray(data.z)) return data.z.map(Number);
  const re = Number(data.re ?? data.real ?? fallback[0]);
  const im = Number(data.im ?? data.imaginary ?? fallback[1]);
  return [re, im];
}

export default function ComplexScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "argand";
  const [re, im] = pointOf(data);
  const modulus = Math.hypot(re, im);
  const argument = (Math.atan2(im, re) * 180) / Math.PI;

  const body = (() => {
    switch (mode) {
      case "add-subtract": {
        const z1 = Array.isArray(data.z1) ? data.z1 : [2, 1];
        const z2 = Array.isArray(data.z2) ? data.z2 : [1, 2];
        const sum = [z1[0] + z2[0], z1[1] + z2[1]];
        return (
          <Plane>
            <Vector re={z1[0]} im={z1[1]} color={VIZ_COLORS.one} label="z₁" />
            <Vector re={z2[0]} im={z2[1]} color={VIZ_COLORS.three} label="z₂" />
            <line
              x1={toScreen(z1[0], z1[1]).x}
              y1={toScreen(z1[0], z1[1]).y}
              x2={toScreen(sum[0], sum[1]).x}
              y2={toScreen(sum[0], sum[1]).y}
              stroke={VIZ_COLORS.three}
              strokeDasharray="6 4"
              strokeWidth="2"
            />
            <line
              x1={toScreen(z2[0], z2[1]).x}
              y1={toScreen(z2[0], z2[1]).y}
              x2={toScreen(sum[0], sum[1]).x}
              y2={toScreen(sum[0], sum[1]).y}
              stroke={VIZ_COLORS.one}
              strokeDasharray="6 4"
              strokeWidth="2"
            />
            <Vector re={sum[0]} im={sum[1]} color={VIZ_COLORS.two} label="z₁ + z₂" />
          </Plane>
        );
      }

      case "multiply": {
        const r1 = Number(data.r1 ?? 2);
        const r2 = Number(data.r2 ?? 3);
        const a1 = Number(data.a1 ?? 30);
        const a2 = Number(data.a2 ?? 40);
        const resultAngle = ((a1 + a2) * Math.PI) / 180;
        const result = [r1 * r2 * Math.cos(resultAngle), r1 * r2 * Math.sin(resultAngle)];
        return (
          <Plane>
            <Vector
              re={r1 * Math.cos((a1 * Math.PI) / 180)}
              im={r1 * Math.sin((a1 * Math.PI) / 180)}
              color={VIZ_COLORS.one}
              label={`${r1}∠${a1}°`}
            />
            <Vector
              re={r2 * Math.cos((a2 * Math.PI) / 180)}
              im={r2 * Math.sin((a2 * Math.PI) / 180)}
              color={VIZ_COLORS.three}
              label={`${r2}∠${a2}°`}
              dashed
            />
            <Vector re={result[0]} im={result[1]} color={VIZ_COLORS.two} label={`${fmt(r1 * r2, 1)}∠${fmt(a1 + a2, 0)}°`} />
            <circle cx={toScreen(0, 0).x} cy={toScreen(0, 0).y} r={Math.abs(toScreen(r1 * r2, 0).x - toScreen(0, 0).x)} fill="none" stroke={VIZ_COLORS.two} strokeDasharray="4 4" opacity="0.5" />
          </Plane>
        );
      }

      case "conjugate": {
        return (
          <Plane>
            <Vector re={re} im={im} color={VIZ_COLORS.one} label={`${re} + ${im}i`} />
            <Vector re={re} im={-im} color={VIZ_COLORS.two} label={`${re} − ${Math.abs(im)}i`} />
            <line x1={toScreen(re, im).x} y1={toScreen(re, im).y} x2={toScreen(re, -im).x} y2={toScreen(re, -im).y} stroke="var(--text-soft)" strokeDasharray="5 5" />
          </Plane>
        );
      }

      case "reciprocal":
      case "division": {
        const denom = re * re + im * im || 1;
        const reciprocal = [re / denom, -im / denom];
        return (
          <Plane>
            <Vector re={re} im={im} color={VIZ_COLORS.one} label="z" />
            <Vector re={reciprocal[0]} im={reciprocal[1]} color={VIZ_COLORS.two} label="1/z" />
            <circle cx={toScreen(0, 0).x} cy={toScreen(0, 0).y} r="4" fill="var(--text-soft)" />
          </Plane>
        );
      }

      case "polar":
      case "euler": {
        const angle = Number(data.angle ?? (mode === "euler" ? 60 : argument));
        const radians = (angle * Math.PI) / 180;
        const radius = mode === "euler" ? 2.2 : Math.max(0.5, modulus);
        const x = radius * Math.cos(radians);
        const y = radius * Math.sin(radians);
        return (
          <Plane>
            <circle cx={toScreen(0, 0).x} cy={toScreen(0, 0).y} r={Math.abs(toScreen(radius, 0).x - toScreen(0, 0).x)} fill="none" stroke={VIZ_COLORS.grid} strokeDasharray="5 5" />
            <Vector re={x} im={y} color={VIZ_COLORS.one} label={`${fmt(radius, 2)}∠${fmt(angle, 0)}°`} />
            <text x={toScreen(0.6, 0.3).x} y={toScreen(0.6, 0.3).y} fontSize="13" fill="var(--text-muted)">
              r cos θ
            </text>
            <text x={toScreen(x + 0.1, y / 2).x} y={toScreen(x + 0.1, y / 2).y} fontSize="13" fill="var(--text-muted)">
              r sin θ
            </text>
          </Plane>
        );
      }

      case "de-moivre": {
        const r = Number(data.r ?? 2);
        const angle = Number(data.angle ?? 30);
        const n = Number(data.n ?? 3);
        const resultAngle = ((angle * n) * Math.PI) / 180;
        const radius = Math.pow(r, n);
        return (
          <Plane>
            <Vector
              re={r * Math.cos((angle * Math.PI) / 180)}
              im={r * Math.sin((angle * Math.PI) / 180)}
              color={VIZ_COLORS.one}
              label="z"
            />
            <Vector
              re={Math.min(4.6, radius * Math.cos(resultAngle))}
              im={Math.min(4.6, radius * Math.sin(resultAngle))}
              color={VIZ_COLORS.two}
              label="zⁿ"
            />
            <text x="80" y="80" fontSize="13" fill="var(--text-muted)">
              modulus {fmt(radius, 1)} · angle {fmt(angle * n, 0)}°
            </text>
          </Plane>
        );
      }

      case "roots-of-unity":
      case "cube-roots": {
        const n = Number(data.n ?? (mode === "cube-roots" ? 3 : 5));
        const points = Array.from({ length: n }, (_, index) => {
          const theta = (Math.PI * 2 * index) / n;
          return toScreen(Math.cos(theta) * 3, Math.sin(theta) * 3);
        });
        return (
          <Plane>
            <circle cx={toScreen(0, 0).x} cy={toScreen(0, 0).y} r={Math.abs(toScreen(3, 0).x - toScreen(0, 0).x)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
            <polygon points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill={VIZ_COLORS.two} fillOpacity="0.12" stroke={VIZ_COLORS.two} strokeWidth="2" />
            {points.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="5" fill={VIZ_COLORS.two} />
            ))}
            <text x="80" y="80" fontSize="14" fill="var(--text-muted)">
              {n} roots, spaced {fmt(360 / n, 1)}° apart
            </text>
          </Plane>
        );
      }

      case "locus": {
        const [centerRe, centerIm] = Array.isArray(data.center) ? data.center : [1, 2];
        const radius = Number(data.radius ?? 3);
        return (
          <Plane>
            <circle
              cx={toScreen(centerRe, centerIm).x}
              cy={toScreen(centerRe, centerIm).y}
              r={Math.abs(toScreen(radius, 0).x - toScreen(0, 0).x)}
              fill={VIZ_COLORS.one}
              fillOpacity="0.12"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <circle cx={toScreen(centerRe, centerIm).x} cy={toScreen(centerRe, centerIm).y} r="5" fill={VIZ_COLORS.two} />
            <text x={toScreen(centerRe, centerIm).x + 10} y={toScreen(centerRe, centerIm).y - 10} fontSize="13" fill={VIZ_COLORS.two}>
              centre ({centerRe}, {centerIm})
            </text>
          </Plane>
        );
      }

      case "i-powers": {
        const items = [
          { value: "1", re: 1, im: 0 },
          { value: "i", re: 0, im: 1 },
          { value: "−1", re: -1, im: 0 },
          { value: "−i", re: 0, im: -1 },
        ];
        return (
          <Plane>
            <circle cx={toScreen(0, 0).x} cy={toScreen(0, 0).y} r={Math.abs(toScreen(1, 0).x - toScreen(0, 0).x)} fill="none" stroke={VIZ_COLORS.one} strokeDasharray="5 5" />
            {items.map((item, index) => (
              <g key={item.value}>
                <Vector re={item.re} im={item.im} color={VIZ_COLORS.two} label={`i${index === 0 ? "⁰" : `^${index}`} = ${item.value}`} />
              </g>
            ))}
          </Plane>
        );
      }

      case "conjugate-roots": {
        const roots = Array.isArray(data.roots) ? data.roots.map((root) => root.map(Number)) : [[2, 3], [2, -3]];
        return (
          <Plane label="Conjugate roots">
            <line x1={toScreen(-LIMIT, 0).x} y1={toScreen(0, 0).y} x2={toScreen(LIMIT, 0).x} y2={toScreen(0, 0).y} stroke="var(--text-soft)" strokeDasharray="4 4" />
            {roots.map(([rootRe, rootIm], index) => (
              <g key={index}>
                <Vector
                  re={rootRe}
                  im={rootIm}
                  color={index === 0 ? VIZ_COLORS.one : VIZ_COLORS.three}
                  label={`${rootRe} ${rootIm >= 0 ? "+" : "−"} ${Math.abs(rootIm)}i`}
                />
                <line x1={toScreen(rootRe, rootIm).x} y1={toScreen(rootRe, rootIm).y} x2={toScreen(rootRe, rootIm).x} y2={toScreen(0, 0).y} stroke="var(--text-soft)" strokeDasharray="4 4" />
              </g>
            ))}
            <text x="80" y="80" fontSize="14" fill="var(--text-muted)">
              real coefficients → non-real roots come in conjugate pairs
            </text>
            <text x="80" y="104" fontSize="14" fill={VIZ_COLORS.two}>
              sum = {fmt(roots[0][0] + roots[1][0], 2)} · product = {fmt(roots[0][0] * roots[1][0] - roots[0][1] * roots[1][1], 2)}
            </text>
          </Plane>
        );
      }

      default:
        return (
          <Plane>
            <Vector re={re} im={im} color={VIZ_COLORS.one} label={`${re} + ${im}i`} />
            <line x1={toScreen(re, 0).x} y1={toScreen(re, 0).y} x2={toScreen(re, im).x} y2={toScreen(re, im).y} stroke="var(--text-soft)" strokeDasharray="4 4" />
            <line x1={toScreen(0, 0).x} y1={toScreen(0, 0).y} x2={toScreen(re, 0).x} y2={toScreen(re, 0).y} stroke="var(--text-soft)" strokeDasharray="4 4" />
            <text x="80" y="80" fontSize="14" fill="var(--text-muted)">
              |z| = {fmt(modulus, 2)} · arg z = {fmt(argument, 1)}°
            </text>
          </Plane>
        );
    }
  })();

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          <span className="concept-chip">
            <span>|z|</span>
            <strong>{fmt(modulus, 2)}</strong>
          </span>
          <span className="concept-chip">
            <span>arg z</span>
            <strong>{fmt(argument, 1)}°</strong>
          </span>
        </>
      }
      label={spec?.title?.[lang] ?? "Complex numbers"}
    >
      {body}
    </SceneShell>
  );
}
