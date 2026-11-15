"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function IdentityArea({ data }) {
  const a = Math.max(1, Math.min(7, Number(data.a ?? 5)));
  const b = Math.max(1, Math.min(7, Number(data.b ?? 3)));
  const unit = Math.min(44, 420 / (a + b));
  const total = a + b;
  const originX = 380 - (total * unit) / 2;
  const originY = 70;

  const blocks = [
    { x: 0, y: 0, w: a, h: a, color: VIZ_COLORS.one, label: `a² = ${a * a}` },
    { x: a, y: 0, w: b, h: a, color: VIZ_COLORS.two, label: `ab = ${a * b}` },
    { x: 0, y: a, w: a, h: b, color: VIZ_COLORS.two, label: `ab = ${a * b}` },
    { x: a, y: a, w: b, h: b, color: VIZ_COLORS.three, label: `b² = ${b * b}` },
  ];

  return (
    <SceneCanvas label="Identity area model">
      <text x="380" y="36" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        (a + b)² = a² + 2ab + b²
      </text>
      {blocks.map((block, index) => (
        <g key={index}>
          <rect
            x={originX + block.x * unit}
            y={originY + block.y * unit}
            width={block.w * unit}
            height={block.h * unit}
            fill={block.color}
            fillOpacity="0.22"
            stroke={block.color}
            strokeWidth="2.4"
          />
          <text
            x={originX + (block.x + block.w / 2) * unit}
            y={originY + (block.y + block.h / 2) * unit + 5}
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill={block.color}
          >
            {block.label}
          </text>
        </g>
      ))}
      <text x={originX + (a * unit) / 2} y={originY + total * unit + 30} textAnchor="middle" fontSize="14" fontWeight="700" fill={VIZ_COLORS.one}>
        a = {a}
      </text>
      <text x={originX + (a + b / 2) * unit} y={originY + total * unit + 30} textAnchor="middle" fontSize="14" fontWeight="700" fill={VIZ_COLORS.three}>
        b = {b}
      </text>
      <text x="380" y="396" textAnchor="middle" fontSize="15" fill={MUTED}>
        {a * a} + {a * b} + {a * b} + {b * b} = {(a + b) ** 2} = {a + b}²
      </text>
    </SceneCanvas>
  );
}

function ExponentBlocks({ data }) {
  const base = Number(data.base ?? 2);
  const m = Math.max(1, Math.min(6, Number(data.m ?? 3)));
  const n = Math.max(1, Math.min(6, Number(data.n ?? 2)));
  const blocks = [
    ...Array.from({ length: m }, () => ({ color: VIZ_COLORS.one, label: base })),
    ...Array.from({ length: n }, () => ({ color: VIZ_COLORS.three, label: base })),
  ];
  const size = 58;
  const gap = 12;
  const totalWidth = blocks.length * (size + gap) - gap;
  const startX = 380 - totalWidth / 2;

  return (
    <SceneCanvas label="Exponent blocks">
      <text x="380" y="44" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        aᵐ × aⁿ = aᵐ⁺ⁿ
      </text>
      {blocks.map((block, index) => {
        const x = startX + index * (size + gap);
        return (
          <g key={index}>
            <rect
              x={x}
              y={150}
              width={size}
              height={size}
              rx="12"
              fill={block.color}
              fillOpacity="0.22"
              stroke={block.color}
              strokeWidth="2.4"
            />
            <text x={x + size / 2} y={184} textAnchor="middle" fontSize="22" fontWeight="800" fill={block.color}>
              {block.label}
            </text>
            <text x={x + size / 2} y="236" textAnchor="middle" fontSize="11" fill={MUTED}>
              {index < m ? `group ${index + 1}` : `× group ${index - m + 1}`}
            </text>
          </g>
        );
      })}
      <text x="380" y="300" textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.two}>
        {m} + {n} = {m + n} copies of {base}
      </text>
      <text x="380" y="336" textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>
        {base}
        <tspan baselineShift="super" fontSize="13">{m}</tspan>
        <tspan fontSize="18"> × </tspan>
        {base}
        <tspan baselineShift="super" fontSize="13">{n}</tspan>
        <tspan fontSize="18"> = </tspan>
        {base}
        <tspan baselineShift="super" fontSize="13">{m + n}</tspan>
        <tspan fontSize="18"> = {Math.pow(base, m + n)}</tspan>
      </text>
      <text x="380" y="382" textAnchor="middle" fontSize="14" fill={MUTED}>
        Multiply powers of the same base → add the exponents
      </text>
    </SceneCanvas>
  );
}

