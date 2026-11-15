"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const INK = "var(--text)";
const MUTED = "var(--text-muted)";

function ProbabilityTree({ data }) {
  const p = Number(data.p ?? 0.5);
  const root = { x: 120, y: 220 };
  const first = [
    { x: 330, y: 140, label: "H", p },
    { x: 330, y: 300, label: "T", p: 1 - p },
  ];
  const second = [
    { x: 560, y: 90, label: "HH", p: p * p },
    { x: 560, y: 190, label: "HT", p: p * (1 - p) },
    { x: 560, y: 270, label: "TH", p: (1 - p) * p },
    { x: 560, y: 360, label: "TT", p: (1 - p) * (1 - p) },
  ];

  const connections = [
    [root, first[0], p],
    [root, first[1], 1 - p],
    [first[0], second[0], p],
    [first[0], second[1], 1 - p],
    [first[1], second[2], p],
    [first[1], second[3], 1 - p],
  ];

  return (
    <SceneCanvas label="Probability tree">
      <text x="380" y="42" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Flip a coin twice
      </text>
      <circle cx={root.x} cy={root.y} r="8" fill={INK} />
      {connections.map(([from, to, probability], index) => (
        <g key={index}>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={VIZ_COLORS.one} strokeWidth="2.2" />
          <text
            x={(from.x + to.x) / 2}
            y={(from.y + to.y) / 2 - 8}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={VIZ_COLORS.two}
          >
            {fmt(probability, 2)}
          </text>
        </g>
      ))}
      {[...first, ...second].map((node) => (
        <g key={`${node.label}-${node.y}`}>
          <rect x={node.x - 30} y={node.y - 16} width="60" height="32" rx="10" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="2" />
          <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={INK}>
            {node.label}
          </text>
          {second.includes(node) ? (
            <text x={node.x + 40} y={node.y + 5} fontSize="12" fill={MUTED}>
              × = {fmt(node.p, 3)}
            </text>
          ) : null}
        </g>
      ))}
      <text x="380" y="398" textAnchor="middle" fontSize="14" fill={MUTED}>
        Multiply along a branch · add across branches
      </text>
    </SceneCanvas>
  );
}

