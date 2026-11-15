"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";
import { curvePath } from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function combination(n, k) {
  let value = 1;
  for (let index = 1; index <= k; index += 1) {
    value = (value * (n - index + 1)) / index;
  }
  return value;
}

function DiceCoins() {
  const flips = Array.from({ length: 100 }, (_, index) => (index * 37) % 100 < 52);
  const heads = flips.filter(Boolean).length;
  return (
    <SceneCanvas label="Dice and coins simulator">
      <text x="380" y="42" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        100 simulated coin flips
      </text>
      {flips.map((head, index) => {
        const columns = 20;
        const x = 82 + (index % columns) * 30;
        const y = 74 + Math.floor(index / columns) * 30;
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width="24"
              height="24"
              rx="7"
              fill={head ? VIZ_COLORS.two : VIZ_COLORS.six}
              fillOpacity="0.28"
              stroke={head ? VIZ_COLORS.two : VIZ_COLORS.six}
              strokeWidth="1.4"
            />
            <text x={x + 12} y={y + 17} textAnchor="middle" fontSize="10" fontWeight="800" fill={INK}>
              {head ? "H" : "T"}
            </text>
          </g>
        );
      })}
      <text x="380" y="340" textAnchor="middle" fontSize="16" fontWeight="700" fill={VIZ_COLORS.two}>
        observed heads = {heads}/100 = {fmt(heads / 100, 2)}
      </text>
      <text x="380" y="374" textAnchor="middle" fontSize="14" fill={MUTED}>
        theoretical P(head) = 0.50 · more trials → closer to 0.50
      </text>
    </SceneCanvas>
  );
}

function Binomial({ data }) {
  const n = Math.max(1, Math.min(24, Number(data.n ?? 10)));
  const p = Math.max(0.05, Math.min(0.95, Number(data.p ?? 0.5)));
  const values = Array.from({ length: n + 1 }, (_, k) =>
    combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k),
  );
  const max = Math.max(...values, 0.001);
  const gap = 620 / (n + 1);
  const baseY = 330;
  return (
    <SceneCanvas label="Binomial distribution">
      <text x="380" y="42" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        B(n = {n}, p = {p}) · mean = {fmt(n * p, 2)}
      </text>
      <line x1="80" y1={baseY} x2="680" y2={baseY} stroke="var(--border-strong)" strokeWidth="2" />
      {values.map((value, k) => {
        const height = (value / max) * 220;
        const x = 80 + k * gap + gap * 0.16;
        const barWidth = gap * 0.68;
        const isMean = Math.abs(k - n * p) < 0.5;
        return (
          <g key={k}>
            <rect
              x={x}
              y={baseY - height}
              width={barWidth}
              height={Math.max(2, height)}
              rx="4"
              fill={isMean ? VIZ_COLORS.two : VIZ_COLORS.one}
              fillOpacity={isMean ? 0.95 : 0.7}
            />
            <text x={x + barWidth / 2} y={baseY - height - 6} textAnchor="middle" fontSize="9" fill={MUTED}>
              {value >= 0.001 ? fmt(value, 2) : ""}
            </text>
            {k % Math.ceil((n + 1) / 12) === 0 ? (
              <text x={x + barWidth / 2} y={baseY + 18} textAnchor="middle" fontSize="11" fill={MUTED}>
                {k}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x="380" y="386" textAnchor="middle" fontSize="14" fill={MUTED}>
        P(X = k) = C({n},k) · {p}^k · {fmt(1 - p, 2)}^{n}−k
      </text>
    </SceneCanvas>
  );
}

function Birthday({ data }) {
  const people = Number(data.people ?? 23);
  const probability = (count) => {
    let value = 1;
    for (let index = 0; index < count; index += 1) {
      value *= (365 - index) / 365;
    }
    return 1 - value;
  };
  const sx = (count) => 90 + (count / 60) * 580;
  const sy = (value) => 340 - value * 250;
  const curve = (count) => probability(Math.max(0, Math.round(count)));
  return (
    <SceneCanvas label="Birthday problem">
      <line x1="80" y1="340" x2="690" y2="340" stroke="var(--border-strong)" strokeWidth="2" />
      <line x1="90" y1="70" x2="90" y2="350" stroke="var(--border-strong)" strokeWidth="2" />
      <path d={curvePath(curve, 0, 60, sx, sy, 120)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3.5" />
      <line x1={sx(people)} y1="90" x2={sx(people)} y2="340" stroke={VIZ_COLORS.two} strokeDasharray="6 5" />
      <circle cx={sx(people)} cy={sy(probability(people))} r="7" fill={VIZ_COLORS.two} />
      <text x={sx(people) + 10} y={sy(probability(people)) - 10} fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>
        {people} people → {fmt(probability(people) * 100, 1)}%
      </text>
      <text x="380" y="42" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        P(at least one shared birthday)
      </text>
      <text x="380" y="386" textAnchor="middle" fontSize="14" fill={MUTED}>
        With 23 people the chance is already about 50.7%
      </text>
    </SceneCanvas>
  );
}

function Gambler({ data }) {
  const probability = Number(data.probability ?? 0.5);
  const flips = Number(data.flips ?? 10);
  const sequence = Array.from({ length: Math.min(flips, 8) }, (_, index) => index < 5);
  return (
    <SceneCanvas label="Gambler's fallacy">
      <text x="380" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        The coin has no memory
      </text>
      {sequence.map((head, index) => (
        <g key={index}>
          <circle cx={170 + index * 62} cy="160" r="24" fill={head ? VIZ_COLORS.two : VIZ_COLORS.six} fillOpacity="0.28" stroke={head ? VIZ_COLORS.two : VIZ_COLORS.six} strokeWidth="2.4" />
          <text x={170 + index * 62} y="167" textAnchor="middle" fontSize="14" fontWeight="800" fill={INK}>
            {head ? "H" : "T"}
          </text>
        </g>
      ))}
      <text x="380" y="230" textAnchor="middle" fontSize="15" fill={MUTED}>
        five heads in a row…
      </text>
      <rect x="250" y="260" width="260" height="80" rx="18" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <text x="380" y="292" textAnchor="middle" fontSize="16" fontWeight="800" fill={VIZ_COLORS.one}>
        next toss: H 50% · T 50%
      </text>
      <text x="380" y="318" textAnchor="middle" fontSize="13" fill={MUTED}>
        still P(head) = {fmt(probability, 2)}
      </text>
      <text x="380" y="386" textAnchor="middle" fontSize="14" fill={MUTED}>
        Independent tosses do not "balance out" in the short run
      </text>
    </SceneCanvas>
  );
}

export default function ProbabilityScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "dice-coins";

  let body;
  if (mode === "binomial") body = <Binomial data={data} />;
  else if (mode === "birthday") body = <Birthday data={data} />;
  else if (mode === "gambler") body = <Gambler data={data} />;
  else body = <DiceCoins />;

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.probability != null ? (
            <span className="concept-chip">
              <span>probability</span>
              <strong>{fmt(Number(data.probability), 3)}</strong>
            </span>
          ) : null}
          {data.trials ? (
            <span className="concept-chip">
              <span>trials</span>
              <strong>{data.trials}</strong>
            </span>
          ) : null}
          <span className="concept-chip">
            <span>module</span>
            <strong>experiment → theory</strong>
          </span>
        </>
      }
      label={spec?.title?.[lang] ?? "Probability"}
    >
      {body}
    </SceneShell>
  );
}
