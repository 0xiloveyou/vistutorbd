"use client";

import MathFormula from "@/components/MathFormula";
import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
} from "./SceneKit";

function project(x, y, z) {
  return {
    x: 380 + (x - z) * 62,
    y: 250 + (x + z) * 30 - y * 86,
  };
}

function Edges({ size = 2.2, color = VIZ_COLORS.one }) {
  const s = size;
  const corners = [
    [0, 0, 0],
    [s, 0, 0],
    [s, 0, s],
    [0, 0, s],
    [0, s, 0],
    [s, s, 0],
    [s, s, s],
    [0, s, s],
  ].map(([x, y, z]) => project(x, y, z));
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];
  return (
    <g>
      {edges.map(([from, to], index) => (
        <line
          key={index}
          x1={corners[from].x}
          y1={corners[from].y}
          x2={corners[to].x}
          y2={corners[to].y}
          stroke={color}
          strokeWidth="2.4"
        />
      ))}
      {corners.map((corner, index) => (
        <circle key={index} cx={corner.x} cy={corner.y} r="3" fill={color} />
      ))}
    </g>
  );
}

function Axis3D() {
  const origin = project(0, 0, 0);
  return (
    <g>
      <line x1={origin.x} y1={origin.y} x2={project(3, 0, 0).x} y2={project(3, 0, 0).y} stroke={VIZ_COLORS.one} strokeWidth="2.4" />
      <line x1={origin.x} y1={origin.y} x2={project(0, 3, 0).x} y2={project(0, 3, 0).y} stroke={VIZ_COLORS.three} strokeWidth="2.4" />
      <line x1={origin.x} y1={origin.y} x2={project(0, 0, 3).x} y2={project(0, 0, 3).y} stroke={VIZ_COLORS.two} strokeWidth="2.4" />
      <text x={project(3.2, 0, 0).x} y={project(3.2, 0, 0).y} fontSize="13" fill={VIZ_COLORS.one}>x</text>
      <text x={project(0, 3.2, 0).x} y={project(0, 3.2, 0).y} fontSize="13" fill={VIZ_COLORS.three}>y</text>
      <text x={project(0, 0, 3.2).x} y={project(0, 0, 3.2).y} fontSize="13" fill={VIZ_COLORS.two}>z</text>
    </g>
  );
}

