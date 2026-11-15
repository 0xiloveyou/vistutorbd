"use client";

import { useEffect, useState } from "react";
import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  Slider,
  fmt,
} from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function angleArc(cx, cy, radius, startAngle, endAngle, color = VIZ_COLORS.one) {
  const start = {
    x: cx + radius * Math.cos((startAngle * Math.PI) / 180),
    y: cy + radius * Math.sin((startAngle * Math.PI) / 180),
  };
  const end = {
    x: cx + radius * Math.cos((endAngle * Math.PI) / 180),
    y: cy + radius * Math.sin((endAngle * Math.PI) / 180),
  };
  const difference = Math.abs(endAngle - startAngle);
  const large = difference > 180 ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;
  return (
    <path
      d={`M${start.x} ${start.y} A${radius} ${radius} 0 ${large} ${sweep} ${end.x} ${end.y}`}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
  );
}

/** Arc between two points as seen from a vertex. */
function vertexArc(vertex, first, second, radius, color = VIZ_COLORS.two) {
  const angle = (point) =>
    (Math.atan2(point.y - vertex.y, point.x - vertex.x) * 180) / Math.PI;
  let from = angle(first);
  let to = angle(second);
  let delta = to - from;
  while (delta <= -180) delta += 360;
  while (delta > 180) delta -= 360;
  to = from + delta;
  return angleArc(vertex.x, vertex.y, radius, from, to, color);
}

function AngleLabel({ x, y, value, color = VIZ_COLORS.two }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>
      {value}°
    </text>
  );
}

/** Triangle with three vertices at the supplied angles. */
function Triangle({ angles = [50, 60, 70], showSum = true, exterior = false, scale = 1 }) {
  const [A, B, C] = angles;
  const baseY = 300;
  const left = { x: 190, y: baseY };
  const right = { x: 190 + 330 * scale, y: baseY };
  // Place the apex from the base angles.
  const leftAngle = (A * Math.PI) / 180;
  const rightAngle = (B * Math.PI) / 180;
  const height = (330 * scale) / (1 / Math.tan(leftAngle) + 1 / Math.tan(rightAngle));
  const apex = { x: left.x + height / Math.tan(leftAngle), y: baseY - height };

  return (
    <g>
      <polygon
        points={`${left.x},${left.y} ${right.x},${right.y} ${apex.x},${apex.y}`}
        fill={VIZ_COLORS.one}
        fillOpacity="0.12"
        stroke={VIZ_COLORS.one}
        strokeWidth="3"
      />
      {vertexArc(left, apex, right, 34, VIZ_COLORS.two)}
      {vertexArc(right, apex, left, 34, VIZ_COLORS.two)}
      {vertexArc(apex, left, right, 34, VIZ_COLORS.two)}
      <AngleLabel x={left.x + 52} y={left.y - 18} value={A} />
      <AngleLabel x={right.x - 52} y={right.y - 18} value={B} />
      <AngleLabel x={apex.x} y={apex.y + 48} value={C} />
      <circle cx={left.x} cy={left.y} r="4" fill={INK} />
      <circle cx={right.x} cy={right.y} r="4" fill={INK} />
      <circle cx={apex.x} cy={apex.y} r="4" fill={INK} />
      {showSum ? (
        <text x="380" y="372" textAnchor="middle" fontSize="17" fontWeight="700" fill={MUTED}>
          {A}° + {B}° + {C}° = {A + B + C}°
        </text>
      ) : null}
      {exterior ? (
        <g>
          <line x1={right.x} y1={right.y} x2={right.x + 110} y2={right.y} stroke={INK} strokeWidth="3" />
          {vertexArc(right, apex, { x: right.x + 110, y: right.y }, 54, VIZ_COLORS.five)}
          <text x={right.x + 64} y={right.y + 8} fontSize="14" fontWeight="800" fill={VIZ_COLORS.five}>
            {A + C}°
          </text>
          <text x={right.x + 76} y={right.y - 14} fontSize="12" fill={MUTED}>
            exterior
          </text>
        </g>
      ) : null}
    </g>
  );
}

