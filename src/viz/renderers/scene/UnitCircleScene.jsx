"use client";

import { useEffect, useState } from "react";
import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  Slider,
  fmt,
} from "./SceneKit";

const WIDTH = 760;
const HEIGHT = 420;
const PAD = 52;

function CircleAxes() {
  return (
    <Axes
      width={WIDTH}
      height={HEIGHT}
      padding={PAD}
      xMin={-1.6}
      xMax={1.6}
      yMin={-1.6}
      yMax={1.6}
      xStep={0.5}
      yStep={0.5}
      labelX="cos θ"
      labelY="sin θ"
    />
  );
}

function QuadrantBadge({ angle }) {
  const normal = ((angle % 360) + 360) % 360;
  const quadrant = Math.floor(normal / 90) + 1;
  const names = { 1: "I", 2: "II", 3: "III", 4: "IV" };
  const cast = {
    1: "All positive",
    2: "Sin positive",
    3: "Tan positive",
    4: "Cos positive",
  };
  return (
    <g>
      <rect x="556" y="66" width="168" height="92" rx="14" fill="var(--surface)" stroke="var(--border)" />
      <text x="640" y="92" textAnchor="middle" fontSize="13" fill="var(--text-muted)">
        Quadrant {names[quadrant]}
      </text>
      <text x="640" y="120" textAnchor="middle" fontSize="15" fontWeight="700" fill={VIZ_COLORS.one}>
        {cast[quadrant]}
      </text>
      <text x="640" y="144" textAnchor="middle" fontSize="12" fill="var(--text-soft)">
        {fmt(normal, 0)}° from the +x axis
      </text>
    </g>
  );
}

