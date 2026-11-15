"use client";

import MathFormula from "@/components/MathFormula";
import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";
import { curvePath } from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function arrow(x1, y1, x2, y2, color = VIZ_COLORS.one, width = 3) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const back = 9;
  const bx = x2 - Math.cos(angle) * back;
  const by = y2 - Math.sin(angle) * back;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} />
      <polygon
        points={`${x2},${y2} ${bx - Math.sin(angle) * 5},${by + Math.cos(angle) * 5} ${bx + Math.sin(angle) * 5},${by - Math.cos(angle) * 5}`}
        fill={color}
      />
    </g>
  );
}

function Ground({ y = 320 }) {
  return (
    <>
      <line x1="70" y1={y} x2="690" y2={y} stroke={INK} strokeWidth="3" />
      {Array.from({ length: 16 }, (_, index) => (
        <line
          key={index}
          x1={90 + index * 38}
          y1={y}
          x2={78 + index * 38}
          y2={y + 12}
          stroke={MUTED}
          strokeWidth="1.4"
        />
      ))}
    </>
  );
}

function Block({ x, y, width = 100, height = 62, label, color = VIZ_COLORS.one }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="8" fill={color} fillOpacity="0.24" stroke={color} strokeWidth="2.5" />
      <text x={x + width / 2} y={y + height / 2 + 6} textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>
        {label ?? "m"}
      </text>
    </g>
  );
}

function AngleArc({ cx, cy, r, from, to, color = VIZ_COLORS.two }) {
  const start = {
    x: cx + r * Math.cos((from * Math.PI) / 180),
    y: cy - r * Math.sin((from * Math.PI) / 180),
  };
  const end = {
    x: cx + r * Math.cos((to * Math.PI) / 180),
    y: cy - r * Math.sin((to * Math.PI) / 180),
  };
  const delta = Math.abs(to - from);
  return (
    <path
      d={`M${start.x} ${start.y} A${r} ${r} 0 ${delta > 180 ? 1 : 0} ${to > from ? 0 : 1} ${end.x} ${end.y}`}
      fill="none"
      stroke={color}
      strokeWidth="2.4"
    />
  );
}

function Elevation({ data, depression = false }) {
  const height = Number(data.height ?? 15);
  const distance = Number(data.distance ?? 15);
  const angle = Number(data.angle ?? 45);
  const baseY = 320;
  const observerX = 150;
  const towerX = 620;
  const topY = baseY - Math.min(240, (height / Math.max(distance, 1)) * 260);
  return (
    <>
      <Ground y={baseY} />
      <line x1={towerX} y1={baseY} x2={towerX} y2={topY} stroke={VIZ_COLORS.one} strokeWidth="4" />
      <line x1={observerX} y1={baseY} x2={towerX} y2={topY} stroke={VIZ_COLORS.two} strokeWidth="2.6" strokeDasharray="7 5" />
      <circle cx={observerX} cy={baseY - 34} r="16" fill={VIZ_COLORS.three} fillOpacity="0.3" stroke={VIZ_COLORS.three} strokeWidth="2" />
      <line x1={observerX} y1={baseY - 34} x2={observerX} y2={baseY} stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      {depression ? (
        <>
          <line x1={observerX} y1={baseY - 34} x2={observerX + 180} y2={baseY - 34} stroke={MUTED} strokeDasharray="6 5" />
          <AngleArc cx={observerX} cy={baseY - 34} r={62} from={-angle} to={0} color={VIZ_COLORS.four} />
          <text x={observerX + 74} y={baseY - 46} fontSize="13" fontWeight="800" fill={VIZ_COLORS.four}>{angle}°</text>
          <text x="380" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Angle of depression</text>
        </>
      ) : (
        <>
          <AngleArc cx={observerX} cy={baseY} r={58} from={0} to={angle} color={VIZ_COLORS.four} />
          <text x={observerX + 66} y={baseY - 14} fontSize="13" fontWeight="800" fill={VIZ_COLORS.four}>{angle}°</text>
          <text x="380" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Angle of elevation</text>
        </>
      )}
      <text x={towerX + 12} y={baseY - 50} fontSize="13" fill={VIZ_COLORS.one}>height {height}</text>
      <text x={(observerX + towerX) / 2} y={baseY + 32} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>distance {distance}</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        tan θ = height ÷ distance = {fmt(Math.tan((angle * Math.PI) / 180), 2)}
      </text>
    </>
  );
}