function TriangleScene({ data, mode }) {
  const supplied = Array.isArray(data.angles) ? data.angles : null;
  const [angles, setAngles] = useState(supplied ?? [50, 60, 70]);

  useEffect(() => {
    if (Array.isArray(data.angles)) setAngles(data.angles);
  }, [data.angles]);

  const adjust = (value) => {
    const a = Math.max(20, Math.min(120, value));
    const b = Math.max(20, Math.min(140, 180 - a - 40));
    setAngles([a, b, 180 - a - b]);
  };

  return (
    <SceneShell
      controls={<Slider label="Angle A" value={angles[0]} min={25} max={110} step={5} onChange={adjust} suffix="°" />}
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          <span className="concept-chip">
            <span>sum</span>
            <strong>{angles.reduce((sum, value) => sum + value, 0)}°</strong>
          </span>
        </>
      }
      label="Triangle angles"
    >
      <SceneCanvas label="Triangle angles">
        <text x="380" y="44" textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>
          The angles of a triangle
        </text>
        {mode === "angle-pairs" ? <AnglePairs /> : null}
        {mode === "transversal" ? <Transversal /> : null}
        {mode !== "angle-pairs" && mode !== "transversal" ? (
          <Triangle angles={angles} exterior={mode.includes("exterior")} />
        ) : null}
      </SceneCanvas>
    </SceneShell>
  );
}

function AnglePairs() {
  return (
    <g>
      <line x1="160" y1="290" x2="600" y2="150" stroke={INK} strokeWidth="3" />
      <line x1="160" y1="150" x2="600" y2="290" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <circle cx="380" cy="220" r="5" fill={VIZ_COLORS.two} />
      <text x="330" y="198" fontSize="15" fontWeight="800" fill={VIZ_COLORS.two}>a</text>
      <text x="424" y="198" fontSize="15" fontWeight="800" fill={VIZ_COLORS.three}>b</text>
      <text x="330" y="258" fontSize="15" fontWeight="800" fill={VIZ_COLORS.three}>b</text>
      <text x="424" y="258" fontSize="15" fontWeight="800" fill={VIZ_COLORS.two}>a</text>
      <text x="380" y="370" textAnchor="middle" fontSize="16" fill={MUTED}>
        a + b = 180° · vertical angles are equal
      </text>
    </g>
  );
}

function Transversal() {
  return (
    <g>
      <line x1="110" y1="160" x2="650" y2="160" stroke={INK} strokeWidth="3" />
      <line x1="110" y1="300" x2="650" y2="300" stroke={INK} strokeWidth="3" />
      <line x1="240" y1="80" x2="540" y2="380" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <text x="150" y="150" fontSize="13" fill={VIZ_COLORS.two}>65°</text>
      <text x="560" y="150" fontSize="13" fill={VIZ_COLORS.two}>65°</text>
      <text x="150" y="330" fontSize="13" fill={VIZ_COLORS.three}>115°</text>
      <text x="560" y="330" fontSize="13" fill={VIZ_COLORS.three}>115°</text>
      <text x="380" y="392" textAnchor="middle" fontSize="16" fill={MUTED}>
        Corresponding and alternate angles are equal
      </text>
    </g>
  );
}

