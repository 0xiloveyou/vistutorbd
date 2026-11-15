"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const W = 760;
const H = 420;
const PAD = 70;

function approxValue(raw) {
  if (typeof raw === "number") return raw;
  const text = String(raw ?? "")
    .replace(/\s+/g, "")
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/−/g, "-");

  if (text.includes("/")) {
    const [top, bottom] = text.split("/");
    const numerator = approxValue(top);
    const denominator = approxValue(bottom);
    return denominator ? numerator / denominator : NaN;
  }

  if (text.startsWith("sqrt")) {
    return Math.sqrt(Number(text.slice(4).replace(/[()]/g, "")));
  }

  if (text === "pi") return Math.PI;
  if (text === "pi/2") return Math.PI / 2;
  if (text === "sqrt2") return Math.SQRT2;
  if (text === "sqrt3") return Math.sqrt(3);

  const number = Number(text);
  return Number.isFinite(number) ? number : NaN;
}

function NumberLineBase({ min, max, sx, y = 220 }) {
  const ticks = [];
  const span = max - min;
  const step = span <= 0.4 ? 0.02 : span <= 4 ? 0.5 : span <= 14 ? 1 : span <= 40 ? 5 : 10;
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) {
    ticks.push(Number(value.toFixed(4)));
  }

  return (
    <g>
      <line x1={sx(min)} y1={y} x2={sx(max)} y2={y} stroke="var(--text)" strokeWidth="3" />
      <polygon points={`${sx(max)},${y} ${sx(max) - 12},${y - 6} ${sx(max) - 12},${y + 6}`} fill="var(--text)" />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={sx(tick)} y1={y - 8} x2={sx(tick)} y2={y + 8} stroke="var(--text-soft)" strokeWidth="1.6" />
          <text x={sx(tick)} y={y + 28} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
            {fmt(tick, 2)}
          </text>
        </g>
      ))}
    </g>
  );
}

function IntervalScene({ data }) {
  const min = Number(data.min ?? -5);
  const max = Number(data.max ?? 5);
  const [lower, upper] = Array.isArray(data.interval)
    ? data.interval.map(approxValue)
    : [Number(data.lower ?? 2), Number(data.upper ?? 4)];
  const includeLower = data.includeLower ?? data.closed ?? true;
  const includeUpper = data.includeUpper ?? data.closed ?? false;
  const sx = (x) => PAD + ((x - min) / (max - min)) * (W - PAD * 2);
  const y = 220;

  return (
    <SceneCanvas label="Interval on the number line">
      <NumberLineBase min={min} max={max} sx={sx} y={y} />
      <line x1={sx(lower)} y1={y} x2={sx(upper)} y2={y} stroke={VIZ_COLORS.one} strokeWidth="10" strokeLinecap="round" opacity="0.55" />
      <circle cx={sx(lower)} cy={y} r="8" fill={includeLower ? VIZ_COLORS.one : "var(--surface)"} stroke={VIZ_COLORS.one} strokeWidth="3" />
      <circle cx={sx(upper)} cy={y} r="8" fill={includeUpper ? VIZ_COLORS.one : "var(--surface)"} stroke={VIZ_COLORS.one} strokeWidth="3" />
      <text x={sx(lower)} y={y - 28} textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.one}>
        {fmt(lower, 2)}
      </text>
      <text x={sx(upper)} y={y - 28} textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.one}>
        {fmt(upper, 2)}
      </text>
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        {includeLower ? "[" : "("} {fmt(lower, 2)}, {fmt(upper, 2)} {includeUpper ? "]" : ")"}
      </text>
      <text x="380" y="340" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        A filled endpoint is included; an open endpoint is not
      </text>
    </SceneCanvas>
  );
}