function Shadow({ data }) {
  const personHeight = Number(data.personHeight ?? 1.5);
  const personShadow = Number(data.personShadow ?? 2);
  const treeShadow = Number(data.treeShadow ?? 12);
  const treeHeight = data.height ?? (personHeight * treeShadow) / personShadow;
  const baseY = 320;
  return (
    <>
      <Ground y={baseY} />
      <line x1="170" y1={baseY} x2="170" y2={baseY - 90} stroke={VIZ_COLORS.three} strokeWidth="4" />
      <circle cx="170" cy={baseY - 102} r="12" fill={VIZ_COLORS.three} fillOpacity="0.3" stroke={VIZ_COLORS.three} strokeWidth="2" />
      <polygon points={`170,${baseY - 90} 170,${baseY} 240,${baseY}`} fill={VIZ_COLORS.three} fillOpacity="0.14" />
      <line x1="520" y1={baseY} x2="520" y2={baseY - 210} stroke={VIZ_COLORS.one} strokeWidth="5" />
      <circle cx="520" cy={baseY - 230} r="42" fill={VIZ_COLORS.one} fillOpacity="0.18" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <polygon points={`520,${baseY - 210} 520,${baseY} 660,${baseY}`} fill={VIZ_COLORS.one} fillOpacity="0.14" />
      <text x="244" y={baseY + 26} fontSize="12" fill={VIZ_COLORS.three}>person shadow {personShadow} m</text>
      <text x="556" y={baseY + 26} fontSize="12" fill={VIZ_COLORS.one}>tree shadow {treeShadow} m</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Similar triangles give the height</text>
      <text x="380" y="386" textAnchor="middle" fontSize="15" fill={MUTED}>
        tree height = {personHeight} × {treeShadow}/{personShadow} = {fmt(Number(treeHeight), 2)} m
      </text>
    </>
  );
}

function FocusReflection() {
  return (
    <>
      <line x1="140" y1="120" x2="140" y2="340" stroke={MUTED} strokeDasharray="6 5" />
      <path d="M180 110 Q 520 230 180 350" fill="none" stroke={VIZ_COLORS.one} strokeWidth="4" />
      <circle cx="380" cy="230" r="7" fill={VIZ_COLORS.two} />
      <text x={392} y={222} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>focus</text>
      {[0, 1, 2].map((index) => (
        <g key={index}>
          <line x1="380" y1="230" x2={230 + index * 60} y2={160 + index * 70} stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 4" />
          {arrow(230 + index * 60, 160 + index * 70, 640, 160 + index * 70, VIZ_COLORS.three, 2.2)}
        </g>
      ))}
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Reflection from the focus</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        Rays from the focus leave parallel to the axis
      </text>
    </>
  );
}