function CircleDiagram({ mode, data }) {
  const cx = 380;
  const cy = 215;
  const r = 130;
  const central = Number(data.central ?? data.angle ?? 80);
  const inscribed = Number(data.inscribed ?? central / 2);

  const pointOnCircle = (angle) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  if (mode === "tangent" || mode === "construct-tangents") {
    return (
      <SceneCanvas label="Tangent">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <circle cx={cx} cy={cy} r="4" fill={INK} />
        <text x={cx + 12} y={cy + 18} fontSize="13" fill={MUTED}>O</text>
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={VIZ_COLORS.three} strokeWidth="2.5" />
        <line x1={cx + r} y1={cy - 90} x2={cx + r} y2={cy + 90} stroke={VIZ_COLORS.two} strokeWidth="3" />
        <rect x={cx + r - 15} y={cy - 15} width="15" height="15" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" />
        <text x={cx + r + 18} y={cy - 74} fontSize="13" fill={VIZ_COLORS.two}>tangent</text>
        <text x={380} y={392} textAnchor="middle" fontSize="16" fill={MUTED}>
          A tangent is perpendicular to the radius at the contact point
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "angle-centre" || mode === "circle-theorem") {
    const left = pointOnCircle(180 + central / 2);
    const right = pointOnCircle(180 - central / 2);
    const inscribedPoint = pointOnCircle(-90);
    return (
      <SceneCanvas label="Circle theorem">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1={cx} y1={cy} x2={left.x} y2={left.y} stroke={VIZ_COLORS.two} strokeWidth="2.5" />
        <line x1={cx} y1={cy} x2={right.x} y2={right.y} stroke={VIZ_COLORS.two} strokeWidth="2.5" />
        <line x1={inscribedPoint.x} y1={inscribedPoint.y} x2={left.x} y2={left.y} stroke={VIZ_COLORS.three} strokeWidth="2.5" />
        <line x1={inscribedPoint.x} y1={inscribedPoint.y} x2={right.x} y2={right.y} stroke={VIZ_COLORS.three} strokeWidth="2.5" />
        <text x={cx - 40} y={cy - 10} fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>
          {central}°
        </text>
        <text x={cx - 12} y={cy + 130} fontSize="14" fontWeight="800" fill={VIZ_COLORS.three}>
          {inscribed}°
        </text>
        <text x={380} y={392} textAnchor="middle" fontSize="16" fill={MUTED}>
          Angle at centre = 2 × angle at circumference
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "cyclic") {
    const points = [40, 140, 220, 320].map(pointOnCircle);
    return (
      <SceneCanvas label="Cyclic quadrilateral">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <polygon
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill={VIZ_COLORS.one}
          fillOpacity="0.12"
          stroke={VIZ_COLORS.two}
          strokeWidth="2.5"
        />
        <text x={cx - 70} y={cy - 48} fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>70°</text>
        <text x={cx + 60} y={cy + 60} fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>110°</text>
        <text x={380} y={392} textAnchor="middle" fontSize="16" fill={MUTED}>
          Opposite angles add to 180°
        </text>
      </SceneCanvas>
    );
  }

  return (
    <SceneCanvas label="Circle">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1={cx - 90} y1={cy + 94} x2={cx + 90} y2={cy + 94} stroke={VIZ_COLORS.two} strokeWidth="2.5" />
      <line x1={cx} y1={cy} x2={cx} y2={cy + 94} stroke={VIZ_COLORS.three} strokeWidth="2.5" strokeDasharray="6 4" />
      <circle cx={cx} cy={cy} r="4" fill={INK} />
      <text x={cx + 12} y={cy + 18} fontSize="13" fill={MUTED}>O</text>
      <text x={380} y={392} textAnchor="middle" fontSize="16" fill={MUTED}>
        The perpendicular from the centre bisects the chord
      </text>
    </SceneCanvas>
  );
}

function ElevationScene({ data }) {
  const height = Number(data.height ?? 10);
  const distance = Number(data.distance ?? 10);
  const [angle, setAngle] = useState(Number(data.angle ?? Math.round((Math.atan2(height, distance) * 180) / Math.PI)));
  const tan = Math.tan((angle * Math.PI) / 180);
  const shownHeight = distance * tan;

  return (
    <SceneShell
      controls={<Slider label="Angle of elevation" value={angle} min={10} max={80} step={1} onChange={setAngle} suffix="°" />}
      footer={
        <span className="concept-chip">
          <span>tan θ = height / distance</span>
          <strong>{fmt(Math.tan((angle * Math.PI) / 180), 2)}</strong>
        </span>
      }
      label="Angle of elevation"
    >
      <SceneCanvas label="Angle of elevation">
        <line x1="160" y1="330" x2="640" y2="330" stroke={INK} strokeWidth="3" />
        <line x1="600" y1="330" x2="600" y2={330 - Math.min(260, shownHeight * 12)} stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="160" y1="330" x2="600" y2={330 - Math.min(260, shownHeight * 12)} stroke={VIZ_COLORS.two} strokeWidth="3" />
        {angleArc(160, 330, 60, -angle, 0, VIZ_COLORS.three)}
        <text x={218} y={318} fontSize="14" fontWeight="800" fill={VIZ_COLORS.three}>{angle}°</text>
        <text x={614} y={330 - Math.min(260, shownHeight * 12) / 2} fontSize="13" fill={VIZ_COLORS.one}>
          height
        </text>
        <text x={380} y={356} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>
          distance = {distance}
        </text>
        <text x={380} y="54" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
          Looking up at an angle of elevation
        </text>
      </SceneCanvas>
    </SceneShell>
  );
}

function SimilarityScene({ data }) {
  const scale = Array.isArray(data.scale)
    ? Number(data.scale[data.scale.length - 1] ?? 2)
    : Number(data.scale ?? 2);
  const scaleLabel = Array.isArray(data.scale)
    ? data.scale.join(" : ")
    : String(scale);
  const drawScale = Math.min(1.8, Math.max(0.4, scale));
  return (
    <SceneCanvas label="Similar triangles">
      <polygon points="150,320 330,320 150,190" fill={VIZ_COLORS.one} fillOpacity="0.14" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <polygon
        points={`390,320 ${390 + 180 * drawScale},320 390,${320 - 130 * drawScale}`}
        fill={VIZ_COLORS.three}
        fillOpacity="0.14"
        stroke={VIZ_COLORS.three}
        strokeWidth="3"
      />
      <text x="230" y="344" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.one}>small</text>
      <text x={390 + 90 * drawScale} y="344" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.three}>scale × {scaleLabel}</text>
      <text x="380" y="52" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Same shape, different size
      </text>
      <text x="380" y="388" textAnchor="middle" fontSize="15" fill={MUTED}>
        Corresponding angles stay equal; sides keep the same ratio
      </text>
    </SceneCanvas>
  );
}