function CountingTree({ data }) {
  const choices = Array.isArray(data.choices) ? data.choices.map(Number) : [3, 2];
  const [firstCount, secondCount = 2] = choices;
  const rows = Array.from({ length: firstCount }, (_, index) => index);
  const total = rows.reduce((sum) => sum + secondCount, 0);
  return (
    <SceneCanvas label="Counting tree">
      <text x="380" y="42" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        {firstCount} choices × {secondCount} choices = {total} routes
      </text>
      {rows.map((row) => {
        const y = 120 + row * (240 / Math.max(rows.length, 1));
        return (
          <g key={row}>
            <circle cx="140" cy={y} r="12" fill={VIZ_COLORS.one} />
            <text x="140" y={y + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
              {row + 1}
            </text>
            {Array.from({ length: secondCount }, (_, column) => (
              <g key={column}>
                <line x1="152" y1={y} x2="420" y2={y + (column - (secondCount - 1) / 2) * 34} stroke={VIZ_COLORS.one} strokeWidth="2" />
                <rect
                  x="420"
                  y={y + (column - (secondCount - 1) / 2) * 34 - 13}
                  width="112"
                  height="26"
                  rx="8"
                  fill="var(--surface)"
                  stroke={VIZ_COLORS.three}
                  strokeWidth="2"
                />
                <text x="476" y={y + (column - (secondCount - 1) / 2) * 34 + 4} textAnchor="middle" fontSize="12" fill={INK}>
                  route {row + 1}.{column + 1}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </SceneCanvas>
  );
}

function PermutationSlots({ data }) {
  const n = Number(data.n ?? 5);
  const r = Number(data.r ?? 3);
  const slots = Array.from({ length: r }, (_, index) => n - index);
  const value = slots.reduce((product, factor) => product * factor, 1);
  return (
    <SceneCanvas label="Permutation slots">
      <text x="380" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        Fill {r} slots from {n} options
      </text>
      {slots.map((option, index) => {
        const x = 200 + index * 150;
        return (
          <g key={index}>
            <rect x={x - 42} y="130" width="84" height="82" rx="14" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
            <text x={x} y="182" textAnchor="middle" fontSize="28" fontWeight="800" fill={VIZ_COLORS.one}>
              {option}
            </text>
            <text x={x} y="240" textAnchor="middle" fontSize="12" fill={MUTED}>
              slot {index + 1}
            </text>
          </g>
        );
      })}
      <text x="380" y="306" textAnchor="middle" fontSize="18" fontWeight="800" fill={VIZ_COLORS.two}>
        {slots.join(" × ")} = {value}
      </text>
      <text x="380" y="344" textAnchor="middle" fontSize="15" fill={MUTED}>
        Order matters, so this is a permutation
      </text>
    </SceneCanvas>
  );
}

function SampleSpace({ data }) {
  const coins = Number(data.coins ?? 2);
  const outcomes = [];
  const total = Math.pow(2, coins);
  for (let index = 0; index < total; index += 1) {
    let word = "";
    for (let bit = coins - 1; bit >= 0; bit -= 1) {
      word += index & (1 << bit) ? "H" : "T";
    }
    outcomes.push(word);
  }
  return (
    <SceneCanvas label="Sample space">
      <text x="380" y="46" textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
        {coins} coins → {total} equally likely outcomes
      </text>
      {outcomes.map((outcome, index) => {
        const columns = 4;
        const x = 140 + (index % columns) * 140;
        const y = 110 + Math.floor(index / columns) * 74;
        return (
          <g key={outcome}>
            <rect x={x} y={y} width="104" height="48" rx="12" fill={VIZ_COLORS.one} fillOpacity="0.1" stroke={VIZ_COLORS.one} strokeWidth="2" />
            <text x={x + 52} y={y + 31} textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
              {outcome}
            </text>
          </g>
        );
      })}
    </SceneCanvas>
  );
}

function ConditionalTree({ data }) {
  const pA = Number(data.pA ?? 0.5);
  const pB = Number(data.pBgivenA ?? 0.4);
  return (
    <SceneCanvas label="Conditional probability">
      <circle cx="130" cy="220" r="10" fill={INK} />
      <line x1="140" y1="220" x2="330" y2="140" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <line x1="140" y1="220" x2="330" y2="300" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <rect x="330" y="124" width="120" height="34" rx="10" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="2" />
      <text x="390" y="146" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>A ({fmt(pA, 2)})</text>
      <rect x="330" y="284" width="120" height="34" rx="10" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="2" />
      <text x="390" y="306" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK}>A′ ({fmt(1 - pA, 2)})</text>
      <line x1="450" y1="141" x2="590" y2="104" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <line x1="450" y1="141" x2="590" y2="180" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="590" y="100" fontSize="13" fontWeight="700" fill={VIZ_COLORS.three}>B | A = {fmt(pB, 2)}</text>
      <text x="590" y="184" fontSize="13" fontWeight="700" fill={VIZ_COLORS.three}>B′ | A</text>
      <text x="380" y="392" textAnchor="middle" fontSize="15" fill={MUTED}>
        P(A ∩ B) = P(A) × P(B | A) = {fmt(pA * pB, 3)}
      </text>
    </SceneCanvas>
  );
}

function combination(n, r) {
  if (r < 0 || r > n) return 0;
  let value = 1;
  for (let index = 1; index <= r; index += 1) {
    value = (value * (n - index + 1)) / index;
  }
  return value;
}

function factorial(n) {
  let value = 1;
  for (let index = 2; index <= n; index += 1) value *= index;
  return value;
}

function BayesScene({ data }) {
  const prevalence = Number(data.prevalence ?? 0.01);
  const sensitivity = Number(data.sensitivity ?? 0.9);
  const falsePositive = Number(data.falsePositive ?? 0.05);
  const posterior =
    (prevalence * sensitivity) /
    (prevalence * sensitivity + (1 - prevalence) * falsePositive);
  return (
    <SceneCanvas label="Bayes theorem">
      <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        Test positive — what is the chance of disease?
      </text>
      <rect x="90" y="96" width="260" height="92" rx="14" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <text x="220" y="132" textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.one}>
        have disease · {fmt(prevalence, 3)}
      </text>
      <text x="220" y="160" textAnchor="middle" fontSize="12" fill={MUTED}>
        test positive · {fmt(sensitivity, 2)}
      </text>
      <rect x="90" y="228" width="260" height="92" rx="14" fill={VIZ_COLORS.three} fillOpacity="0.12" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="220" y="264" textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.three}>
        healthy · {fmt(1 - prevalence, 3)}
      </text>
      <text x="220" y="292" textAnchor="middle" fontSize="12" fill={MUTED}>
        false positive · {fmt(falsePositive, 2)}
      </text>
      <line x1="350" y1="142" x2="520" y2="112" stroke={VIZ_COLORS.one} strokeWidth="2.4" />
      <line x1="350" y1="274" x2="520" y2="300" stroke={VIZ_COLORS.three} strokeWidth="2.4" />
      <rect x="520" y="92" width="170" height="62" rx="12" fill={VIZ_COLORS.two} fillOpacity="0.14" stroke={VIZ_COLORS.two} strokeWidth="2.5" />
      <text x="605" y="118" textAnchor="middle" fontSize="13" fontWeight="800" fill={VIZ_COLORS.two}>
        true positive
      </text>
      <text x="605" y="140" textAnchor="middle" fontSize="13" fill={INK}>
        {fmt(prevalence * sensitivity, 4)}
      </text>
      <rect x="520" y="260" width="170" height="62" rx="12" fill={VIZ_COLORS.five} fillOpacity="0.14" stroke={VIZ_COLORS.five} strokeWidth="2.5" />
      <text x="605" y="286" textAnchor="middle" fontSize="13" fontWeight="800" fill={VIZ_COLORS.five}>
        false positive
      </text>
      <text x="605" y="308" textAnchor="middle" fontSize="13" fill={INK}>
        {fmt((1 - prevalence) * falsePositive, 4)}
      </text>
      <text x="380" y="372" textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.two}>
        P(disease | positive) = {fmt(posterior * 100, 1)}%
      </text>
    </SceneCanvas>
  );
}

function CombVsPerm({ data }) {
  const n = Number(data.n ?? 4);
  const r = Number(data.r ?? 2);
  const permutations = combination(n, r) * factorial(r);
  return (
    <SceneCanvas label="Combination vs permutation">
      <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        Choose {r} from {n}
      </text>
      <rect x="90" y="100" width="270" height="160" rx="16" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <text x="225" y="136" textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.one}>
        combination
      </text>
      <text x="225" y="176" textAnchor="middle" fontSize="26" fontWeight="800" fill={INK}>
        {combination(n, r)}
      </text>
      <text x="225" y="212" textAnchor="middle" fontSize="13" fill={MUTED}>
        order does not matter
      </text>
      <rect x="400" y="100" width="270" height="160" rx="16" fill={VIZ_COLORS.three} fillOpacity="0.12" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="535" y="136" textAnchor="middle" fontSize="15" fontWeight="800" fill={VIZ_COLORS.three}>
        permutation
      </text>
      <text x="535" y="176" textAnchor="middle" fontSize="26" fontWeight="800" fill={INK}>
        {permutations}
      </text>
      <text x="535" y="212" textAnchor="middle" fontSize="13" fill={MUTED}>
        order matters
      </text>
      <text x="380" y="318" textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.two}>
        {permutations} ÷ {r}! = {combination(n, r)}
      </text>
      <text x="380" y="364" textAnchor="middle" fontSize="14" fill={MUTED}>
        Every unordered choice has {r}! arrangements
      </text>
    </SceneCanvas>
  );
}

function TogetherScene({ data }) {
  const n = Number(data.n ?? 5);
  const blocks = ["(A B)", ...Array.from({ length: Math.max(0, n - 2) }, (_, index) => `P${index + 3}`)];
  return (
    <SceneCanvas label="Together restriction">
      <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        Keep A and B together
      </text>
      {blocks.map((block, index) => {
        const x = 130 + index * (520 / Math.max(1, blocks.length));
        const width = 520 / Math.max(1, blocks.length) - 14;
        return (
          <g key={index}>
            <rect
              x={x}
              y="150"
              width={width}
              height="74"
              rx="14"
              fill={index === 0 ? VIZ_COLORS.two : VIZ_COLORS.one}
              fillOpacity={index === 0 ? 0.3 : 0.12}
              stroke={index === 0 ? VIZ_COLORS.two : VIZ_COLORS.one}
              strokeWidth="2.5"
            />
            <text x={x + width / 2} y="194" textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>
              {block}
            </text>
          </g>
        );
      })}
      <text x="380" y="300" textAnchor="middle" fontSize="17" fontWeight="800" fill={VIZ_COLORS.two}>
        treat the pair as one block → {n - 1} objects
      </text>
      <text x="380" y="344" textAnchor="middle" fontSize="15" fill={MUTED}>
        {n - 1}! × 2! = {factorial(n - 1) * 2} arrangements
      </text>
    </SceneCanvas>
  );
}

function DerangementScene({ data }) {
  const n = Number(data.n ?? 4);
  const derangements = [1, 0, 1, 2, 9, 44, 265, 1854, 14833, 133496];
  const value = derangements[n] ?? 0;
  return (
    <SceneCanvas label="Derangements">
      <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        No letter in its own envelope
      </text>
      {Array.from({ length: n }, (_, index) => {
        const x = 150 + index * (460 / Math.max(1, n));
        return (
          <g key={index}>
            <rect x={x} y="130" width={460 / Math.max(1, n) - 16} height="64" rx="12" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.2" />
            <text x={x + (460 / Math.max(1, n) - 16) / 2} y="170" textAnchor="middle" fontSize="16" fontWeight="800" fill={INK}>
              {String.fromCharCode(65 + index)}
            </text>
            <text x={x + (460 / Math.max(1, n) - 16) / 2} y="226" textAnchor="middle" fontSize="12" fill={MUTED}>
              ↛ {index + 1}
            </text>
          </g>
        );
      })}
      <text x="380" y="306" textAnchor="middle" fontSize="20" fontWeight="800" fill={VIZ_COLORS.two}>
        !{n} = {value}
      </text>
      <text x="380" y="348" textAnchor="middle" fontSize="14" fill={MUTED}>
        !n = n! × (1 − 1/1! + 1/2! − … + (−1)ⁿ/n!)
      </text>
    </SceneCanvas>
  );
}

function StarsBars({ data }) {
  const balls = Number(data.balls ?? 5);
  const boxes = Number(data.boxes ?? 3);
  const total = combination(balls + boxes - 1, boxes - 1);
  return (
    <SceneCanvas label="Stars and bars">
      <text x="380" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>
        Put {balls} identical balls into {boxes} boxes
      </text>
      {Array.from({ length: boxes }, (_, box) => {
        const x = 140 + box * (480 / boxes);
        const width = 480 / boxes - 20;
        return (
          <g key={box}>
            <rect x={x} y="140" width={width} height="100" rx="14" fill={VIZ_COLORS.one} fillOpacity="0.08" stroke={VIZ_COLORS.one} strokeWidth="2.2" />
            <text x={x + width / 2} y="268" textAnchor="middle" fontSize="12" fill={MUTED}>
              box {box + 1}
            </text>
          </g>
        );
      })}
      <text x="380" y="196" textAnchor="middle" fontSize="24" fill={VIZ_COLORS.two}>
        {"★".repeat(balls)} {"|".repeat(Math.max(0, boxes - 1))}
      </text>
      <text x="380" y="326" textAnchor="middle" fontSize="16" fontWeight="800" fill={VIZ_COLORS.two}>
        C({balls} + {boxes} − 1, {boxes} − 1) = {total}
      </text>
      <text x="380" y="364" textAnchor="middle" fontSize="14" fill={MUTED}>
        Choose where to put the {boxes - 1} dividers
      </text>
    </SceneCanvas>
  );
}

export default function TreeScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "probability-tree";

  let body;
  if (mode === "conditional") body = <ConditionalTree data={data} />;
  else if (mode === "bayes") body = <BayesScene data={data} />;
  else if (mode === "counting-tree" || mode === "combination-tree") body = <CountingTree data={data} />;
  else if (mode === "permutation-slots") body = <PermutationSlots data={data} />;
  else if (mode === "sample-space") body = <SampleSpace data={data} />;
  else if (mode === "comb-vs-perm") body = <CombVsPerm data={data} />;
  else if (mode === "together") body = <TogetherScene data={data} />;
  else if (mode === "derangement") body = <DerangementScene data={data} />;
  else if (mode === "stars-bars") body = <StarsBars data={data} />;
  else body = <ProbabilityTree data={data} />;

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
          {data.routes != null ? (
            <span className="concept-chip">
              <span>routes</span>
              <strong>{data.routes}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Tree diagram"}
    >
      {body}
    </SceneShell>
  );
}