function Wave({ data }) {
  const amplitude = Number(data.amplitude ?? 1);
  const frequency = Number(data.frequency ?? 2);
  const sx = (x) => 90 + (x / 12) * 580;
  const sy = (y) => 220 - y * 50;
  const fn = (x) => amplitude * Math.sin(frequency * x);
  return (
    <>
      <line x1="80" y1="220" x2="680" y2="220" stroke={VIZ_COLORS.grid} strokeWidth="1.6" />
      <line x1="90" y1="70" x2="90" y2="370" stroke={VIZ_COLORS.grid} strokeWidth="1.6" />
      <path d={curvePath(fn, 0, 12, sx, sy, 320)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3.5" />
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>y = {amplitude} sin({frequency}x)</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        amplitude {amplitude} · period {fmt((Math.PI * 2) / frequency, 2)}
      </text>
    </>
  );
}

function Forces({ data }) {
  const forces = Array.isArray(data.forces) ? data.forces.map((force) => force.map(Number)) : [[5, 0], [-5, 0], [0, 4], [0, -4]];
  const cx = 380;
  const cy = 220;
  const colors = [VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two, VIZ_COLORS.five, VIZ_COLORS.four, VIZ_COLORS.six];
  return (
    <>
      <line x1="100" y1={cy} x2="660" y2={cy} stroke={VIZ_COLORS.grid} />
      <line x1={cx} y1="70" x2={cx} y2="370" stroke={VIZ_COLORS.grid} />
      {forces.map((force, index) => (
        <g key={index}>
          {arrow(cx, cy, cx + force[0] * 16, cy - force[1] * 16, colors[index % colors.length], 3)}
          <text x={cx + force[0] * 16 + 8} y={cy - force[1] * 16 - 8} fontSize="12" fill={colors[index % colors.length]}>
            F{index + 1}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r="6" fill={INK} />
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Equilibrium: net force = 0</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        {forces.map((force) => `(${force[0]}, ${force[1]})`).join(" + ")} = (0, 0)
      </text>
    </>
  );
}

function Friction({ data }) {
  const mu = Number(data.mu ?? 0.4);
  const normal = Number(data.normal ?? 50);
  const friction = Number(data.friction ?? mu * normal);
  const baseY = 300;
  return (
    <>
      <Ground y={baseY} />
      <Block x="300" y={baseY - 78} label="m" />
      {arrow(350, baseY - 39, 470, baseY - 39, VIZ_COLORS.one)}
      <text x="480" y={baseY - 34} fontSize="13" fill={VIZ_COLORS.one}>applied F</text>
      {arrow(300, baseY - 39, 190, baseY - 39, VIZ_COLORS.four)}
      <text x="150" y={baseY - 34} fontSize="13" fill={VIZ_COLORS.four}>friction {fmt(friction, 1)} N</text>
      {arrow(400, baseY - 78, 400, baseY - 178, VIZ_COLORS.three)}
      <text x="412" y={baseY - 170} fontSize="13" fill={VIZ_COLORS.three}>N = {normal}</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Limiting friction</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        f = μN = {mu} × {normal} = {fmt(friction, 1)} N
      </text>
    </>
  );
}

function Incline({ data }) {
  const angle = Number(data.angle ?? 30);
  const mass = Number(data.mass ?? 2);
  const radians = (angle * Math.PI) / 180;
  const baseY = 330;
  const start = { x: 150, y: baseY };
  const end = { x: 620, y: baseY - Math.tan(radians) * 470 };
  const t = 0.58;
  const px = start.x + (end.x - start.x) * t;
  const py = start.y + (end.y - start.y) * t;
  const force = mass * 10 * Math.sin(radians);
  return (
    <>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth="4" />
      <line x1={start.x} y1={start.y} x2={end.x} y2={baseY} stroke={MUTED} strokeDasharray="6 5" />
      <polygon points={`${start.x},${baseY} ${end.x},${baseY} ${end.x},${end.y}`} fill={VIZ_COLORS.one} fillOpacity="0.08" />
      <AngleArc cx={start.x} cy={baseY} r={64} from={0} to={angle} color={VIZ_COLORS.two} />
      <text x={start.x + 74} y={baseY - 12} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>{angle}°</text>
      <g transform={`rotate(${-angle} ${px} ${py})`}>
        <Block x={px - 45} y={py - 58} label={`${mass} kg`} color={VIZ_COLORS.five} />
      </g>
      {arrow(px, py - 30, px + Math.sin(radians) * 90, py + Math.cos(radians) * 90, VIZ_COLORS.three)}
      <text x={px + Math.sin(radians) * 96} y={py + Math.cos(radians) * 96} fontSize="12" fill={VIZ_COLORS.three}>
        mg sin θ = {fmt(force, 1)} N
      </text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Inclined plane</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        The component along the slope is mg sin θ
      </text>
    </>
  );
}

function Moment({ data }) {
  const force = Number(data.force ?? 10);
  const distance = Number(data.distance ?? 3);
  const pivotX = 260;
  const y = 240;
  return (
    <>
      <line x1="120" y1={y} x2="640" y2={y} stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <polygon points={`${pivotX},${y + 8} ${pivotX - 26},${y + 58} ${pivotX + 26},${y + 58}`} fill={VIZ_COLORS.three} fillOpacity="0.3" stroke={VIZ_COLORS.three} strokeWidth="2" />
      <circle cx={pivotX} cy={y} r="7" fill={VIZ_COLORS.three} />
      {arrow(pivotX + distance * 60, y - 90, pivotX + distance * 60, y - 10, VIZ_COLORS.one, 4)}
      <text x={pivotX + distance * 60 + 12} y={y - 96} fontSize="13" fill={VIZ_COLORS.one}>F = {force} N</text>
      <line x1={pivotX} y1={y + 78} x2={pivotX + distance * 60} y2={y + 78} stroke={VIZ_COLORS.two} strokeWidth="2" />
      <text x={pivotX + (distance * 60) / 2} y={y + 100} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>d = {distance} m</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Moment of a force</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        moment = F × d = {force} × {distance} = {force * distance} N·m
      </text>
    </>
  );
}

function Couple({ data }) {
  const force = Number(data.force ?? 8);
  const distance = Number(data.distance ?? 2);
  return (
    <>
      <rect x="220" y="220" width="320" height="44" rx="10" fill={VIZ_COLORS.one} fillOpacity="0.14" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      {arrow(220, 200, 220, 130, VIZ_COLORS.three, 4)}
      {arrow(540, 284, 540, 354, VIZ_COLORS.three, 4)}
      <text x="200" y="120" fontSize="13" fill={VIZ_COLORS.three}>F = {force}</text>
      <text x="556" y="370" fontSize="13" fill={VIZ_COLORS.three}>F = {force}</text>
      <line x1="220" y1="332" x2="540" y2="332" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="6 4" />
      <text x="380" y="314" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>d = {distance} m</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>A couple</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        moment = F × d = {force * distance} N·m, with no net force
      </text>
    </>
  );
}

function Ladder({ data }) {
  const length = Number(data.length ?? 5);
  const angle = Number(data.angle ?? 60);
  const baseY = 330;
  const footX = 250;
  const wallX = 600;
  const radians = (angle * Math.PI) / 180;
  const topY = baseY - Math.sin(radians) * 260;
  const foot = { x: wallX - Math.cos(radians) * 260, y: baseY };
  return (
    <>
      <line x1={wallX} y1="70" x2={wallX} y2={baseY} stroke={INK} strokeWidth="4" />
      <Ground y={baseY} />
      <line x1={foot.x} y1={foot.y} x2={wallX} y2={topY} stroke={VIZ_COLORS.one} strokeWidth="6" strokeLinecap="round" />
      <AngleArc cx={foot.x} cy={baseY} r={54} from={0} to={angle} color={VIZ_COLORS.two} />
      <text x={foot.x + 62} y={baseY - 12} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>{angle}°</text>
      <circle cx={foot.x} cy={baseY} r="6" fill={VIZ_COLORS.three} />
      <text x={foot.x - 30} y={baseY + 26} fontSize="12" fill={VIZ_COLORS.three}>foot</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Ladder in equilibrium</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        length {length} m · take moments about the foot
      </text>
    </>
  );
}

function CentreOfGravity({ data }) {
  const parts = Array.isArray(data.parts) ? data.parts : [[2, 1], [3, 1]];
  const totalMass = parts.reduce((sum, part) => sum + Number(part[0] ?? 0), 0) || 1;
  const centroid = parts.reduce(
    (sum, part, index) => sum + Number(part[0] ?? 0) * (index + 1) * 90,
    0,
  ) / totalMass;
  const baseY = 310;
  return (
    <>
      <Ground y={baseY} />
      {parts.map((part, index) => {
        const mass = Number(part[0] ?? 1);
        const x = 160 + index * 180;
        return (
          <g key={index}>
            <rect x={x} y={baseY - mass * 42} width="130" height={mass * 42} rx="8" fill={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two][index % 3]} fillOpacity="0.2" stroke={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two][index % 3]} strokeWidth="2.4" />
            <text x={x + 65} y={baseY - mass * 21 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={INK}>
              m = {mass}
            </text>
          </g>
        );
      })}
      <line x1={160 + centroid} y1="90" x2={160 + centroid} y2={baseY} stroke={VIZ_COLORS.four} strokeWidth="2.5" strokeDasharray="6 5" />
      <circle cx={160 + centroid} cy={baseY - 10} r="7" fill={VIZ_COLORS.four} />
      <text x={160 + centroid + 12} y="110" fontSize="13" fill={VIZ_COLORS.four}>centroid</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Centre of gravity</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        x̄ = Σmx / Σm — the mass-weighted average position
      </text>
    </>
  );
}

function FreeBody({ data }) {
  const angle = 28;
  const radians = (angle * Math.PI) / 180;
  const baseY = 330;
  const start = { x: 160, y: baseY };
  const end = { x: 600, y: baseY - Math.tan(radians) * 440 };
  const px = start.x + (end.x - start.x) * 0.55;
  const py = start.y + (end.y - start.y) * 0.55;
  return (
    <>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={INK} strokeWidth="4" />
      <polygon points={`${start.x},${baseY} ${end.x},${baseY} ${end.x},${end.y}`} fill={VIZ_COLORS.one} fillOpacity="0.07" />
      <g transform={`rotate(${-angle} ${px} ${py})`}>
        <Block x={px - 50} y={py - 62} width="100" height="58" label="m" color={VIZ_COLORS.five} />
      </g>
      {arrow(px, py - 20, px, py + 74, VIZ_COLORS.one, 3)}
      <text x={px + 10} y={py + 66} fontSize="12" fill={VIZ_COLORS.one}>W = mg</text>
      {arrow(px, py - 24, px + Math.sin(radians) * 74, py - 24 - Math.cos(radians) * 74, VIZ_COLORS.three, 3)}
      <text x={px + Math.sin(radians) * 82} y={py - 32 - Math.cos(radians) * 74} fontSize="12" fill={VIZ_COLORS.three}>N</text>
      {arrow(px, py - 24, px - Math.cos(radians) * 74, py + 24 - Math.sin(radians) * 74, VIZ_COLORS.four, 3)}
      <text x={px - Math.cos(radians) * 82 - 20} y={py + 20 - Math.sin(radians) * 74} fontSize="12" fill={VIZ_COLORS.four}>f</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Free body diagram</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        Always include weight, normal reaction and friction
      </text>
    </>
  );
}

function Projectile({ data, components = false, incline = false }) {
  const speed = Number(data.speed ?? 20);
  const angle = Number(data.angle ?? 45);
  const radians = (angle * Math.PI) / 180;
  const g = 10;
  const range = (speed * speed * Math.sin(2 * radians)) / g;
  const peak = (speed * speed * Math.sin(radians) ** 2) / (2 * g);
  const baseY = 330;
  const originX = 120;
  const scaleX = 520 / Math.max(range, 1);
  const scaleY = 230 / Math.max(peak, 1);
  const sx = (x) => originX + x * scaleX;
  const sy = (y) => baseY - y * scaleY;
  const fn = (x) => x * Math.tan(radians) - (g * x * x) / (2 * speed * speed * Math.cos(radians) ** 2);
  const path = (() => {
    let output = "";
    for (let index = 0; index <= 100; index += 1) {
      const x = (range * index) / 100;
      output += `${index === 0 ? "M" : "L"}${sx(x)} ${sy(fn(x))} `;
    }
    return output;
  })();

  return (
    <>
      <Ground y={baseY} />
      <path d={path} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3.5" />
      <circle cx={sx(range)} cy={baseY} r="6" fill={VIZ_COLORS.two} />
      <text x={sx(range) - 10} y={baseY + 28} textAnchor="middle" fontSize="12" fill={VIZ_COLORS.two}>range {fmt(range, 1)} m</text>
      {components ? (
        <>
          {arrow(originX, baseY, originX + Math.cos(radians) * 110, baseY, VIZ_COLORS.three)}
          {arrow(originX, baseY, originX, baseY - Math.sin(radians) * 110, VIZ_COLORS.five)}
          {arrow(originX, baseY, originX + Math.cos(radians) * 110, baseY - Math.sin(radians) * 110, VIZ_COLORS.one, 4)}
          <text x={originX + Math.cos(radians) * 116} y={baseY + 22} fontSize="12" fill={VIZ_COLORS.three}>vₓ</text>
          <text x={originX - 28} y={baseY - Math.sin(radians) * 116} fontSize="12" fill={VIZ_COLORS.five}>v_y</text>
        </>
      ) : null}
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        {incline ? "Projectile on a slope" : "Projectile motion"}
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        R = v² sin 2θ / g = {fmt(range, 1)} m · peak = {fmt(peak, 1)} m
      </text>
    </>
  );
}

function RiverCrossing({ data }) {
  const boat = Number(data.boat ?? 4);
  const river = Number(data.river ?? 3);
  const baseY = 170;
  const topY = 300;
  return (
    <>
      <rect x="90" y={baseY} width="580" height={topY - baseY} fill={VIZ_COLORS.six} fillOpacity="0.16" />
      <line x1="90" y1={baseY} x2="670" y2={baseY} stroke={INK} strokeWidth="3" />
      <line x1="90" y1={topY} x2="670" y2={topY} stroke={INK} strokeWidth="3" />
      <text x="104" y={baseY - 12} fontSize="13" fill={MUTED}>near bank</text>
      <text x="104" y={topY + 22} fontSize="13" fill={MUTED}>far bank</text>
      {arrow(250, (baseY + topY) / 2, 250, baseY - 20, VIZ_COLORS.one, 4)}
      <text x="260" y={baseY + 4} fontSize="12" fill={VIZ_COLORS.one}>boat {boat}</text>
      {arrow(250, (baseY + topY) / 2, 250 - river * 26, (baseY + topY) / 2 + 26, VIZ_COLORS.three, 3)}
      <text x="140" y={(baseY + topY) / 2 + 48} fontSize="12" fill={VIZ_COLORS.three}>river {river}</text>
      {arrow(250, (baseY + topY) / 2, 250, baseY - 20, VIZ_COLORS.two, 3)}
      <text x="380" y="64" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Crossing a river</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        aim upstream: crossing speed = √(boat² − river²) = {fmt(Math.sqrt(Math.max(0, boat * boat - river * river)), 2)}
      </text>
    </>
  );
}

function RainPerson({ data }) {
  const rain = Number(data.rain ?? 5);
  const walk = Number(data.walk ?? 3);
  const baseY = 320;
  return (
    <>
      <Ground y={baseY} />
      <line x1="300" y1={baseY - 160} x2="300" y2={baseY} stroke={INK} strokeWidth="4" />
      <circle cx="300" cy={baseY - 176} r="20" fill={VIZ_COLORS.one} fillOpacity="0.2" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <line x1="300" y1={baseY - 80} x2="250" y2={baseY - 40} stroke={INK} strokeWidth="3" />
      <line x1="300" y1={baseY - 80} x2="350" y2={baseY - 40} stroke={INK} strokeWidth="3" />
      {[0, 1, 2, 3].map((index) => (
        arrow(150 + index * 46, 90 + index * 20, 190 + index * 46, 170 + index * 20, VIZ_COLORS.six, 2.2)
      ))}
      {arrow(360, baseY - 40, 430, baseY - 40, VIZ_COLORS.three, 3)}
      <text x="440" y={baseY - 36} fontSize="12" fill={VIZ_COLORS.three}>walk {walk}</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        relative speed = √(rain² + walk²) = √{rain * rain + walk * walk} = {fmt(Math.hypot(rain, walk), 2)}
      </text>
    </>
  );
}

function FreeFall({ data }) {
  const u = Number(data.u ?? 20);
  const g = Number(data.g ?? 10);
  const time = u / g;
  const height = (u * u) / (2 * g);
  const baseY = 340;
  const topY = 100;
  return (
    <>
      <Ground y={baseY} />
      <line x1="380" y1={topY} x2="380" y2={baseY - 20} stroke={MUTED} strokeDasharray="6 5" />
      <circle cx="380" cy={baseY - 20 - (height / Math.max(height, 1)) * 190} r="14" fill={VIZ_COLORS.one} fillOpacity="0.3" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      {arrow(410, baseY - 20, 410, baseY - 120, VIZ_COLORS.three)}
      <text x="424" y={baseY - 114} fontSize="12" fill={VIZ_COLORS.three}>u = {u}</text>
      {arrow(470, baseY - 120, 470, baseY - 20, VIZ_COLORS.four)}
      <text x="484" y={baseY - 30} fontSize="12" fill={VIZ_COLORS.four}>g = {g}</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Vertical throw</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        time to top {fmt(time, 2)} s · height {fmt(height, 1)} m
      </text>
    </>
  );
}

function Work({ data }) {
  const force = Number(data.force ?? 10);
  const displacement = Number(data.displacement ?? 3);
  const angle = Number(data.angle ?? 0);
  const radians = (angle * Math.PI) / 180;
  const baseY = 300;
  return (
    <>
      <Ground y={baseY} />
      <Block x="220" y={baseY - 80} label="m" />
      {arrow(320, baseY - 40, 320 + Math.cos(radians) * 120, baseY - 40 - Math.sin(radians) * 120, VIZ_COLORS.one, 3.5)}
      <text x={320 + Math.cos(radians) * 126} y={baseY - 46 - Math.sin(radians) * 120} fontSize="12" fill={VIZ_COLORS.one}>F = {force}</text>
      {arrow(220, baseY + 26, 220 + displacement * 42, baseY + 26, VIZ_COLORS.three, 2.4)}
      <text x={220 + (displacement * 42) / 2} y={baseY + 48} textAnchor="middle" fontSize="12" fill={VIZ_COLORS.three}>d = {displacement}</text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Work done by a force</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        W = Fd cos θ = {fmt(force * displacement * Math.cos(radians), 1)} J
      </text>
    </>
  );
}

function MotionIntegration({ data }) {
  const sx = (t) => 90 + (t / 6) * 580;
  const sy = (v) => 330 - (v / 120) * 240;
  const velocity = (t) => 3 * t * t;
  return (
    <>
      <line x1="80" y1="340" x2="690" y2="340" stroke={INK} strokeWidth="2.5" />
      <line x1="90" y1="70" x2="90" y2="350" stroke={INK} strokeWidth="2.5" />
      <path d={curvePath(velocity, 0, 6, sx, sy, 120)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3.5" />
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>v = 3t², from a = 6t</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        Integrate acceleration to get velocity, then displacement
      </text>
    </>
  );
}

function TrigReal({ data }) {
  const type = data.type ?? "height";
  const baseY = 320;
  return (
    <>
      <Ground y={baseY} />
      <line x1="170" y1={baseY} x2="590" y2={baseY} stroke={VIZ_COLORS.two} strokeWidth="3" />
      <line x1="590" y1={baseY} x2="590" y2={baseY - 190} stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1="170" y1={baseY} x2="590" y2={baseY - 190} stroke={VIZ_COLORS.three} strokeWidth="3" />
      <AngleArc cx="170" cy={baseY} r={62} from={0} to={Math.atan2(190, 420) * (180 / Math.PI)} color={VIZ_COLORS.four} />
      <text x="246" y={baseY - 16} fontSize="13" fontWeight="800" fill={VIZ_COLORS.four}>
        {fmt((Math.atan2(190, 420) * 180) / Math.PI, 1)}°
      </text>
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        {type === "slope" ? "Measuring a slope" : "Height and distance"}
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        tan θ = opposite / adjacent · sin θ = opposite / hypotenuse
      </text>
    </>
  );
}

export default function PhysicsScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "elevation";

  let body;
  switch (mode) {
    case "elevation":
      body = <Elevation data={data} />;
      break;
    case "depression":
      body = <Elevation data={data} depression />;
      break;
    case "shadow":
      body = <Shadow data={data} />;
      break;
    case "focus-reflection":
      body = <FocusReflection />;
      break;
    case "wave":
    case "trig-real":
    case "trig-real-life":
      body = mode === "wave" ? <Wave data={data} /> : <TrigReal data={data} />;
      break;
    case "equilibrium":
    case "forces":
    case "free-body":
    case "free-body-diagram":
      body = mode === "equilibrium" ? <Forces data={data} /> : <FreeBody data={data} />;
      break;
    case "friction":
      body = <Friction data={data} />;
      break;
    case "incline":
      body = <Incline data={data} />;
      break;
    case "moment":
      body = <Moment data={data} />;
      break;
    case "couple":
      body = <Couple data={data} />;
      break;
    case "ladder":
    case "ladder-rate":
      body = <Ladder data={data} />;
      break;
    case "centre-of-gravity":
      body = <CentreOfGravity data={data} />;
      break;
    case "projectile":
      body = <Projectile data={data} />;
      break;
    case "projectile-components":
      body = <Projectile data={data} components />;
      break;
    case "projectile-incline":
      body = <Projectile data={data} incline />;
      break;
    case "river-crossing":
      body = <RiverCrossing data={data} />;
      break;
    case "rain-person":
      body = <RainPerson data={data} />;
      break;
    case "free-fall":
      body = <FreeFall data={data} />;
      break;
    case "work":
      body = <Work data={data} />;
      break;
    case "motion-integration":
    case "kinematics":
      body = <MotionIntegration data={data} />;
      break;
    case "interception":
      body = <Interception data={data} />;
      break;
    default:
      body = <TrigReal data={data} />;
  }

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.moment != null ? (
            <span className="concept-chip">
              <span>moment</span>
              <strong>{data.moment} N·m</strong>
            </span>
          ) : null}
          {data.force != null ? (
            <span className="concept-chip">
              <span>force</span>
              <strong>{data.force} N</strong>
            </span>
          ) : null}
          {data.range != null ? (
            <span className="concept-chip">
              <span>range</span>
              <strong>{data.range} m</strong>
            </span>
          ) : null}
          {step?.formula ? <MathFormula formula={step.formula} /> : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Physics scene"}
    >
      <SceneCanvas label={spec?.title?.[lang] ?? "Physics scene"}>{body}</SceneCanvas>
    </SceneShell>
  );
}

function Interception({ data }) {
  const v1 = Number(data.v1 ?? 5);
  const v2 = Number(data.v2 ?? 3);
  const startGap = 20;
  const time = startGap / Math.max(0.1, v1 - v2);
  return (
    <>
      <line x1="100" y1="240" x2="660" y2="240" stroke={INK} strokeWidth="3" />
      <circle cx={180 + time * v1 * 8} cy="220" r="12" fill={VIZ_COLORS.one} />
      <circle cx={420 + time * v2 * 8} cy="220" r="12" fill={VIZ_COLORS.three} />
      {arrow(180 + time * v1 * 8, 220, 180 + time * v1 * 8 + 60, 220, VIZ_COLORS.one, 2.5)}
      {arrow(420 + time * v2 * 8, 220, 420 + time * v2 * 8 + 60, 220, VIZ_COLORS.three, 2.5)}
      <text x="380" y="54" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>Collision / interception</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        set positions equal: {v1}t = {startGap} + {v2}t → t = {fmt(time, 2)} s
      </text>
    </>
  );
}