function Vector3D({ to, color = VIZ_COLORS.two, label }) {
  const origin = project(0, 0, 0);
  const end = project(to[0], to[1], to[2]);
  const angle = Math.atan2(end.y - origin.y, end.x - origin.x);
  const back = {
    x: end.x - Math.cos(angle) * 9,
    y: end.y - Math.sin(angle) * 9,
  };
  return (
    <g>
      <line x1={origin.x} y1={origin.y} x2={back.x} y2={back.y} stroke={color} strokeWidth="3" />
      <polygon
        points={`${end.x},${end.y} ${back.x - Math.sin(angle) * 5},${back.y + Math.cos(angle) * 5} ${back.x + Math.sin(angle) * 5},${back.y - Math.cos(angle) * 5}`}
        fill={color}
      />
      {label ? (
        <text x={end.x + 8} y={end.y - 8} fontSize="13" fontWeight="800" fill={color}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function Cylinder({ radius = 100, height = 170 }) {
  const cx = 380;
  const top = 130;
  const bottom = top + height;
  return (
    <g>
      <path
        d={`M${cx - radius} ${top} L${cx - radius} ${bottom} A${radius} 34 0 0 0 ${cx + radius} ${bottom} L${cx + radius} ${top} Z`}
        fill={VIZ_COLORS.one}
        fillOpacity="0.18"
        stroke={VIZ_COLORS.one}
        strokeWidth="3"
      />
      <ellipse cx={cx} cy={top} rx={radius} ry="34" fill="var(--surface-2)" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <line x1={cx} y1={top} x2={cx} y2={bottom} stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 5" />
      <text x={cx + 10} y={(top + bottom) / 2} fontSize="13" fill={VIZ_COLORS.three}>h</text>
      <text x={cx + radius + 12} y={top + 4} fontSize="13" fill={VIZ_COLORS.one}>r</text>
    </g>
  );
}

function Cone({ radius = 110, height = 200 }) {
  const cx = 380;
  const apex = { x: cx, y: 90 };
  const base = 300;
  return (
    <g>
      <path
        d={`M${apex.x} ${apex.y} L${cx - radius} ${base} A${radius} 32 0 0 0 ${cx + radius} ${base} Z`}
        fill={VIZ_COLORS.two}
        fillOpacity="0.18"
        stroke={VIZ_COLORS.two}
        strokeWidth="3"
      />
      <ellipse cx={cx} cy={base} rx={radius} ry="32" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2.5" strokeDasharray="5 5" />
      <line x1={cx} y1={apex.y} x2={cx} y2={base} stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 5" />
      <text x={cx + 10} y={(apex.y + base) / 2} fontSize="13" fill={VIZ_COLORS.three}>h</text>
      <text x={cx + radius * 0.5} y={base - 12} fontSize="13" fill={VIZ_COLORS.two}>r</text>
    </g>
  );
}

function Sphere({ radius = 120 }) {
  return (
    <g>
      <defs>
        <radialGradient id="sphere-fill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={VIZ_COLORS.six} stopOpacity="0.5" />
          <stop offset="100%" stopColor={VIZ_COLORS.one} stopOpacity="0.18" />
        </radialGradient>
      </defs>
      <circle cx="380" cy="220" r={radius} fill="url(#sphere-fill)" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <ellipse cx="380" cy="220" rx={radius} ry="42" fill="none" stroke={VIZ_COLORS.one} strokeWidth="1.5" strokeDasharray="5 5" />
      <line x1="380" y1="220" x2={380 + radius} y2="220" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 5" />
      <text x={380 + radius * 0.5} y="212" fontSize="13" fill={VIZ_COLORS.three}>r</text>
    </g>
  );
}

function Box3D({ data }) {
  const a = Array.isArray(data.a) ? data.a : [1, 0, 0];
  const b = Array.isArray(data.b) ? data.b : [0, 1, 0];
  const c = Array.isArray(data.c) ? data.c : [0, 0, 1];
  return (
    <SceneCanvas label="3D vectors">
      <Axis3D />
      <Vector3D to={a} color={VIZ_COLORS.one} label="a" />
      <Vector3D to={b} color={VIZ_COLORS.three} label="b" />
      <Vector3D to={c} color={VIZ_COLORS.five} label="c" />
      <text x="80" y="72" fontSize="14" fill="var(--text-muted)">
        a = ({a.join(", ")}) · b = ({b.join(", ")}) · c = ({c.join(", ")})
      </text>
    </SceneCanvas>
  );
}

export default function SolidScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "mensuration";
  const solids = Array.isArray(data.solids) ? data.solids : ["cylinder", "cone", "sphere"];

  const body = (() => {
    if (mode === "cube-identity" || mode === "cube") {
      return (
        <SceneCanvas label="Cube identity">
          <Edges size={Number(data.a ?? 3) / 1.4} color={VIZ_COLORS.one} />
          <text x="80" y="72" fontSize="14" fill="var(--text-muted)">
            (a + b)³ splits into 8 blocks
          </text>
        </SceneCanvas>
      );
    }

    if (mode === "cross-product" || mode === "triple-product" || mode === "line-3d" || mode === "plane-3d") {
      return <Box3D data={data} />;
    }

    if (mode === "cone-slice") {
      return (
        <SceneCanvas label="Cone slice">
          <Cone />
          <ellipse cx="380" cy="230" rx="78" ry="22" fill={VIZ_COLORS.three} fillOpacity="0.35" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
          <text x="470" y="234" fontSize="13" fill={VIZ_COLORS.three}>
            {step?.data?.conic ?? "circle"}
          </text>
          <text x="380" y="392" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
            A horizontal slice gives a circle; tilt it for the other conics
          </text>
        </SceneCanvas>
      );
    }

    if (mode === "revolution") {
      return (
        <SceneCanvas label="Volume of revolution">
          <line x1="140" y1="300" x2="620" y2="300" stroke="var(--border-strong)" strokeWidth="2" />
          <path d="M200 300 Q 380 90 560 300" fill={VIZ_COLORS.one} fillOpacity="0.16" stroke={VIZ_COLORS.one} strokeWidth="3" />
          <line x1="380" y1="90" x2="380" y2="300" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="6 4" />
          <ellipse cx="380" cy="238" rx="86" ry="20" fill="none" stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="5 4" />
          <text x="380" y="392" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
            Rotate the region about the axis to build a solid
          </text>
        </SceneCanvas>
      );
    }

    if (mode === "arc-length") {
      return (
        <SceneCanvas label="Arc length">
          <path d="M150 300 Q 380 60 610 300" fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
          <line x1="150" y1="300" x2="610" y2="300" stroke="var(--border-strong)" strokeWidth="2" />
          <text x="380" y="392" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
            Arc length = ∫ √(1 + (dy/dx)²) dx
          </text>
        </SceneCanvas>
      );
    }

    if (mode === "frustum") {
      const r = 70;
      const R = 128;
      const top = 120;
      const bottom = 300;
      return (
        <SceneCanvas label="Frustum">
          <path
            d={`M${380 - r} ${top} L${380 - R} ${bottom} A${R} 30 0 0 0 ${380 + R} ${bottom} L${380 + r} ${top} Z`}
            fill={VIZ_COLORS.two}
            fillOpacity="0.16"
            stroke={VIZ_COLORS.two}
            strokeWidth="3"
          />
          <ellipse cx="380" cy={top} rx={r} ry="22" fill="var(--surface-2)" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
          <ellipse cx="380" cy={bottom} rx={R} ry="30" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="5 5" />
          <line x1="380" y1={top} x2="380" y2={bottom} stroke={VIZ_COLORS.three} strokeWidth="2" strokeDasharray="6 5" />
          <text x="392" y={(top + bottom) / 2} fontSize="13" fill={VIZ_COLORS.three}>h</text>
          <text x={380 + r + 8} y={top + 4} fontSize="13" fill={VIZ_COLORS.two}>r</text>
          <text x={380 + R + 8} y={bottom - 6} fontSize="13" fill={VIZ_COLORS.two}>R</text>
          <text x="380" y="372" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
            volume = ⅓πh(R² + Rr + r²) · curved area = π(r + R)l
          </text>
        </SceneCanvas>
      );
    }

    if (mode === "solids" || mode === "mensuration") {
      return (
        <SceneCanvas label="Solid shapes">
          <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)">
            Cylinder · cone · sphere
          </text>
          <g>
            <ellipse cx="170" cy="170" rx="62" ry="20" fill="var(--surface-2)" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
            <path d="M108 170 L108 300 A62 20 0 0 0 232 300 L232 170" fill={VIZ_COLORS.one} fillOpacity="0.16" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
            <text x="170" y="334" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.one}>πr²h</text>
          </g>
          <g>
            <path d="M380 130 L312 300 A68 22 0 0 0 448 300 Z" fill={VIZ_COLORS.two} fillOpacity="0.16" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
            <ellipse cx="380" cy="300" rx="68" ry="22" fill="none" stroke={VIZ_COLORS.two} strokeWidth="2" strokeDasharray="5 5" />
            <text x="380" y="334" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.two}>⅓πr²h</text>
          </g>
          <g>
            <circle cx="590" cy="230" r="76" fill={VIZ_COLORS.three} fillOpacity="0.16" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
            <ellipse cx="590" cy="230" rx="76" ry="24" fill="none" stroke={VIZ_COLORS.three} strokeWidth="1.6" strokeDasharray="5 5" />
            <text x="590" y="334" textAnchor="middle" fontSize="13" fill={VIZ_COLORS.three}>4⁄3πr³</text>
          </g>
          <text x="380" y="382" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
            Each formula multiplies a simple base by a height or radius
          </text>
        </SceneCanvas>
      );
    }

    const first = solids[0] ?? "cylinder";
    return (
      <SceneCanvas label="Solid">
        {first === "cone" ? <Cone /> : first === "sphere" ? <Sphere /> : <Cylinder />}
        <text x="80" y="72" fontSize="14" fill="var(--text-muted)">
          {solids.join(" · ")}
        </text>
      </SceneCanvas>
    );
  })();

  const formula = step?.formula;

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {formula ? <MathFormula formula={formula} /> : null}
          {data.volume != null ? (
            <span className="concept-chip">
              <span>volume</span>
              <strong>{String(data.volume)}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Solid geometry"}
    >
      {body}
    </SceneShell>
  );
}