function AreaScene({ data }) {
  const base = 420;
  const height = 200;
  return (
    <SceneCanvas label="Area theorem">
      <polygon points="180,320 600,320 540,120 120,120" fill={VIZ_COLORS.one} fillOpacity="0.14" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1="120" y1="120" x2="540" y2="120" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 4" />
      <line x1="360" y1="120" x2="360" y2="320" stroke={VIZ_COLORS.two} strokeWidth="3" strokeDasharray="7 5" />
      <text x="372" y="230" fontSize="13" fill={VIZ_COLORS.two}>height</text>
      <text x="380" y="348" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.one}>
        base = {data.base ?? base}
      </text>
      <text x="380" y="64" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Same base, same parallels → same area
      </text>
      <text x="380" y="394" textAnchor="middle" fontSize="15" fill={MUTED}>
        Area = base × height
      </text>
    </SceneCanvas>
  );
}

function ConstructionScene({ data, mode }) {
  const label = String(
    data.task ??
      data.construction ??
      data.result ??
      (mode ? mode.replace(/[-_]/g, " ") : "construction"),
  );
  return (
    <SceneCanvas label="Construction">
      <line x1="180" y1="300" x2="580" y2="300" stroke={INK} strokeWidth="3" />
      <circle cx="180" cy="300" r="120" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="580" cy="300" r="120" fill="none" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 5" />
      <line x1="380" y1="120" x2="380" y2="380" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <circle cx="180" cy="300" r="4" fill={INK} />
      <circle cx="580" cy="300" r="4" fill={INK} />
      <circle cx="380" cy="200" r="5" fill={VIZ_COLORS.two} />
      <circle cx="380" cy="400" r="5" fill={VIZ_COLORS.three} />
      <text x="380" y="56" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Construct: {label}
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        Equal arcs from both endpoints meet on the bisector
      </text>
      <text x="230" y="278" fontSize="12" fill={MUTED}>arc 1</text>
      <text x="500" y="278" fontSize="12" fill={MUTED}>arc 2</text>
      <text x="396" y="134" fontSize="12" fill={VIZ_COLORS.one}>{mode === "tangents" ? "tangent point" : "bisector"}</text>
    </SceneCanvas>
  );
}

