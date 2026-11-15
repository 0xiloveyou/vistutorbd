"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
  fmt,
} from "./SceneKit";

const NESTED = [
  { label: "N", title: "Natural", color: VIZ_COLORS.one },
  { label: "W", title: "Whole", color: VIZ_COLORS.six },
  { label: "Z", title: "Integers", color: VIZ_COLORS.three },
  { label: "Q", title: "Rational", color: VIZ_COLORS.two },
  { label: "R", title: "Real", color: VIZ_COLORS.five },
];

function NumberSystemScene({ data }) {
  const examples = data.examples ?? [0, -3, "1/2", "√2"];
  const nested = NESTED.slice(0, Math.max(3, Math.min(5, (data.sets ?? NESTED).length)));
  const baseX = 380;
  const baseY = 230;

  return (
    <SceneCanvas label="The number system">
      <text x={380} y={38} textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)">
        Each set fits inside the next
      </text>
      {nested.map((set, index) => {
        const inset = 42 + index * 34;
        return (
          <g key={set.label}>
            <ellipse
              cx={baseX}
              cy={baseY}
              rx={300 - inset}
              ry={172 - inset * 0.62}
              fill={set.color}
              fillOpacity={0.05 + index * 0.015}
              stroke={set.color}
              strokeWidth="2.4"
            />
            <text
              x={baseX - (300 - inset) + 14}
              y={baseY - (172 - inset * 0.62) + 22}
              fontSize="17"
              fontWeight="800"
              fill={set.color}
            >
              {set.label}
            </text>
            <text
              x={baseX - (300 - inset) + 36}
              y={baseY - (172 - inset * 0.62) + 22}
              fontSize="12"
              fill="var(--text-soft)"
            >
              {set.title}
            </text>
          </g>
        );
      })}
      <g>
        <circle cx={378} cy={234} r="6" fill={VIZ_COLORS.one} />
        <text x={392} y={238} fontSize="14" fill="var(--text-muted)">
          {String(examples[0] ?? 0)} · natural
        </text>
        <circle cx={250} cy={250} r="6" fill={VIZ_COLORS.three} />
        <text x={264} y={254} fontSize="14" fill="var(--text-muted)">
          {String(examples[1] ?? -3)} · integer
        </text>
        <circle cx={510} cy={250} r="6" fill={VIZ_COLORS.two} />
        <text x={524} y={254} fontSize="14" fill="var(--text-muted)">
          {String(examples[2] ?? "1/2")} · rational
        </text>
        <circle cx={600} cy={180} r="6" fill={VIZ_COLORS.five} />
        <text x={614} y={184} fontSize="14" fill="var(--text-muted)">
          {String(examples[3] ?? "√2")} · real, not rational
        </text>
      </g>
      <text x={380} y={398} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-muted)">
        N ⊂ W ⊂ Z ⊂ Q ⊂ R
      </text>
    </SceneCanvas>
  );
}

function mappingPoints(values, cx, cy, radius) {
  return values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(values.length, 1) - Math.PI / 2;
    return {
      value,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.9,
    };
  });
}

