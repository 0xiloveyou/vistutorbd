"use client";

import MathFormula from "@/components/MathFormula";
import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
} from "./SceneKit";

function chipsFrom(data) {
  const skip = new Set(["mode", "formula", "expression"]);
  return Object.entries(data)
    .filter(([key, value]) => !skip.has(key) && value != null)
    .slice(0, 4)
    .map(([key, value]) => ({
      key,
      value: Array.isArray(value)
        ? value.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(", ")
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value),
    }));
}

function BalanceSketch({ data }) {
  const left = data.left ?? data.equation?.split("=")?.[0]?.trim() ?? "LHS";
  const right = data.right ?? data.equation?.split("=")?.[1]?.trim() ?? "RHS";
  return (
    <svg viewBox="0 0 720 220" className="concept-inline-svg" aria-hidden="true">
      <line x1="60" y1="180" x2="660" y2="180" stroke="var(--border-strong)" strokeWidth="3" />
      <line x1="360" y1="40" x2="360" y2="180" stroke="var(--border-strong)" strokeWidth="3" />
      <circle cx="360" cy="40" r="8" fill={VIZ_COLORS.one} />
      <g transform="rotate(-5 360 40)">
        <line x1="130" y1="72" x2="590" y2="72" stroke={VIZ_COLORS.one} strokeWidth="4" />
        <line x1="130" y1="72" x2="130" y2="132" stroke="var(--text-soft)" strokeWidth="2" />
        <line x1="590" y1="72" x2="590" y2="132" stroke="var(--text-soft)" strokeWidth="2" />
        <rect x="66" y="132" width="128" height="44" rx="10" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="2" />
        <text x="130" y="160" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">
          {String(left)}
        </text>
        <rect x="526" y="132" width="128" height="44" rx="10" fill="var(--surface)" stroke={VIZ_COLORS.three} strokeWidth="2" />
        <text x="590" y="160" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">
          {String(right)}
        </text>
      </g>
    </svg>
  );
}

function TileSketch({ data }) {
  const a = Math.max(1, Math.min(6, Number(data.a ?? 3)));
  const b = Math.max(1, Math.min(6, Number(data.b ?? 2)));
  const unit = 46;
  const total = a + b;
  const originX = 760 / 2 - (total * unit) / 2;
  const originY = 40;

  const blocks = [
    { x: 0, y: 0, w: a, h: a, color: VIZ_COLORS.one, label: "a²" },
    { x: a, y: 0, w: b, h: a, color: VIZ_COLORS.two, label: "ab" },
    { x: 0, y: a, w: a, h: b, color: VIZ_COLORS.two, label: "ab" },
    { x: a, y: a, w: b, h: b, color: VIZ_COLORS.three, label: "b²" },
  ];

  return (
    <svg viewBox="0 0 760 340" className="concept-inline-svg" aria-hidden="true">
      <text x={380} y="24" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-muted)">
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
            strokeWidth="2.5"
          />
          <text
            x={originX + (block.x + block.w / 2) * unit}
            y={originY + (block.y + block.h / 2) * unit + 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="800"
            fill={block.color}
          >
            {block.label}
          </text>
        </g>
      ))}
      <text x={originX + (a * unit) / 2} y={originY + total * unit + 30} textAnchor="middle" fontSize="16" fill={VIZ_COLORS.one}>
        a = {a}
      </text>
      <text x={originX + (a * unit + total * unit) / 2} y={originY + total * unit + 30} textAnchor="middle" fontSize="16" fill={VIZ_COLORS.three}>
        b = {b}
      </text>
    </svg>
  );
}

function StepRail({ steps, currentIndex, lang }) {
  if (!steps.length) return null;

  return (
    <ol className="algebra-rail">
      {steps.map((item, index) => {
        const active = index === currentIndex;
        return (
          <li key={index} className={active ? "active" : index < currentIndex ? "done" : ""}>
            <span className="algebra-rail-index">{index + 1}</span>
            <div>
              <p>{item?.narration?.[lang] ?? item?.narration?.en ?? ""}</p>
              {item?.formula ? <MathFormula formula={item.formula} /> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function AlgebraScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const steps = spec?.steps ?? [];
  const currentIndex = Math.max(0, steps.indexOf(step));
  const mode = data.mode ?? "linear";
  const formula =
    step?.formula ??
    data.formula ??
    data.correct ??
    data.expression ??
    data.equation ??
    data.wrong;

  const showBalance = mode === "solve" || mode === "linear" || mode === "fractional" || mode === "balance";
  const showTiles = mode === "identity-area" || mode === "expand" || mode === "factorise" || mode === "tiles";
  const chips = chipsFrom(data);

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">
            {mode.replace(/[-_]/g, " ")}
          </span>
          {chips.map((chip) => (
            <span key={chip.key} className="concept-chip">
              <span>{chip.key}</span>
              <strong>{chip.value}</strong>
            </span>
          ))}
        </>
      }
      label={spec?.title?.[lang] ?? "Algebra steps"}
    >
      <div className="algebra-scene">
        <div className="algebra-main">
          <div className="algebra-formula">
            {formula ? (
              <MathFormula formula={formula} block />
            ) : (
              <p className="muted">{step?.narration?.[lang] ?? ""}</p>
            )}
          </div>
          {showTiles ? (
            <TileSketch data={data} />
          ) : showBalance ? (
            <BalanceSketch data={data} />
          ) : (
            <div className="algebra-symbol">
              <span>{data.value ?? data.result ?? data.sum ?? data.answer ?? "→"}</span>
            </div>
          )}
        </div>
        <StepRail steps={steps} currentIndex={currentIndex} lang={lang} />
      </div>
    </SceneShell>
  );
}