function InequalityScene({ data, mode }) {
  const min = -6;
  const max = 8;
  const sx = (x) => PAD + ((x - min) / (max - min)) * (W - PAD * 2);
  const y = 220;
  let boundary = 4;
  let direction = "right";
  let phrase = "x > 4";
  let note = "Keep the inequality direction when adding or subtracting";

  if (mode === "linear-inequality") {
    const a = Number(data.a ?? 2);
    const b = Number(data.b ?? 3);
    const c = Number(data.c ?? 11);
    boundary = (c - b) / a;
    direction = a >= 0 ? "right" : "left";
    phrase = `x ${direction === "right" ? ">" : "<"} ${fmt(boundary, 2)}`;
    note = `Solve ${a}x + ${b} < ${c}`;
  } else if (mode === "sign-flip") {
    boundary = -3;
    direction = "right";
    phrase = "x > −3";
    note = "Dividing by a negative number flips the inequality";
  }

  const left = direction === "right" ? sx(boundary) : sx(min);
  const right = direction === "right" ? sx(max) : sx(boundary);

  return (
    <SceneCanvas label="Inequality on the number line">
      <NumberLineBase min={min} max={max} sx={sx} y={y} />
      <rect x={left} y={y - 26} width={right - left} height="52" fill={VIZ_COLORS.one} opacity="0.18" rx="10" />
      <circle cx={sx(boundary)} cy={y} r="8" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="3" />
      <text x="380" y="92" textAnchor="middle" fontSize="20" fontWeight="800" fill={VIZ_COLORS.one}>
        {phrase}
      </text>
      <text x="380" y="340" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        {note}
      </text>
      {mode === "sign-flip" ? (
        <text x="380" y="374" textAnchor="middle" fontSize="14" fill={VIZ_COLORS.two}>
          −3x &lt; 9 → x &gt; −3
        </text>
      ) : null}
    </SceneCanvas>
  );
}

function ModulusScene({ data }) {
  const centre = Number(data.center ?? 2);
  const radius = Number(data.radius ?? 3);
  const min = Math.floor(centre - radius - 3);
  const max = Math.ceil(centre + radius + 3);
  const sx = (x) => PAD + ((x - min) / (max - min)) * (W - PAD * 2);
  const y = 220;
  return (
    <SceneCanvas label="Modulus as distance">
      <NumberLineBase min={min} max={max} sx={sx} y={y} />
      <circle cx={sx(centre)} cy={y} r="8" fill={VIZ_COLORS.two} />
      {[centre - radius, centre + radius].map((value) => (
        <g key={value}>
          <circle cx={sx(value)} cy={y} r="7" fill={VIZ_COLORS.one} />
          <line x1={sx(value)} y1={y - 60} x2={sx(centre)} y2={y - 60} stroke={VIZ_COLORS.one} strokeWidth="2" strokeDasharray="5 4" />
          <text x={sx(value)} y={y - 70} textAnchor="middle" fontSize="13" fill={VIZ_COLORS.one}>
            {fmt(value, 2)}
          </text>
        </g>
      ))}
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        |x − {centre}| = {radius}
      </text>
      <text x="380" y="340" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        The solutions sit exactly {radius} units from {centre}
      </text>
    </SceneCanvas>
  );
}

function OrderScene({ data }) {
  const values = Array.isArray(data.values) ? data.values : [-2, "√2", 1.5, "π/2"];
  const min = -3;
  const max = 4;
  const sx = (x) => PAD + ((x - min) / (max - min)) * (W - PAD * 2);
  const y = 220;
  const colors = [VIZ_COLORS.one, VIZ_COLORS.two, VIZ_COLORS.three, VIZ_COLORS.five, VIZ_COLORS.four];

  return (
    <SceneCanvas label="Ordering numbers">
      <NumberLineBase min={min} max={max} sx={sx} y={y} />
      {values.map((raw, index) => {
        const value = approxValue(raw);
        const yOffset = 48 + (index % 2) * 42;
        return (
          <g key={`${raw}-${index}`}>
            <circle cx={sx(value)} cy={y} r="7" fill={colors[index % colors.length]} />
            <line x1={sx(value)} y1={y - 8} x2={sx(value)} y2={y - yOffset + 12} stroke={colors[index % colors.length]} strokeDasharray="4 4" />
            <text x={sx(value)} y={y - yOffset} textAnchor="middle" fontSize="14" fontWeight="800" fill={colors[index % colors.length]}>
              {String(raw)}
            </text>
          </g>
        );
      })}
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        Compare exact values, not just the digits
      </text>
      <text x="380" y="360" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        √2 ≈ 1.414 and π/2 ≈ 1.571, so −2 &lt; √2 &lt; 1.5 &lt; π/2
      </text>
    </SceneCanvas>
  );
}