function MappingScene({ data }) {
  const domain = data.domain ?? data.a ?? [1, 2, 3];
  const range = data.range ?? data.b ?? [2, 4, 6];
  const left = mappingPoints(domain, 215, 225, 110);
  const right = mappingPoints(range, 545, 225, 110);
  const arrows = data.pairs ?? left.map((point, index) => [point.value, range[index % right.length]]);

  return (
    <SceneCanvas label="Mapping diagram">
      <ellipse cx="215" cy="225" rx="150" ry="135" fill={VIZ_COLORS.one} fillOpacity="0.08" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
      <ellipse cx="545" cy="225" rx="150" ry="135" fill={VIZ_COLORS.three} fillOpacity="0.08" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
      <text x="215" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill={VIZ_COLORS.one}>
        Domain
      </text>
      <text x="545" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill={VIZ_COLORS.three}>
        Range
      </text>

      {left.map((point) => (
        <g key={`d-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="21" fill="var(--surface)" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
          <text x={point.x} y={point.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">
            {String(point.value)}
          </text>
        </g>
      ))}
      {right.map((point) => (
        <g key={`r-${point.value}`}>
          <circle cx={point.x} cy={point.y} r="21" fill="var(--surface)" stroke={VIZ_COLORS.three} strokeWidth="2.5" />
          <text x={point.x} y={point.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">
            {String(point.value)}
          </text>
        </g>
      ))}

      {arrows.map(([from, to], index) => {
        const start = left.find((point) => String(point.value) === String(from)) ?? left[index];
        const end = right.find((point) => String(point.value) === String(to)) ?? right[index];
        if (!start || !end) return null;
        return (
          <g key={`arrow-${index}`}>
            <line x1={start.x + 22} y1={start.y} x2={end.x - 22} y2={end.y} stroke={VIZ_COLORS.two} strokeWidth="2.5" />
            <circle cx={end.x - 22} cy={end.y} r="4" fill={VIZ_COLORS.two} />
          </g>
        );
      })}
    </SceneCanvas>
  );
}

function TwoSetVenn({ data }) {
  const a = data.a ?? [1, 2, 3];
  const b = data.b ?? [3, 4, 5];
  const common = a.filter((item) => b.includes(item));
  const onlyA = a.filter((item) => !b.includes(item));
  const onlyB = b.filter((item) => !a.includes(item));
  const showUnion = data.union;
  const showIntersection = data.intersection;
  const highlightAll = Boolean(showUnion);
  const highlightCommon = Boolean(showIntersection);

  return (
    <SceneCanvas label="Venn diagram">
      <circle
        cx="300"
        cy="225"
        r="140"
        fill={VIZ_COLORS.one}
        fillOpacity={highlightAll ? 0.22 : 0.1}
        stroke={VIZ_COLORS.one}
        strokeWidth="3"
      />
      <circle
        cx="460"
        cy="225"
        r="140"
        fill={VIZ_COLORS.three}
        fillOpacity={highlightAll ? 0.22 : 0.1}
        stroke={VIZ_COLORS.three}
        strokeWidth="3"
      />
      <text x="228" y="88" fontSize="18" fontWeight="800" fill={VIZ_COLORS.one}>
        A
      </text>
      <text x="508" y="88" fontSize="18" fontWeight="800" fill={VIZ_COLORS.three}>
        B
      </text>

      <g fontSize="16" fontWeight="700" fill="var(--text)">
        {onlyA.map((item, index) => (
          <text key={`a-${item}`} x={262 + (index % 2) * 30} y={200 + Math.floor(index / 2) * 34} textAnchor="middle">
            {String(item)}
          </text>
        ))}
        {onlyB.map((item, index) => (
          <text key={`b-${item}`} x={508 + (index % 2) * 26} y={200 + Math.floor(index / 2) * 34} textAnchor="middle">
            {String(item)}
          </text>
        ))}
        {common.map((item, index) => (
          <text
            key={`c-${item}`}
            x={380}
            y={210 + index * 30}
            textAnchor="middle"
            fill={highlightCommon ? "var(--text)" : "var(--text-muted)"}
          >
            {String(item)}
          </text>
        ))}
      </g>

      <text x="380" y="392" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text-muted)">
        {highlightAll
          ? "A ∪ B = everything in either circle"
          : highlightCommon
            ? `A ∩ B = {${common.join(", ")}}`
            : `A = {${a.join(", ")}} · B = {${b.join(", ")}}`}
      </text>
    </SceneCanvas>
  );
}

function ThreeSetVenn({ data }) {
  const labels = data.labels ?? ["Math", "Science", "Arts"];
  return (
    <SceneCanvas label="Three set Venn diagram">
      <circle cx="315" cy="205" r="118" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.6" />
      <circle cx="445" cy="205" r="118" fill={VIZ_COLORS.three} fillOpacity="0.12" stroke={VIZ_COLORS.three} strokeWidth="2.6" />
      <circle cx="380" cy="298" r="118" fill={VIZ_COLORS.two} fillOpacity="0.12" stroke={VIZ_COLORS.two} strokeWidth="2.6" />
      <text x="272" y="120" fontSize="16" fontWeight="800" fill={VIZ_COLORS.one}>{labels[0]}</text>
      <text x="452" y="120" fontSize="16" fontWeight="800" fill={VIZ_COLORS.three}>{labels[1]}</text>
      <text x="330" y="392" fontSize="16" fontWeight="800" fill={VIZ_COLORS.two}>{labels[2]}</text>
      <text x="380" y="224" textAnchor="middle" fontSize="13" fill="var(--text-muted)">
        all three
      </text>
      <text x="380" y="398" textAnchor="middle" fontSize="15" fill="var(--text-muted)">
        Three circles make 8 regions
      </text>
    </SceneCanvas>
  );
}

function PowerSetScene({ data }) {
  const set = data.set ?? [1, 2, 3];
  const subsets = [];
  for (let mask = 0; mask < 1 << set.length; mask += 1) {
    subsets.push(set.filter((_, index) => mask & (1 << index)));
  }
  return (
    <SceneCanvas label="Power set">
      <text x="380" y="40" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)">
        {set.length} elements → {subsets.length} subsets
      </text>
      {subsets.map((subset, index) => {
        const columns = 4;
        const x = 95 + (index % columns) * 160;
        const y = 100 + Math.floor(index / columns) * 92;
        return (
          <g key={index}>
            <rect x={x} y={y} width="130" height="60" rx="14" fill={VIZ_COLORS.one} fillOpacity="0.1" stroke={VIZ_COLORS.one} strokeWidth="2" />
            <text x={x + 65} y={y + 37} textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--text)">
              {subset.length ? `{${subset.join(", ")}}` : "∅"}
            </text>
          </g>
        );
      })}
    </SceneCanvas>
  );
}

export default function SetScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "operations";

  let body;
  if (mode === "number-system") body = <NumberSystemScene data={data} />;
  else if (mode === "mapping" || mode === "vertical-line" || mode === "relation") body = <MappingScene data={data} />;
  else if (mode === "three-set" || mode === "operations-3") body = <ThreeSetVenn data={data} />;
  else if (mode === "power-set") body = <PowerSetScene data={data} />;
  else body = <TwoSetVenn data={data} />;

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.union ? <span className="concept-chip"><span>union</span><strong>A ∪ B</strong></span> : null}
          {data.intersection ? <span className="concept-chip"><span>intersection</span><strong>A ∩ B</strong></span> : null}
          {data.subsets ? <span className="concept-chip"><span>subsets</span><strong>{fmt(data.subsets, 0)}</strong></span> : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Sets"}
    >
      {body}
    </SceneShell>
  );
}