function CompleteSquare({ data }) {
  const a = Math.max(1, Math.min(6, Number(data.a ?? 4)));
  const b = Math.max(2, Math.min(10, Number(data.b ?? 6)));
  const half = b / 2;
  const unit = Math.min(46, 400 / (a + half + 1));
  const originX = 380 - ((a + half) * unit) / 2;
  const originY = 80;

  return (
    <SceneCanvas label="Completing the square">
      <text x="380" y="40" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        x² + {b}x + {half * half} = (x + {half})²
      </text>
      <rect
        x={originX}
        y={originY}
        width={a * unit}
        height={a * unit}
        fill={VIZ_COLORS.one}
        fillOpacity="0.22"
        stroke={VIZ_COLORS.one}
        strokeWidth="2.4"
      />
      <text x={originX + (a * unit) / 2} y={originY + (a * unit) / 2 + 6} textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.one}>
        x²
      </text>
      <rect
        x={originX + a * unit}
        y={originY}
        width={half * unit}
        height={a * unit}
        fill={VIZ_COLORS.two}
        fillOpacity="0.2"
        stroke={VIZ_COLORS.two}
        strokeWidth="2.4"
      />
      <text x={originX + a * unit + (half * unit) / 2} y={originY + (a * unit) / 2 + 6} textAnchor="middle" fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>
        {half}x
      </text>
      <rect
        x={originX}
        y={originY + a * unit}
        width={a * unit}
        height={half * unit}
        fill={VIZ_COLORS.two}
        fillOpacity="0.2"
        stroke={VIZ_COLORS.two}
        strokeWidth="2.4"
      />
      <text x={originX + (a * unit) / 2} y={originY + a * unit + (half * unit) / 2 + 6} textAnchor="middle" fontSize="14" fontWeight="800" fill={VIZ_COLORS.two}>
        {half}x
      </text>
      <rect
        x={originX + a * unit}
        y={originY + a * unit}
        width={half * unit}
        height={half * unit}
        fill={VIZ_COLORS.three}
        fillOpacity="0.3"
        stroke={VIZ_COLORS.three}
        strokeWidth="2.4"
      />
      <text x={originX + a * unit + (half * unit) / 2} y={originY + a * unit + (half * unit) / 2 + 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={VIZ_COLORS.three}>
        {half * half}
      </text>
      <text x="380" y={originY + (a + half) * unit + 46} textAnchor="middle" fontSize="16" fontWeight="700" fill={VIZ_COLORS.three}>
        add {half * half} to complete the square
      </text>
    </SceneCanvas>
  );
}

function GaussPairs({ data }) {
  const n = Math.max(2, Math.min(12, Number(data.n ?? 10)));
  const rows = Array.from({ length: n }, (_, index) => index + 1);
  const columns = 8;
  const cell = 40;
  const startX = 380 - (columns * cell) / 2;
  const startY = 60;
  const pairs = Math.floor(n / 2);

  return (
    <SceneCanvas label="Gauss pairing">
      <text x="380" y="38" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Pair 1 with {n}, 2 with {n - 1}, …
      </text>
      {rows.map((value, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const x = startX + column * cell;
        const y = startY + row * cell;
        const paired = index < pairs || index >= n - pairs;
        return (
          <g key={value}>
            <rect
              x={x}
              y={y}
              width={cell - 6}
              height={cell - 6}
              rx="8"
              fill={paired ? VIZ_COLORS.two : VIZ_COLORS.one}
              fillOpacity={paired ? 0.28 : 0.1}
              stroke={paired ? VIZ_COLORS.two : VIZ_COLORS.one}
              strokeWidth="1.6"
            />
            <text x={x + (cell - 6) / 2} y={y + 23} textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>
              {value}
            </text>
          </g>
        );
      })}
      <text x="380" y="326" textAnchor="middle" fontSize="16" fontWeight="800" fill={VIZ_COLORS.two}>
        {pairs} pairs × ({1} + {n}) = {pairs * (n + 1)}
      </text>
      <text x="380" y="364" textAnchor="middle" fontSize="15" fill={MUTED}>
        Sum 1 + 2 + … + {n} = {data.sum ?? (n * (n + 1)) / 2}
      </text>
      <text x="380" y="398" textAnchor="middle" fontSize="14" fill={MUTED}>
        This works because the sum is symmetric
      </text>
    </SceneCanvas>
  );
}

export default function ArrayScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "identity-area";

  let body;
  if (mode === "exponent-product" || mode === "exponent-quotient" || mode === "power-power") {
    body = <ExponentBlocks data={data} />;
  } else if (mode === "complete-square") {
    body = <CompleteSquare data={data} />;
  } else if (mode === "gauss" || mode === "pairing") {
    body = <GaussPairs data={data} />;
  } else {
    body = <IdentityArea data={data} />;
  }

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.total != null ? (
            <span className="concept-chip">
              <span>total</span>
              <strong>{data.total}</strong>
            </span>
          ) : null}
          {data.result != null ? (
            <span className="concept-chip">
              <span>result</span>
              <strong>{String(data.result)}</strong>
            </span>
          ) : null}
          {data.result != null && Number.isFinite(Number(data.result)) ? (
            <span className="concept-chip">
              <span>value</span>
              <strong>{fmt(Number(data.result), 2)}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Array grid"}
    >
      {body}
    </SceneShell>
  );
}