function RootTwoScene() {
  return (
    <SceneCanvas label="Square root of two">
      <line x1="120" y1="340" x2="660" y2="340" stroke={INK} strokeWidth="3" />
      {[0, 1, 2, 3].map((step) => (
        <g key={step}>
          <line x1={180 + step * 120} y1="330" x2={180 + step * 120} y2="350" stroke={INK} strokeWidth="2" />
          <text x={180 + step * 120} y="372" textAnchor="middle" fontSize="13" fill={MUTED}>{step}</text>
        </g>
      ))}
      <rect x="180" y="220" width="120" height="120" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1="180" y1="340" x2="300" y2="220" stroke={VIZ_COLORS.two} strokeWidth="3" />
      <text x="222" y="290" fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>√2</text>
      <path d="M300 340 A 170 170 0 0 1 300 220" fill="none" stroke={VIZ_COLORS.three} strokeWidth="2.5" strokeDasharray="6 5" />
      <circle cx="300" cy="340" r="6" fill={VIZ_COLORS.three} />
      <text x="306" y="332" fontSize="13" fill={VIZ_COLORS.three}>√2 ≈ 1.414</text>
      <text x="380" y="64" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        A unit square makes √2 visible
      </text>
    </SceneCanvas>
  );
}

function SpiralScene() {
  const points = [];
  let x = 380;
  let y = 250;
  let angle = 0;
  for (let index = 0; index < 6; index += 1) {
    points.push({ x, y });
    const radius = 22 + index * 10;
    x += Math.cos(angle) * radius;
    y -= Math.sin(angle) * radius;
    angle += Math.PI / 2;
  }
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  return (
    <SceneCanvas label="Spiral of roots">
      <path d={path} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
      {points.map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="4" fill={VIZ_COLORS.two} />
          <text x={point.x + 8} y={point.y - 6} fontSize="11" fill={MUTED}>
            {index === 0 ? "1" : `√${index + 1}`}
          </text>
        </g>
      ))}
      <text x="380" y="64" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Each new right triangle adds a leg of 1
      </text>
      <text x="380" y="394" textAnchor="middle" fontSize="15" fill={MUTED}>
        Hypotenuses: √2, √3, √4, √5, …
      </text>
    </SceneCanvas>
  );
}

function ForcesScene({ data }) {
  const forces = Array.isArray(data.forces) ? data.forces : [[5, 0], [0, 12]];
  const colors = [VIZ_COLORS.one, VIZ_COLORS.two, VIZ_COLORS.three, VIZ_COLORS.five];
  const origin = { x: 330, y: 250 };
  return (
    <SceneCanvas label="Forces">
      {forces.map((force, index) => {
        const x = origin.x + Number(force[0]) * 16;
        const y = origin.y - Number(force[1]) * 16;
        return (
          <g key={index}>
            <line x1={origin.x} y1={origin.y} x2={x} y2={y} stroke={colors[index % colors.length]} strokeWidth="3.5" />
            <circle cx={x} cy={y} r="5" fill={colors[index % colors.length]} />
            <text x={x + 8} y={y - 8} fontSize="13" fill={colors[index % colors.length]}>
              ({force[0]}, {force[1]})
            </text>
          </g>
        );
      })}
      <circle cx={origin.x} cy={origin.y} r="5" fill={INK} />
      <text x="380" y="64" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Forces add tip-to-tail
      </text>
      <text x="380" y="394" textAnchor="middle" fontSize="15" fill={MUTED}>
        Resultant = sum of all force vectors
      </text>
    </SceneCanvas>
  );
}

function AmGmScene({ data }) {
  const a = Number(data.a ?? 4);
  const b = Number(data.b ?? 9);
  const radius = (a + b) / 2;
  const scale = 220 / radius;
  const centre = { x: 380, y: 300 };
  const half = Math.sqrt(a * b) * scale;
  return (
    <SceneCanvas label="AM GM">
      <path d={`M${centre.x - radius * scale} ${centre.y} A${radius * scale} ${radius * scale} 0 0 1 ${centre.x + radius * scale} ${centre.y}`} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1={centre.x - radius * scale} y1={centre.y} x2={centre.x + radius * scale} y2={centre.y} stroke={INK} strokeWidth="2" />
      <line x1={centre.x} y1={centre.y} x2={centre.x} y2={centre.y - half} stroke={VIZ_COLORS.three} strokeWidth="3" />
      <text x={centre.x + 8} y={centre.y - half / 2} fontSize="13" fill={VIZ_COLORS.three}>√ab</text>
      <text x={centre.x - (a / 2) * scale} y={centre.y + 22} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>a = {a}</text>
      <text x={centre.x + (b / 2) * scale} y={centre.y + 22} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>b = {b}</text>
      <text x="380" y="64" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        AM ≥ GM
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        {(a + b) / 2} ≥ √({a} × {b}) = {fmt(Math.sqrt(a * b), 2)}
      </text>
    </SceneCanvas>
  );
}

