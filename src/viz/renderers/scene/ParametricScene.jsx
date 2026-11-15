"use client";

import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";
import UnitCircleScene from "./UnitCircleScene";

const W = 760;
const H = 420;
const PAD = 52;

function Chart({ xMin, xMax, yMin, yMax, labelX = "x", labelY = "y", children }) {
  const sx = (x) => PAD + ((x - xMin) / (xMax - xMin)) * (W - PAD * 2);
  const sy = (y) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2);
  return (
    <SceneCanvas label="Parametric curve">
      <Axes
        width={W}
        height={H}
        padding={PAD}
        xMin={xMin}
        xMax={xMax}
        yMin={yMin}
        yMax={yMax}
        xStep={Math.max(1, Math.round((xMax - xMin) / 8))}
        yStep={Math.max(1, Math.round((yMax - yMin) / 8))}
        labelX={labelX}
        labelY={labelY}
      />
      {children(sx, sy)}
    </SceneCanvas>
  );
}

function ConicParametric({ data }) {
  const a = Number(data.a ?? 2);
  const t = Number(data.t ?? (Array.isArray(data.point) ? data.point[0] / (2 * a) : 2));
  const x = a * t * t;
  const y = 2 * a * t;
  const view = { xMin: -1, xMax: Math.max(10, x + 2), yMin: -Math.max(6, Math.abs(y) + 2), yMax: Math.max(10, y + 2) };

  return (
    <Chart {...view}>
      {(sx, sy) => (
        <>
          <path
            d={Array.from({ length: 121 }, (_, index) => {
              const parameter = -6 + (12 * index) / 120;
              const px = a * parameter * parameter;
              const py = 2 * a * parameter;
              return `${index === 0 ? "M" : "L"}${sx(px)} ${sy(py)}`;
            }).join(" ")}
            fill="none"
            stroke={VIZ_COLORS.one}
            strokeWidth="3"
          />
          <circle cx={sx(x)} cy={sy(y)} r="6" fill={VIZ_COLORS.two} />
          <text x={sx(x) + 10} y={sy(y) - 10} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>
            ({fmt(x, 2)}, {fmt(y, 2)})
          </text>
          <text x={PAD + 12} y={PAD + 22} fontSize="13" fill="var(--text-muted)">
            y² = 4ax · x = at² · y = 2at
          </text>
        </>
      )}
    </Chart>
  );
}

function CircleParametric({ data }) {
  const h = Number(data.h ?? 1);
  const k = Number(data.k ?? 2);
  const r = Number(data.r ?? 3);
  const angle = Number(data.angle ?? 35);
  const radians = (angle * Math.PI) / 180;
  const px = h + r * Math.cos(radians);
  const py = k + r * Math.sin(radians);
  const span = r + 3;
  const view = {
    xMin: h - span,
    xMax: h + span,
    yMin: k - span,
    yMax: k + span,
  };

  return (
    <Chart {...view}>
      {(sx, sy) => (
        <>
          <circle
            cx={sx(h)}
            cy={sy(k)}
            r={Math.abs(sx(h + r) - sx(h))}
            fill={VIZ_COLORS.one}
            fillOpacity="0.08"
            stroke={VIZ_COLORS.one}
            strokeWidth="3"
          />
          <circle cx={sx(h)} cy={sy(k)} r="5" fill={VIZ_COLORS.one} />
          <line x1={sx(h)} y1={sy(k)} x2={sx(px)} y2={sy(py)} stroke={VIZ_COLORS.two} strokeWidth="2.6" />
          <circle cx={sx(px)} cy={sy(py)} r="6" fill={VIZ_COLORS.two} />
          <text x={sx(px) + 10} y={sy(py) - 10} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>
            (h + r cos θ, k + r sin θ)
          </text>
          <text x={sx(h) + 10} y={sy(k) + 20} fontSize="12" fill="var(--text-muted)">
            ({h}, {k})
          </text>
        </>
      )}
    </Chart>
  );
}

function RotationProof({ data }) {
  const a = Number(data.a ?? 30);
  const b = Number(data.b ?? 45);
  const cx = 380;
  const cy = 220;
  const radius = 140;
  const point = (angle) => ({
    x: cx + Math.cos((angle * Math.PI) / 180) * radius,
    y: cy - Math.sin((angle * Math.PI) / 180) * radius,
  });
  const first = point(a);
  const second = point(a + b);

  return (
    <SceneCanvas label="Rotation proof">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={VIZ_COLORS.one} strokeWidth="2.4" />
      <line x1={cx} y1={cy} x2={point(0).x} y2={point(0).y} stroke="var(--text-soft)" />
      <line x1={cx} y1={cy} x2={first.x} y2={first.y} stroke={VIZ_COLORS.three} strokeWidth="3" />
      <line x1={cx} y1={cy} x2={second.x} y2={second.y} stroke={VIZ_COLORS.two} strokeWidth="3" />
      <path
        d={`M${cx + 64} ${cy} A64 64 0 0 0 ${cx + Math.cos(((a + b) * Math.PI) / 180) * 64} ${cy - Math.sin(((a + b) * Math.PI) / 180) * 64}`}
        fill="none"
        stroke={VIZ_COLORS.four}
        strokeWidth="3"
      />
      <text x={first.x + 10} y={first.y - 10} fontSize="13" fill={VIZ_COLORS.three}>A = {a}°</text>
      <text x={second.x + 10} y={second.y - 10} fontSize="13" fill={VIZ_COLORS.two}>A + B = {a + b}°</text>
      <text x="380" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)">
        Rotating by A then B adds the angles
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
        cos(A + B) = cos A cos B − sin A sin B
      </text>
    </SceneCanvas>
  );
}

export default function ParametricScene(props) {
  const { step, spec } = props;
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "unit-circle";

  if (mode === "conic-parametric") {
    return (
      <SceneShell
        footer={
          <>
            <span className="concept-rule">conic parametric</span>
            <span className="concept-chip">
              <span>a</span>
              <strong>{data.a ?? 2}</strong>
            </span>
          </>
        }
        label={spec?.title?.en ?? "Parametric conic"}
      >
        <ConicParametric data={data} />
      </SceneShell>
    );
  }

  if (mode === "circle-parametric") {
    return (
      <SceneShell
        footer={
          <>
            <span className="concept-rule">circle parametric</span>
            <span className="concept-chip">
              <span>centre</span>
              <strong>({data.h ?? 1}, {data.k ?? 2})</strong>
            </span>
            <span className="concept-chip">
              <span>r</span>
              <strong>{data.r ?? 3}</strong>
            </span>
          </>
        }
        label={spec?.title?.en ?? "Parametric circle"}
      >
        <CircleParametric data={data} />
      </SceneShell>
    );
  }

  if (mode === "rotation-proof") {
    return (
      <SceneShell
        footer={
          <>
            <span className="concept-rule">rotation proof</span>
            <span className="concept-chip">
              <span>A + B</span>
              <strong>{Number(data.a ?? 30) + Number(data.b ?? 45)}°</strong>
            </span>
          </>
        }
        label={spec?.title?.en ?? "Rotation proof"}
      >
        <RotationProof data={data} />
      </SceneShell>
    );
  }

  return <UnitCircleScene {...props} />;
}
