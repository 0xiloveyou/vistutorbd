"use client";

import {
  VIZ_COLORS,
  SceneCanvas,
  SceneShell,
} from "./SceneKit";

function Pascal({ rows, identity }) {
  const safeRows = Math.max(2, Math.min(9, Number(rows ?? 5)));
  const triangle = [];
  for (let row = 0; row < safeRows; row += 1) {
    const line = [];
    for (let column = 0; column <= row; column += 1) {
      if (column === 0 || column === row) line.push(1);
      else line.push(triangle[row - 1][column - 1] + triangle[row - 1][column]);
    }
    triangle.push(line);
  }

  const cell = Math.min(54, 560 / safeRows);
  const originY = 66;
  const highlightRow = identity != null ? Number(identity) : safeRows - 1;

  return (
    <SceneCanvas label="Pascal's triangle">
      <text x="380" y="38" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)">
        Pascal&apos;s triangle — each entry is the sum above it
      </text>
      {triangle.map((line, row) =>
        line.map((value, column) => {
          const x = 380 + (column - row / 2) * cell;
          const y = originY + row * cell * 0.82;
          const active = row === highlightRow && (identity == null || column === 1 || column === 2);
          return (
            <g key={`${row}-${column}`}>
              <rect
                x={x - cell * 0.38}
                y={y - cell * 0.3}
                width={cell * 0.76}
                height={cell * 0.6}
                rx="8"
                fill={active ? VIZ_COLORS.two : VIZ_COLORS.one}
                fillOpacity={active ? 0.32 : 0.1}
                stroke={active ? VIZ_COLORS.two : VIZ_COLORS.one}
                strokeWidth="1.8"
              />
              <text x={x} y={y + 6} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)">
                {value}
              </text>
            </g>
          );
        }),
      )}
      <text x="380" y="392" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Row {safeRows - 1} gives the coefficients of (a + b)^{safeRows - 1}
      </text>
    </SceneCanvas>
  );
}

function Permutation({ data }) {
  const n = Number(data.n ?? 5);
  const r = Number(data.r ?? 3);
  const slots = Array.from({ length: Math.min(r, 6) }, (_, index) => n - index);
  const total = slots.reduce((product, value) => product * value, 1);
  return (
    <SceneCanvas label="Permutation">
      <text x="380" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        {n}P{r} — order matters
      </text>
      {slots.map((value, index) => {
        const x = 380 + (index - (slots.length - 1) / 2) * 112;
        return (
          <g key={index}>
            <rect x={x - 42} y="130" width="84" height="86" rx="14" fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.5" />
            <text x={x} y="184" textAnchor="middle" fontSize="28" fontWeight="800" fill={VIZ_COLORS.one}>
              {value}
            </text>
            <text x={x} y="240" textAnchor="middle" fontSize="11" fill="var(--text-muted)">
              slot {index + 1}
            </text>
          </g>
        );
      })}
      <text x="380" y="312" textAnchor="middle" fontSize="20" fontWeight="800" fill={VIZ_COLORS.two}>
        {slots.join(" × ")} = {total}
      </text>
      <text x="380" y="350" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        {n}! / ({n} − {r})! = {total}
      </text>
    </SceneCanvas>
  );
}

function SeriesSum({ data }) {
  const n = Number(data.n ?? 10);
  const pairs = Array.from({ length: n }, (_, index) => index + 1);
  const columns = 10;
  const cell = 42;
  const startX = 380 - (columns * cell) / 2;
  return (
    <SceneCanvas label="Series sum">
      <text x="380" y="48" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--text)">
        1 + 2 + … + {n} = {((n * (n + 1)) / 2).toLocaleString()}
      </text>
      {pairs.map((value, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const x = startX + column * cell;
        const y = 110 + row * cell;
        const paired = index < Math.floor(n / 2) || index >= n - Math.floor(n / 2);
        return (
          <g key={value}>
            <rect
              x={x}
              y={y}
              width={cell - 6}
              height={cell - 6}
              rx="8"
              fill={paired ? VIZ_COLORS.two : VIZ_COLORS.one}
              fillOpacity="0.2"
              stroke={paired ? VIZ_COLORS.two : VIZ_COLORS.one}
              strokeWidth="1.5"
            />
            <text x={x + 18} y={y + 26} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">
              {value}
            </text>
          </g>
        );
      })}
      <text x="380" y="330" textAnchor="middle" fontSize="15" fontWeight="700" fill={VIZ_COLORS.two}>
        {Math.floor(n / 2)} pairs × {n + 1} = {(Math.floor(n / 2) * (n + 1)).toLocaleString()}
      </text>
      <text x="380" y="368" textAnchor="middle" fontSize="14" fill="var(--text-muted)">
        Pair the ends; each pair has the same total
      </text>
    </SceneCanvas>
  );
}

export default function NumberGridConcept({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const mode = data.mode ?? "series";

  let body;
  if (mode === "pascal" || mode === "pascal-identity") {
    body = <Pascal rows={data.rows ?? data.n ?? 5} identity={mode === "pascal-identity" ? data.r : null} />;
  } else if (mode === "permutation") {
    body = <Permutation data={data} />;
  } else {
    body = <SeriesSum data={data} />;
  }

  return (
    <SceneShell
      footer={
        <>
          <span className="concept-rule">{mode.replace(/[-_]/g, " ")}</span>
          {data.rows != null ? (
            <span className="concept-chip">
              <span>rows</span>
              <strong>{data.rows}</strong>
            </span>
          ) : null}
          {data.n != null ? (
            <span className="concept-chip">
              <span>n</span>
              <strong>{data.n}</strong>
            </span>
          ) : null}
          {data.r != null ? (
            <span className="concept-chip">
              <span>r</span>
              <strong>{data.r}</strong>
            </span>
          ) : null}
        </>
      }
      label={spec?.title?.[lang] ?? "Number grid"}
    >
      {body}
    </SceneShell>
  );
}