function CompassScene({ data, mode }) {
  if (mode === "triangle") {
    const cases = Array.isArray(data.cases) ? data.cases : ["SSS", "SAS", "ASA", "RHS"];
    return (
      <SceneCanvas label="Construct a triangle">
        <line x1="180" y1="310" x2="580" y2="310" stroke={INK} strokeWidth="3" />
        <circle cx="180" cy="310" r="150" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="5 5" />
        <circle cx="580" cy="310" r="170" fill="none" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 5" />
        <line x1="180" y1="310" x2="330" y2="172" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="580" y1="310" x2="330" y2="172" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="180" y1="310" x2="580" y2="310" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <circle cx="330" cy="172" r="6" fill={VIZ_COLORS.four} />
        <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
          Construct a triangle: {cases.join(" · ")}
        </text>
        <text x="380" y="232" textAnchor="middle" fontSize="13" fill={MUTED}>
          the arcs meet at the third vertex
        </text>
        <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
          Start from the given side or angle, then draw the two arcs
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "quadrilateral") {
    return (
      <SceneCanvas label="Construct a quadrilateral">
        <polygon points="180,300 560,300 620,150 250,120" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="180" y1="300" x2="620" y2="150" stroke={VIZ_COLORS.two} strokeWidth="2.5" strokeDasharray="6 5" />
        <circle cx="180" cy="300" r="5" fill={INK} />
        <circle cx="560" cy="300" r="5" fill={INK} />
        <circle cx="620" cy="150" r="5" fill={INK} />
        <circle cx="250" cy="120" r="5" fill={INK} />
        <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
          Construct a quadrilateral
        </text>
        <text x="380" y="230" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>
          draw the diagonal first
        </text>
        <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
          Two triangles are easier than one quadrilateral
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "parallelogram") {
    return (
      <SceneCanvas label="Construct a parallelogram">
        <polygon points="170,300 530,300 620,170 260,170" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="170" y1="300" x2="530" y2="300" stroke={VIZ_COLORS.two} strokeWidth="3" />
        <line x1="170" y1="300" x2="260" y2="170" stroke={VIZ_COLORS.three} strokeWidth="3" />
        <line x1="530" y1="300" x2="620" y2="170" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 4" />
        <line x1="260" y1="170" x2="620" y2="170" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="5 4" />
        <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
          Construct a parallelogram
        </text>
        <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
          copy the base and side at the given angle, then make the opposite sides parallel
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "area-equivalence" || mode === "area-preserving") {
    return (
      <SceneCanvas label="Area-preserving construction">
        <polygon points="160,300 520,300 600,160 250,120" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <line x1="250" y1="120" x2="600" y2="120" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 5" />
        <line x1="250" y1="120" x2="600" y2="300" stroke={VIZ_COLORS.two} strokeWidth="3" />
        <line x1="600" y1="120" x2="600" y2="300" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 4" />
        <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
          Keep the area, change the shape
        </text>
        <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
          A parallel line keeps the height, so the area does not change
        </text>
      </SceneCanvas>
    );
  }

  if (mode === "tangents") {
    return (
      <SceneCanvas label="Construct tangents">
        <circle cx="340" cy="230" r="120" fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
        <circle cx="340" cy="230" r="4" fill={INK} />
        <circle cx="610" cy="230" r="6" fill={VIZ_COLORS.two} />
        <line x1="610" y1="230" x2="340" y2="230" stroke={MUTED} strokeDasharray="6 5" />
        <line x1="610" y1="230" x2="430" y2="140" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
        <line x1="610" y1="230" x2="430" y2="320" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
        <circle cx="430" cy="140" r="5" fill={VIZ_COLORS.two} />
        <circle cx="430" cy="320" r="5" fill={VIZ_COLORS.two} />
        <text x="624" y="226" fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>P</text>
        <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
          Two tangents from an external point
        </text>
        <text x="380" y="392" textAnchor="middle" fontSize="14" fill={MUTED}>
          The tangent lengths from P are equal
        </text>
      </SceneCanvas>
    );
  }

  return <ConstructionScene data={data} mode={mode} />;
}

function PlaneAreasScene() {
  return (
    <SceneCanvas label="Plane figures">
      <rect x="120" y="160" width="180" height="120" fill={VIZ_COLORS.one} fillOpacity="0.16" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <text x="210" y="226" textAnchor="middle" fontSize="14" fontWeight="700" fill={VIZ_COLORS.one}>l × b</text>
      <polygon points="360,280 520,280 440,160" fill={VIZ_COLORS.three} fillOpacity="0.16" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="440" y="246" textAnchor="middle" fontSize="14" fontWeight="700" fill={VIZ_COLORS.three}>½bh</text>
      <circle cx="640" cy="220" r="60" fill={VIZ_COLORS.two} fillOpacity="0.16" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
      <text x="640" y="226" textAnchor="middle" fontSize="14" fontWeight="700" fill={VIZ_COLORS.two}>πr²</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Plane figures and their areas</text>
      <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
        Split a composite figure into rectangles, triangles and circles
      </text>
    </SceneCanvas>
  );
}

function SpecialAnglesScene({ data }) {
  const special = String(data.angle ?? data.type ?? "45");
  const is45 = special.includes("45");
  return (
    <SceneCanvas label="Special angles">
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        {is45 ? "45° − 45° − 90°" : "30° − 60° − 90°"}
      </text>
      <polygon
        points={is45 ? "240,310 500,310 240,170" : "240,310 560,310 240,150"}
        fill={VIZ_COLORS.one}
        fillOpacity="0.12"
        stroke={VIZ_COLORS.one}
        strokeWidth="3"
      />
      <rect x="240" y="296" width="14" height="14" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" />
      <text x="320" y="336" fontSize="13" fill={VIZ_COLORS.one}>{is45 ? "1" : "√3"}</text>
      <text x={is45 ? "370" : "410"} y="232" fontSize="13" fill={VIZ_COLORS.three}>{is45 ? "1" : "2"}</text>
      <text x="510" y="298" fontSize="13" fill={VIZ_COLORS.two}>{is45 ? "√2" : "1"}</text>
      <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
        Exact ratios come from these two triangles
      </text>
    </SceneCanvas>
  );
}

function ArcSectorScene() {
  return (
    <SceneCanvas label="Arc and sector">
      <circle cx="380" cy="220" r="130" fill="none" stroke={VIZ_COLORS.grid} strokeWidth="2" />
      <path d="M380 220 L510 220 A130 130 0 0 1 380 90 Z" fill={VIZ_COLORS.one} fillOpacity="0.2" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <path d="M510 220 A130 130 0 0 1 380 90" fill="none" stroke={VIZ_COLORS.two} strokeWidth="5" />
      <line x1="380" y1="220" x2="510" y2="220" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <line x1="380" y1="220" x2="380" y2="90" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="450" y="208" fontSize="13" fill={VIZ_COLORS.three}>r</text>
      <text x="472" y="132" fontSize="13" fill={VIZ_COLORS.two}>arc</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Arc length and sector area</text>
      <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
        arc = rθ · sector area = ½r²θ (θ in radians)
      </text>
    </SceneCanvas>
  );
}

function TwoCirclesScene({ data, mode }) {
  const tangent = mode.includes("tangent");
  return (
    <SceneCanvas label="Two circles">
      <circle cx="300" cy="230" r="100" fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <circle cx="470" cy="230" r="70" fill="none" stroke={VIZ_COLORS.three} strokeWidth="3" />
      {tangent ? (
        <>
          <line x1="210" y1="170" x2="520" y2="170" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
          <line x1="210" y1="290" x2="520" y2="290" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
          <circle cx="300" cy="170" r="4" fill={VIZ_COLORS.two} />
          <circle cx="470" cy="170" r="4" fill={VIZ_COLORS.two} />
        </>
      ) : (
        <line x1="300" y1="230" x2="470" y2="230" stroke={VIZ_COLORS.two} strokeWidth="2.5" strokeDasharray="6 4" />
      )}
      <circle cx="300" cy="230" r="4" fill={INK} />
      <circle cx="470" cy="230" r="4" fill={INK} />
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        {tangent ? "Common tangents and tangent circles" : "Two circles and the radical axis"}
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="14" fill={MUTED}>
        {tangent
          ? "Tangents meet the radii at right angles"
          : "The common chord is perpendicular to the line of centres"}
      </text>
      {data.radius ? (
        <text x="380" y="120" textAnchor="middle" fontSize="13" fill={MUTED}>
          radius {data.radius}
        </text>
      ) : null}
    </SceneCanvas>
  );
}

export default function GeometryScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "triangle-angles";

  const isTriangleMode = [
    "triangle-angles",
    "angle-sum",
    "exterior",
    "exterior-angle",
    "angle-pairs",
    "transversal",
    "isosceles",
    "congruence",
    "ambiguous",
    "inequality",
    "centres",
    "construction-proof",
    "proof",
  ].includes(mode);

  let body;

  if (isTriangleMode) {
    body = <TriangleScene data={data} mode={mode} />;
  } else if (mode === "elevation") {
    body = <ElevationScene data={data} />;
  } else if (mode === "similarity") {
    body = <SimilarityScene data={data} />;
  } else if (
    ["similar-ratio", "similar-scale", "aa", "ratios", "bpt", "median", "shear"].includes(
      mode,
    )
  ) {
    body = <SimilarityScene data={data} />;
  } else if (mode === "area-theorem" || mode === "area-equivalence") {
    body = <AreaScene data={data} />;
  } else if (mode === "plane-areas" || mode === "area-ratio") {
    body = <PlaneAreasScene />;
  } else if (mode === "special-angles" || mode === "complementary") {
    body = <SpecialAnglesScene data={data} />;
  } else if (mode === "arc-sector") {
    body = <ArcSectorScene />;
  } else if (
    [
      "two-circles",
      "external-tangent",
      "tangent-circle",
      "chord-of-contact",
      "radical-axis",
      "orthogonal",
      "circumcircle",
    ].includes(mode)
  ) {
    body = <TwoCirclesScene data={data} mode={mode} />;
  } else if (mode === "root-two") {
    body = <RootTwoScene />;
  } else if (mode === "spiral-roots") {
    body = <SpiralScene />;
  } else if (mode === "forces") {
    body = <ForcesScene data={data} />;
  } else if (mode === "am-gm") {
    body = <AmGmScene data={data} />;
  } else if (
    [
      "circle-theorem",
      "chord",
      "equal-chords",
      "angle-centre",
      "same-segment",
      "alternate-segment",
      "cyclic",
      "tangent",
      "construct-tangents",
    ].includes(mode)
  ) {
    body = <CircleDiagram mode={mode} data={data} />;
  } else if (spec?.renderer === "compass-construct") {
    body = <CompassScene data={data} mode={mode} />;
  } else {
    body = <ConstructionScene data={data} mode={mode} />;
  }

  const footer = (
    <>
      <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
      {data.sum ? (
        <span className="concept-chip">
          <span>sum</span>
          <strong>{data.sum}°</strong>
        </span>
      ) : null}
      {data.distance ? (
        <span className="concept-chip">
          <span>distance</span>
          <strong>{data.distance}</strong>
        </span>
      ) : null}
      {data.scale ? (
        <span className="concept-chip">
          <span>scale</span>
          <strong>{data.scale}</strong>
        </span>
      ) : null}
    </>
  );

  return (
    <SceneShell footer={footer} label={spec?.title?.[lang] ?? "Geometry"}>
      {body}
    </SceneShell>
  );
}