function LogScaleScene({ data }) {
  const values = Array.isArray(data.values) ? data.values : [1, 10, 100, 1000];
  const maxLog = Math.log10(Math.max(...values));
  const sx = (value) => PAD + (Math.log10(Math.max(1, value)) / Math.max(1, maxLog)) * (W - PAD * 2);
  const y = 220;
  const min = 1;
  const max = Math.max(...values);

  return (
    <SceneCanvas label="Logarithmic scale">
      <line x1={sx(min)} y1={y} x2={sx(max)} y2={y} stroke="var(--text)" strokeWidth="3" />
      {values.map((value) => (
        <g key={value}>
          <line x1={sx(value)} y1={y - 9} x2={sx(value)} y2={y + 9} stroke="var(--text-soft)" strokeWidth="2" />
          <circle cx={sx(value)} cy={y} r="7" fill={VIZ_COLORS.one} />
          <text x={sx(value)} y={y + 32} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">
            {value}
          </text>
        </g>
      ))}
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        Equal multiplicative steps look equally spaced
      </text>
      <text x="380" y="340" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        1 → 10 → 100 → 1000 · each step is ×10
      </text>
    </SceneCanvas>
  );
}

function DecimalScene({ data }) {
  const fractions = Array.isArray(data.fractions) ? data.fractions : ["1/4", "1/3"];
  const sx = (x) => PAD + x * (W - PAD * 2);
  const y = 220;
  return (
    <SceneCanvas label="Decimal expansion">
      <NumberLineBase min={0} max={1} sx={sx} y={y} />
      {fractions.map((fraction, index) => {
        const value = approxValue(fraction);
        const color = index === 0 ? VIZ_COLORS.one : VIZ_COLORS.two;
        return (
          <g key={fraction}>
            <circle cx={sx(value)} cy={y} r="7" fill={color} />
            <text x={sx(value)} y={y - 34} textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>
              {fraction} = {value === 0.25 ? "0.25" : "0.333…"}
            </text>
            <path
              d={`M${sx(value)} ${y - 18} A 26 26 0 0 1 ${sx(value) + 6} ${y - 18}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
          </g>
        );
      })}
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        Terminating or recurring?
      </text>
      <text x="380" y="340" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        A fraction with denominator 4 terminates; denominator 3 recurs
      </text>
    </SceneCanvas>
  );
}

function DensityScene({ data }) {
  const a = Number(data.a ?? 0);
  const b = Number(data.b ?? 1);
  const zooms = [0, 1, 2].map((level) => {
    const span = (b - a) / Math.pow(4, level);
    const middle = (a + b) / 2;
    return { from: middle - span / 2, to: middle + span / 2, level };
  });
  const sx = (from, to, x) => PAD + 60 + ((x - from) / (to - from)) * (W - PAD * 2 - 120);

  return (
    <SceneCanvas label="Density of rationals">
      <text x="380" y="70" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        Between any two rationals there is another rational
      </text>
      {zooms.map((zoom, index) => {
        const y = 140 + index * 84;
        const middle = (zoom.from + zoom.to) / 2;
        return (
          <g key={index}>
            <line x1={sx(zoom.from, zoom.to, zoom.from)} y1={y} x2={sx(zoom.from, zoom.to, zoom.to)} y2={y} stroke="var(--text)" strokeWidth="2.4" />
            {[0.25, 0.5, 0.75].map((fraction) => (
              <circle
                key={fraction}
                cx={sx(zoom.from, zoom.to, zoom.from + (zoom.to - zoom.from) * fraction)}
                cy={y}
                r="5"
                fill={VIZ_COLORS.one}
              />
            ))}
            <text x="80" y={y + 4} fontSize="12" fill="var(--text-muted)">
              zoom {index + 1}
            </text>
            <text x="690" y={y + 4} textAnchor="end" fontSize="11" fill="var(--text-soft)">
              {fmt(zoom.from, 3)} … {fmt(zoom.to, 3)}
            </text>
          </g>
        );
      })}
      <text x="380" y="392" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        No matter how far you zoom, the line stays full
      </text>
    </SceneCanvas>
  );
}

function VolumeScene({ data }) {
  const litres = Number(data.litres ?? 5);
  return (
    <SceneCanvas label="Volume conversion">
      <text x="380" y="60" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        {litres} litres = {litres * 1000} millilitres
      </text>
      <rect x="250" y="100" width="180" height="220" rx="18" fill={VIZ_COLORS.six} fillOpacity="0.16" stroke={VIZ_COLORS.six} strokeWidth="3" />
      <rect x="250" y={100 + (220 * (1 - Math.min(1, litres / 10)))} width="180" height={220 * Math.min(1, litres / 10)} rx="18" fill={VIZ_COLORS.six} fillOpacity="0.35" />
      {[0, 1, 2, 3, 4, 5].map((mark) => (
        <g key={mark}>
          <line x1="250" y1={320 - mark * 44} x2="270" y2={320 - mark * 44} stroke="var(--text-soft)" />
          <text x="232" y={324 - mark * 44} textAnchor="end" fontSize="11" fill="var(--text-muted)">
            {mark * 2} L
          </text>
        </g>
      ))}
      <text x="380" y="360" textAnchor="middle" fontSize="15" fill={VIZ_COLORS.one}>
        1 L = 1000 mL
      </text>
      <text x="380" y="392" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        1 mL = 1 cm³ · 1000 cm³ = 1 L
      </text>
    </SceneCanvas>
  );
}

function TriangleInequality({ data }) {
  const a = Number(data.a ?? -3);
  const b = Number(data.b ?? 5);
  const min = -8;
  const max = 8;
  const sx = (x) => PAD + ((x - min) / (max - min)) * (W - PAD * 2);
  const y = 240;
  return (
    <SceneCanvas label="Triangle inequality">
      <NumberLineBase min={min} max={max} sx={sx} y={y} />
      {[
        { label: "a", value: a, color: VIZ_COLORS.one },
        { label: "b", value: b, color: VIZ_COLORS.three },
        { label: "a + b", value: a + b, color: VIZ_COLORS.two },
      ].map((item) => (
        <g key={item.label}>
          <circle cx={sx(item.value)} cy={y} r="7" fill={item.color} />
          <text x={sx(item.value)} y={y - 30} textAnchor="middle" fontSize="13" fontWeight="800" fill={item.color}>
            {item.label} = {item.value}
          </text>
        </g>
      ))}
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        |a + b| ≤ |a| + |b|
      </text>
      <text x="380" y="352" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        {Math.abs(a + b)} ≤ {Math.abs(a)} + {Math.abs(b)} = {Math.abs(a) + Math.abs(b)}
      </text>
    </SceneCanvas>
  );
}

function CompletenessScene({ data }) {
  const sx = (x) => PAD + ((x - 1.3) / 0.2) * (W - PAD * 2);
  const y = 230;
  return (
    <SceneCanvas label="Completeness">
      <NumberLineBase min={1.3} max={1.5} sx={sx} y={y} />
      <line x1={sx(1.3)} y1={y} x2={sx(Math.SQRT2)} y2={y} stroke={VIZ_COLORS.one} strokeWidth="8" opacity="0.3" />
      <circle cx={sx(Math.SQRT2)} cy={y} r="8" fill={VIZ_COLORS.two} />
      <text x={sx(Math.SQRT2)} y={y - 30} textAnchor="middle" fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>
        √2 ≈ {fmt(Math.SQRT2, 6)}
      </text>
      <text x="380" y="92" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        There is a real number at every gap
      </text>
      <text x="380" y="342" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Zoom in forever: the decimal never repeats, but the point is there
      </text>
    </SceneCanvas>
  );
}

export default function NumberLineConcept({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "interval";

  let body;
  switch (mode) {
    case "linear-inequality":
    case "sign-flip":
      body = <InequalityScene data={data} mode={mode} />;
      break;
    case "modulus":
      body = <ModulusScene data={data} />;
      break;
    case "order":
      body = <OrderScene data={data} />;
      break;
    case "log-scale":
      body = <LogScaleScene data={data} />;
      break;
    case "density":
      body = <DensityScene data={data} />;
      break;
    case "decimal-expansion":
      body = <DecimalScene data={data} />;
      break;
    case "volume-conversion":
      body = <VolumeScene data={data} />;
      break;
    case "triangle-inequality":
      body = <TriangleInequality data={data} />;
      break;
    case "completeness":
      body = <CompletenessScene data={data} />;
      break;
    default:
      body = <IntervalScene data={data} />;
  }

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.closed != null ? (
            <span className="concept-chip">
              <span>endpoints</span>
              <strong>{data.closed ? "closed" : "open"}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Number line"}
    >
      {body}
    </SceneShell>
  );
}