export default function UnitCircleScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "unit-circle";
  const initial = Number(data.angle ?? (data.value != null && data.value <= 1 ? 30 : 30));
  const [angle, setAngle] = useState(initial);

  useEffect(() => {
    const next = Number(data.angle ?? 30);
    if (Number.isFinite(next)) setAngle(next);
  }, [data.angle]);

  const radians = (angle * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  const tan = Math.tan(radians);
  const cx = PAD + ((0 - -1.6) / 3.2) * (WIDTH - PAD * 2);
  const cy = HEIGHT - PAD - ((0 - -1.6) / 3.2) * (HEIGHT - PAD * 2);
  const radius = ((1.6 ? 1 : 1) / 3.2) * (WIDTH - PAD * 2);
  const point = { x: cx + cos * radius, y: cy - sin * radius };
  const arcEnd = { x: cx + 72 * Math.cos(radians), y: cy - 72 * Math.sin(radians) };
  const arcStart = { x: cx + 72, y: cy };
  const sweep = angle >= 0 ? 0 : 1;
  const large = Math.abs(angle) > 180 ? 1 : 0;

  const reference = (() => {
    const normal = ((angle % 360) + 360) % 360;
    if (normal <= 90) return normal;
    if (normal <= 180) return 180 - normal;
    if (normal <= 270) return normal - 180;
    return 360 - normal;
  })();

  const isTrigFamily = !["unit-circle"].includes(mode);
  const heading =
    mode === "inverse-trig"
      ? `sin⁻¹(${fmt(data.value ?? 0.5, 2)}) asks for an angle`
      : mode === "compound-angle" || mode === "double-angle" || mode === "rotation-proof"
        ? "Rotating adds angles"
        : mode === "cast"
          ? "CAST rule: which ratios are positive?"
          : mode === "reference-angle"
            ? "Reference angle to the nearest axis"
            : "The unit circle";

  return (
    <SceneShell
      controls={
        <Slider
          label="Angle θ"
          value={Math.round(angle)}
          min={0}
          max={360}
          step={5}
          onChange={setAngle}
          suffix="°"
        />
      }
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          <span className="concept-chip">
            <span>sin θ</span>
            <strong>{fmt(sin, 3)}</strong>
          </span>
          <span className="concept-chip">
            <span>cos θ</span>
            <strong>{fmt(cos, 3)}</strong>
          </span>
          <span className="concept-chip">
            <span>tan θ</span>
            <strong>{Number.isFinite(tan) && Math.abs(tan) < 1e6 ? fmt(tan, 3) : "∞"}</strong>
          </span>
          <span className="concept-chip">
            <span>reference</span>
            <strong>{fmt(reference, 0)}°</strong>
          </span>
        </>
      }
      label={spec?.title?.[lang] ?? "Unit circle"}
    >
      <SceneCanvas label={spec?.title?.[lang] ?? "Unit circle"}>
        <text x="380" y="34" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
          {heading}
        </text>
        <CircleAxes />
        <circle cx={cx} cy={cy} r={radius} fill={VIZ_COLORS.one} fillOpacity="0.05" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
        <line x1={cx} y1={cy} x2={point.x} y2={point.y} stroke={VIZ_COLORS.two} strokeWidth="3" />
        <line x1={point.x} y1={point.y} x2={point.x} y2={cy} stroke={VIZ_COLORS.three} strokeWidth="2.5" strokeDasharray="6 4" />
        <line x1={cx} y1={cy} x2={point.x} y2={cy} stroke={VIZ_COLORS.five} strokeWidth="2.5" strokeDasharray="6 4" />
        <path
          d={`M${arcStart.x} ${arcStart.y} A72 72 0 ${large} ${sweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke={VIZ_COLORS.four}
          strokeWidth="3"
        />
        <circle cx={point.x} cy={point.y} r="6" fill={VIZ_COLORS.two} stroke="var(--surface)" strokeWidth="2" />
        <text x={point.x + 12} y={point.y - 12} fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>
          (cos θ, sin θ)
        </text>
        <text x={cx + 10} y={cy + 26} fontSize="12" fill="var(--text-soft)">
          θ = {fmt(angle, 0)}° = {fmt(radians, 2)} rad
        </text>

        {isTrigFamily ? (
          <g>
            <rect x="70" y="70" width="210" height="108" rx="14" fill="var(--surface)" stroke="var(--border)" />
            <text x="82" y="96" fontSize="13" fill="var(--text-muted)">
              {mode === "inverse-trig" || mode === "trig-equation" ? "solutions" : "identities on show"}
            </text>
            <text x="82" y="122" fontSize="13" fontWeight="700" fill="var(--text)">
              sin²θ + cos²θ = 1
            </text>
            <text x="82" y="144" fontSize="13" fontWeight="700" fill="var(--text)">
              tan θ = sin θ / cos θ
            </text>
            <text x="82" y="166" fontSize="12" fill="var(--text-soft)">
              {mode === "associated-angles"
                ? "sin(90° + θ) = cos θ"
                : mode === "double-angle"
                  ? "sin 2θ = 2 sin θ cos θ"
                  : mode === "cast"
                    ? "CAST: I All · II Sin · III Tan · IV Cos"
                    : "Reference angle = " + fmt(reference, 0) + "°"}
            </text>
          </g>
        ) : null}

        <QuadrantBadge angle={angle} />

        <g>
          <text x={cx + 76} y={cy + 20} fontSize="12" fill={VIZ_COLORS.five}>
            cos θ
          </text>
          <text x={point.x + 8} y={cy + (cy - point.y) / 2} fontSize="12" fill={VIZ_COLORS.three}>
            sin θ
          </text>
        </g>

        {data.solutions?.length ? (
          <g>
            {data.solutions.map((solution) => {
              const solutionRadians = (Number(solution) * Math.PI) / 180;
              return (
                <circle
                  key={solution}
                  cx={cx + Math.cos(solutionRadians) * radius}
                  cy={cy - Math.sin(solutionRadians) * radius}
                  r="5"
                  fill={VIZ_COLORS.three}
                />
              );
            })}
          </g>
        ) : null}
      </SceneCanvas>
    </SceneShell>
  );
}
