"use client";

import MathFormula from "@/components/MathFormula";
import { useEffect, useMemo, useState } from "react";
import {
  VIZ_COLORS,
  Axes,
  SceneCanvas,
  SceneShell,
  Slider,
  curvePath,
  fmt,
} from "./SceneKit";
import {
  approximateRoots,
  compileExpression,
  derivativeOf,
  linearFromEquation,
} from "./mathEval";

const WIDTH = 760;
const HEIGHT = 420;
const PAD = 52;

function scales(xMin, xMax, yMin, yMax) {
  const sx = (x) => PAD + ((x - xMin) / (xMax - xMin)) * (WIDTH - PAD * 2);
  const sy = (y) => HEIGHT - PAD - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PAD * 2);
  return { sx, sy };
}

function GraphAxes({ xMin, xMax, yMin, yMax, xStep = 1, yStep = 1 }) {
  return (
    <Axes
      width={WIDTH}
      height={HEIGHT}
      padding={PAD}
      xMin={xMin}
      xMax={xMax}
      yMin={yMin}
      yMax={yMax}
      xStep={xStep}
      yStep={yStep}
    />
  );
}

function Dot({ x, y, color = VIZ_COLORS.two, label }) {
  return (
    <g>
      <circle cx={x} cy={y} r="5" fill={color} stroke="var(--surface)" strokeWidth="2" />
      {label ? (
        <text x={x + 9} y={y - 9} fontSize="13" fontWeight="700" fill={color}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

function isPlainExpression(value) {
  return typeof value === "string" && value.length > 0 && !/[=≤≥<>]/.test(value);
}

function normalizeExpression(source) {
  let text = String(source ?? "");
  text = text.replace(/\|([^|]+)\|/g, "abs($1)");
  text = text.replace(/log_(\d+)\s*/gi, "log$1");
  text = text.replace(
    /\b(sin|cos|tan|log\d*|ln|sqrt|abs|exp)\s+([a-zA-Z0-9.]+)/gi,
    "$1($2)",
  );
  return text;
}

const DERIVATIVE_MODES = new Set([
  "tangent-normal",
  "secant-tangent",
  "limit-zoom",
  "derivative-graph",
  "mvt",
  "concavity",
  "full-sketch",
  "sign-chart",
  "max-min",
  "abs-continuity",
]);

const INTEGRAL_MODES = new Set([
  "riemann",
  "riemann-types",
  "ftc",
  "definite-properties",
  "even-odd-integral",
  "signed-area",
  "simpson",
]);

const CONIC_MODES = new Set([
  "parabola-definition",
  "parabola-forms",
  "ellipse-string",
  "eccentricity",
  "hyperbola",
  "conic-e",
  "conic-classifier",
]);

const MODE_ALIASES = {
  "line-circle": "circle",
  "family-circles": "circle",
  "vertical-line": "circle",
  implicit: "circle",
  ...Object.fromEntries([...DERIVATIVE_MODES].map((name) => [name, "derivative"])),
  ...Object.fromEntries([...INTEGRAL_MODES].map((name) => [name, "integral"])),
  ...Object.fromEntries([...CONIC_MODES].map((name) => [name, "conic"])),
  trig: "function",
  "trig-graphs": "function",
  "trig-domain": "function",
  "wave-addition": "function",
  harmonic: "function",
  periodic: "function",
  "restrict-domain": "function",
  "inverse-mirror": "function",
  "principal-ranges": "function",
  "projectile-formulas": "function",
  "range-angle": "function",
  "variable-acceleration": "function",
  transformations: "function",
  shift: "function",
  symmetry: "function",
  "inverse-reflection": "function",
  piecewise: "function",
  gallery: "function",
  asymptotes: "function",
  "domain-range": "function",
  "abs-floor": "function",
  composition: "function",
};

const RELATION_MODES = new Set([
  "circle",
  "conic",
  "parabola-definition",
  "parabola-forms",
  "ellipse-string",
  "eccentricity",
  "hyperbola",
  "conic-e",
  "conic-classifier",
  "line-circle",
  "family-circles",
  "implicit",
  "vertical-line",
]);

function expressionOf(data, fallback = "x^2", mode = "") {
  const candidates = [data.expression, data.fn, data.formula, data.lhs];
  let expression = candidates.find(isPlainExpression);

  if (!expression) {
    switch (mode) {
      case "trig":
      case "trig-graphs": {
        const fn = data.fn ?? data.functions?.[0] ?? "sin";
        expression = `${fn}(x)`;
        break;
      }
      case "trig-domain":
        expression = data.fn === "tan" ? "tan(x)" : "sin(x)";
        break;
      case "wave-addition":
        expression = `sin(${data.f1 ?? 1}x) + sin(${data.f2 ?? 1.1}x)`;
        break;
      case "harmonic":
        expression = `${data.a ?? 3}sin(x) + ${data.b ?? 4}cos(x)`;
        break;
      case "periodic":
        expression = "sin(x)";
        break;
      case "restrict-domain":
      case "inverse-mirror":
        expression = "sin(x)";
        break;
      case "principal-ranges":
        expression = "asin(x)";
        break;
      case "projectile-formulas": {
        const speed = Number(data.speed ?? 20);
        const angle = (Number(data.angle ?? 45) * Math.PI) / 180;
        const tan = Math.tan(angle);
        const cos = Math.cos(angle) || 1;
        expression = `${tan.toFixed(4)}x - ${(10 / (2 * speed * speed * cos * cos)).toFixed(6)}x^2`;
        break;
      }
      case "range-angle":
        expression = "sin(2x)";
        break;
      case "variable-acceleration":
        expression = "3x^2";
        break;
      case "transformations": {
        const a = Number(data.a ?? 2);
        const h = Number(data.h ?? 1);
        const k = Number(data.k ?? -2);
        expression = `${a}(x - ${h})^2 + ${k}`;
        break;
      }
      case "shift":
        expression = "(x + 1)^2";
        break;
      case "symmetry":
        expression = data.fn ?? "x^3";
        break;
      case "inverse-reflection":
        expression = data.fn ?? "x^2";
        break;
      case "piecewise":
        expression = data.pieces?.[0] ?? "x";
        break;
      case "composition":
        expression = "x^2";
        break;
      case "domain-range":
        expression = "sqrt(x)";
        break;
      case "abs-floor":
        expression = "abs(x)";
        break;
      case "asymptotes":
        expression = "(x+1)/(x-2)";
        break;
      case "gallery":
        expression = "x^3";
        break;
      case "am-gm-optimization":
        expression = "x*(20-x)";
        break;
      case "best-fit":
        expression = "x";
        break;
      default:
        expression = fallback;
    }
  }

  return normalizeExpression(expression);
}

function quadraticFrom(data) {
  const a = Number(data.a ?? 1);
  const b = Number(data.b ?? 0);
  const c = Number(data.c ?? 0);
  return { a, b, c };
}

/** Parses `2x + 3y <= 6` (or `x >= 0`) into a linear inequality. */
function parseConstraint(source) {
  const text = String(source ?? "").replace(/\s+/g, "").replace(/−/g, "-");
  const parts = text.split(/(<=|>=|<|>)/);
  if (parts.length !== 3) return null;
  const [lhs, op, rhsText] = parts;

  let a = 0;
  let b = 0;
  let constant = 0;
  const terms = lhs.replace(/-/g, "+-").split("+").filter(Boolean);

  for (const term of terms) {
    if (term.endsWith("x")) {
      const coefficient = term.slice(0, -1);
      a += coefficient === "" || coefficient === "+" ? 1 : Number(coefficient);
    } else if (term.endsWith("y")) {
      const coefficient = term.slice(0, -1);
      b += coefficient === "" || coefficient === "+" ? 1 : Number(coefficient);
    } else {
      constant += Number(term);
    }
  }

  const rhs = Number(rhsText);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(rhs)) return null;
  return { a, b, op, c: rhs - constant };
}

function satisfies(x, y, constraint) {
  const value = constraint.a * x + constraint.b * y;
  switch (constraint.op) {
    case "<=":
      return value <= constraint.c + 1e-9;
    case ">=":
      return value >= constraint.c - 1e-9;
    case "<":
      return value < constraint.c;
    case ">":
      return value > constraint.c;
    default:
      return false;
  }
}

function drawConstraint(sx, sy, constraint, color, index) {
  const { a, b, c } = constraint;
  if (Math.abs(b) > 1e-9) {
    const f = (x) => (c - a * x) / b;
    return (
      <line
        key={index}
        x1={sx(-6)}
        y1={sy(f(-6))}
        x2={sx(6)}
        y2={sy(f(6))}
        stroke={color}
        strokeWidth="2.6"
      />
    );
  }
  if (Math.abs(a) > 1e-9) {
    return <line key={index} x1={sx(c / a)} y1={sy(-6)} x2={sx(c / a)} y2={sy(6)} stroke={color} strokeWidth="2.6" />;
  }
  return null;
}

export default function GraphScene({ step, lang, spec }) {
  const data = { ...(spec?.data ?? {}), ...(step?.data ?? {}) };
  const renderer = spec?.renderer ?? "function-graph";
  const rawMode = data.mode ?? (renderer === "coordinate-plane" ? "line" : "function");
  const mode = renderer === "function-graph" ? MODE_ALIASES[rawMode] ?? rawMode : rawMode;
  const [x0, setX0] = useState(Number(data.at ?? data.x ?? 2));

  useEffect(() => {
    const next = Number(data.at ?? data.x ?? 2);
    if (Number.isFinite(next)) setX0(next);
  }, [step, data.at, data.x]);

  const view = useMemo(() => {
    if (mode === "exponential" || mode === "log-inverse") {
      return { xMin: -4, xMax: 6, yMin: -2, yMax: 10, xStep: 1, yStep: 2 };
    }
    if (mode === "integral") {
      return { xMin: -1, xMax: 5, yMin: -1, yMax: 12, xStep: 1, yStep: 2 };
    }
    if (mode === "projectile") {
      return { xMin: -2, xMax: 50, yMin: -2, yMax: 28, xStep: 10, yStep: 5 };
    }
    return { xMin: -6, xMax: 6, yMin: -6, yMax: 6, xStep: 1, yStep: 1 };
  }, [mode]);

  const { xMin, xMax, yMin, yMax, xStep, yStep } = view;
  const { sx, sy } = scales(xMin, xMax, yMin, yMax);

  const footer = [];
  if (step?.formula) footer.push(<MathFormula key="formula" formula={step.formula} />);

  if (renderer === "coordinate-plane") {
    return (
      <CoordinateScene
        data={data}
        mode={mode}
        sx={sx}
        sy={sy}
        view={view}
        step={step}
        footer={footer}
      />
    );
  }

  if (renderer === "function-graph" && RELATION_MODES.has(rawMode)) {
    return (
      <CoordinateScene
        data={data}
        mode={rawMode}
        sx={sx}
        sy={sy}
        view={view}
        step={step}
        footer={footer}
      />
    );
  }

  const expression = expressionOf(data, "x^2", rawMode);
  const fn = compileExpression(expression);
  const roots = approximateRoots(fn, xMin, xMax);

  const body = (() => {
    switch (mode) {
      case "roots":
      case "discriminant":
      case "quadratic-inequality":
      case "polynomial":
      case "function":
      case "remainder":
      case "factor":
      case "best-fit":
      case "am-gm-optimization":
      case "families": {
        const expressions = Array.isArray(data.expressions)
          ? data.expressions
          : [expression];
        const colors = [
          VIZ_COLORS.one,
          VIZ_COLORS.two,
          VIZ_COLORS.three,
          VIZ_COLORS.five,
        ];

        return (
          <>
            <GraphAxes {...view} />
            {expressions.map((item, index) => {
              const curve = compileExpression(item);
              return (
                <path
                  key={item}
                  d={curvePath(curve, xMin, xMax, sx, sy)}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            {roots
              .slice(0, 6)
              .map((root) => (
                <Dot
                  key={root}
                  x={sx(root)}
                  y={sy(0)}
                  color={VIZ_COLORS.two}
                  label={`x=${fmt(root, 2)}`}
                />
              ))}
            {mode === "discriminant" ? (
              <text x={PAD + 12} y={PAD + 24} fontSize="16" fontWeight="700" fill="var(--text)">
                D = b² − 4ac = {fmt(
                  quadraticFrom(data).b ** 2 - 4 * quadraticFrom(data).a * quadraticFrom(data).c,
                  2,
                )}
              </text>
            ) : null}
          </>
        );
      }

      case "exponential": {
        const base = Number(data.base ?? 2);
        const curve = (x) => Math.pow(base, x);
        return (
          <>
            <GraphAxes {...view} />
            <path
              d={curvePath(curve, xMin, xMax, sx, sy)}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            {[2, 3].map((x) => (
              <Dot
                key={x}
                x={sx(x)}
                y={sy(curve(x))}
                color={VIZ_COLORS.two}
                label={`(${x}, ${fmt(curve(x), 0)})`}
              />
            ))}
            <text x={sx(-3.4)} y={sy(0.8)} fontSize="15" fill="var(--text-muted)">
              y = {base}
              <tspan baselineShift="super">x</tspan>
            </text>
          </>
        );
      }

      case "log-inverse":
      case "inverse": {
        const base = Number(data.base ?? 2);
        const forward = mode === "inverse" ? compileExpression(expression) : (x) => Math.pow(base, x);
        const backward =
          mode === "inverse"
            ? compileExpression(data.inverse ?? "(x - 1)/2")
            : (x) => Math.log(x) / Math.log(base);
        const localView = mode === "inverse" ? view : { xMin: -2, xMax: 10, yMin: -2, yMax: 10, xStep: 2, yStep: 2 };
        const local = scales(localView.xMin, localView.xMax, localView.yMin, localView.yMax);
        return (
          <>
            <GraphAxes {...localView} />
            <line
              x1={local.sx(localView.xMin)}
              y1={local.sy(localView.xMin)}
              x2={local.sx(localView.xMax)}
              y2={local.sy(localView.xMax)}
              stroke="var(--text-soft)"
              strokeDasharray="5 5"
              strokeWidth="1.5"
            />
            <path
              d={curvePath(forward, localView.xMin, localView.xMax, local.sx, local.sy)}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <path
              d={curvePath(backward, localView.xMin, localView.xMax, local.sx, local.sy)}
              fill="none"
              stroke={VIZ_COLORS.three}
              strokeWidth="3"
            />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill={VIZ_COLORS.one}>
              y = f(x)
            </text>
            <text x={PAD + 12} y={PAD + 42} fontSize="14" fill={VIZ_COLORS.three}>
              y = f⁻¹(x)
            </text>
          </>
        );
      }

      case "derivative": {
        const slope = derivativeOf(fn, x0);
        const tangent = (x) => fn(x0) + slope * (x - x0);
        return (
          <>
            <GraphAxes {...view} />
            <path
              d={curvePath(fn, xMin, xMax, sx, sy)}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <path
              d={curvePath(tangent, xMin, xMax, sx, sy)}
              fill="none"
              stroke={VIZ_COLORS.two}
              strokeWidth="2"
              strokeDasharray="7 5"
            />
            <Dot x={sx(x0)} y={sy(fn(x0))} color={VIZ_COLORS.two} label={`slope ${fmt(slope, 2)}`} />
          </>
        );
      }

      case "integral": {
        const from = Number(data.from ?? 0);
        const to = Number(data.to ?? 3);
        const samples = 80;
        let area = `M${sx(from)} ${sy(0)} `;
        for (let index = 0; index <= samples; index += 1) {
          const x = from + ((to - from) * index) / samples;
          const y = fn(x);
          if (Number.isFinite(y)) area += `L${sx(x)} ${sy(y)} `;
        }
        area += `L${sx(to)} ${sy(0)} Z`;
        return (
          <>
            <GraphAxes {...view} />
            <path d={area} fill={VIZ_COLORS.one} opacity="0.18" />
            <path
              d={curvePath(fn, xMin, xMax, sx, sy)}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <line x1={sx(from)} y1={sy(0)} x2={sx(from)} y2={sy(fn(from))} stroke={VIZ_COLORS.two} strokeDasharray="4 4" />
            <line x1={sx(to)} y1={sy(0)} x2={sx(to)} y2={sy(fn(to))} stroke={VIZ_COLORS.two} strokeDasharray="4 4" />
            <text x={sx(from)} y={sy(0) + 22} textAnchor="middle" fontSize="13" fill="var(--text-muted)">
              {from}
            </text>
            <text x={sx(to)} y={sy(0) + 22} textAnchor="middle" fontSize="13" fill="var(--text-muted)">
              {to}
            </text>
          </>
        );
      }

      case "modulus-equation": {
        const centre = Number(data.center ?? 1);
        const distance = Number(data.distance ?? 3);
        const curve = (x) => Math.abs(x - centre);
        return (
          <>
            <GraphAxes {...view} />
            <path d={curvePath(curve, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
            <line x1={sx(xMin)} y1={sy(distance)} x2={sx(xMax)} y2={sy(distance)} stroke={VIZ_COLORS.two} strokeWidth="2" />
            {[centre - distance, centre + distance].map((root) => (
              <Dot key={root} x={sx(root)} y={sy(distance)} color={VIZ_COLORS.two} label={`x=${fmt(root, 2)}`} />
            ))}
          </>
        );
      }

      case "rational-inequality": {
        return (
          <>
            <GraphAxes {...view} />
            <path d={curvePath(fn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
            {roots.map((root) => (
              <line
                key={root}
                x1={sx(root)}
                y1={PAD}
                x2={sx(root)}
                y2={HEIGHT - PAD}
                stroke={VIZ_COLORS.two}
                strokeDasharray="5 5"
              />
            ))}
          </>
        );
      }

      case "area-between": {
        const top = expressionOf({ expression: data.top }, "x", "area-between");
        const bottom = expressionOf({ expression: data.bottom }, "x^2", "area-between");
        const from = Number(data.a ?? 0);
        const to = Number(data.b ?? 1);
        const topFn = compileExpression(top);
        const bottomFn = compileExpression(bottom);
        const polygon = [];
        for (let index = 0; index <= 80; index += 1) {
          const x = from + ((to - from) * index) / 80;
          polygon.push(`${sx(x)},${sy(topFn(x))}`);
        }
        for (let index = 80; index >= 0; index -= 1) {
          const x = from + ((to - from) * index) / 80;
          polygon.push(`${sx(x)},${sy(bottomFn(x))}`);
        }
        return (
          <>
            <GraphAxes {...view} />
            <polygon points={polygon.join(" ")} fill={VIZ_COLORS.two} fillOpacity="0.22" />
            <path d={curvePath(topFn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
            <path d={curvePath(bottomFn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.three} strokeWidth="3" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              area between the curves from {from} to {to}
            </text>
          </>
        );
      }

      case "graph-intersection": {
        const left = expressionOf({ expression: data.lhs }, "sin(x)", "trig");
        const right = expressionOf({ expression: data.rhs }, "0.5", "function");
        const leftFn = compileExpression(left);
        const rightFn = compileExpression(right);
        return (
          <>
            <GraphAxes {...view} />
            <path d={curvePath(leftFn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
            <path d={curvePath(rightFn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.three} strokeWidth="3" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill={VIZ_COLORS.one}>
              y = {left}
            </text>
            <text x={PAD + 12} y={PAD + 42} fontSize="14" fill={VIZ_COLORS.three}>
              y = {right}
            </text>
            <text x={PAD + 12} y={PAD + 62} fontSize="13" fill="var(--text-muted)">
              solutions are the intersection points
            </text>
          </>
        );
      }

      default: {
        return (
          <>
            <GraphAxes {...view} />
            <path d={curvePath(fn, xMin, xMax, sx, sy)} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
            {roots.slice(0, 6).map((root) => (
              <Dot key={root} x={sx(root)} y={sy(0)} color={VIZ_COLORS.two} label={`${fmt(root, 2)}`} />
            ))}
          </>
        );
      }
    }
  })();

  const controls =
    mode === "derivative" ? (
      <Slider label="Move the point" value={x0} min={-5} max={5} step={0.5} onChange={setX0} />
    ) : null;

  return (
    <SceneShell controls={controls} footer={footer} label={spec?.title?.[lang] ?? "Graph"}>
      <SceneCanvas label={spec?.title?.[lang] ?? "Graph"}>{body}</SceneCanvas>
    </SceneShell>
  );
}

function CoordinateScene({ data, mode, rawMode = mode, sx, sy, view, step, footer }) {
  const { xMin, xMax, yMin, yMax } = view;
  const conicType =
    rawMode === "hyperbola"
      ? "hyperbola"
      : rawMode === "parabola-definition" || rawMode === "parabola-forms"
        ? "parabola"
        : rawMode === "ellipse-string" ||
            rawMode === "eccentricity" ||
            rawMode === "conic-e"
          ? "ellipse"
          : null;

  const lines = useMemo(() => {
    if (mode !== "intersection" || !Array.isArray(data.equations)) return [];
    return data.equations
      .map((equation) => linearFromEquation(equation))
      .filter(Boolean);
  }, [mode, data.equations]);

  const intersections = useMemo(() => {
    if (lines.length < 2) return [];
    const [first, second] = lines;
    if (Math.abs(first.slope - second.slope) < 1e-9) return [];
    const x = (second.intercept - first.intercept) / (first.slope - second.slope);
    return [{ x, y: first.slope * x + first.intercept }];
  }, [lines]);

  const body = (() => {
    switch (mode) {
      case "intersection":
      case "line": {
        const drawn =
          mode === "line"
            ? [{ slope: Number(data.slope ?? 2), intercept: Number(data.intercept ?? 1) }]
            : lines.length
              ? lines
              : [{ slope: 1, intercept: 0 }];

        return (
          <>
            <GraphAxes {...view} />
            {drawn.map((line, index) => (
              <line
                key={index}
                x1={sx(xMin)}
                y1={sy(line.slope * xMin + line.intercept)}
                x2={sx(xMax)}
                y2={sy(line.slope * xMax + line.intercept)}
                stroke={index === 0 ? VIZ_COLORS.one : VIZ_COLORS.three}
                strokeWidth="2.6"
              />
            ))}
            {intersections.map((point) => (
              <Dot
                key={`${point.x}-${point.y}`}
                x={sx(point.x)}
                y={sy(point.y)}
                color={VIZ_COLORS.two}
                label={`(${fmt(point.x, 2)}, ${fmt(point.y, 2)})`}
              />
            ))}
          </>
        );
      }

      case "circle": {
        const centre = Array.isArray(data.centre)
          ? data.centre
          : Array.isArray(data.center)
            ? data.center
            : [Number(data.h ?? 0), Number(data.k ?? 0)];
        const [h, k] = centre.map(Number);
        const implicitRadius = (() => {
          const match = String(data.expression ?? "").match(/=\s*(\d+(?:\.\d+)?)/);
          return match ? Math.sqrt(Number(match[1])) : null;
        })();
        const radius = Number(data.radius ?? data.r ?? implicitRadius ?? 5);
        return (
          <>
            <GraphAxes {...view} />
            <circle
              cx={sx(h)}
              cy={sy(k)}
              r={Math.abs(sx(h + radius) - sx(h))}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <Dot x={sx(h)} y={sy(k)} color={VIZ_COLORS.two} label={`centre (${h}, ${k})`} />
            <line
              x1={sx(h)}
              y1={sy(k)}
              x2={sx(h + radius)}
              y2={sy(k)}
              stroke={VIZ_COLORS.three}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            {rawMode === "line-circle" && Array.isArray(data.line) ? (
              (() => {
                const [la, lb, lc] = data.line.map(Number);
                if (Math.abs(lb) > 1e-9) {
                  return (
                    <line
                      x1={sx(-6)}
                      y1={sy((lc - la * -6) / lb)}
                      x2={sx(6)}
                      y2={sy((lc - la * 6) / lb)}
                      stroke={VIZ_COLORS.five}
                      strokeWidth="2.6"
                    />
                  );
                }
                return <line x1={sx(lc / la)} y1={sy(-6)} x2={sx(lc / la)} y2={sy(6)} stroke={VIZ_COLORS.five} strokeWidth="2.6" />;
              })()
            ) : null}
            {mode === "implicit" || mode === "vertical-line" ? (
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
                implicit relation: {data.expression}
              </text>
            ) : null}
          </>
        );
      }

      case "complex": {
        const re = Number(data.real ?? data.re ?? (Array.isArray(data.point) ? data.point[0] : 3));
        const im = Number(data.imaginary ?? data.im ?? (Array.isArray(data.point) ? data.point[1] : 4));
        return (
          <>
            <GraphAxes {...view} />
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(re)}
              y2={sy(im)}
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <Dot x={sx(re)} y={sy(im)} color={VIZ_COLORS.two} label={`${re} + ${im}i`} />
            <line x1={sx(re)} y1={sy(im)} x2={sx(re)} y2={sy(0)} stroke="var(--text-soft)" strokeDasharray="4 4" />
            <line x1={sx(re)} y1={sy(0)} x2={sx(0)} y2={sy(0)} stroke="var(--text-soft)" strokeDasharray="4 4" />
            <text x={sx(re) + 10} y={sy(0) + 26} fontSize="13" fill="var(--text-muted)">
              Re = {re}
            </text>
            <text x={sx(0) + 10} y={sy(im) - 8} fontSize="13" fill="var(--text-muted)">
              Im = {im}
            </text>
          </>
        );
      }

      case "conic": {
        let type = data.type ?? conicType ?? "parabola";
        if (mode === "conic-classifier" && data.A != null && data.C != null) {
          type =
            Number(data.A) * Number(data.C) < 0
              ? "hyperbola"
              : Math.abs(Number(data.A) - Number(data.C)) < 1e-9
                ? "circle"
                : "ellipse";
        }
        if (!data.type && mode === "conic-e") {
          const e = Number(data.e ?? 1);
          type = e < 1 ? "ellipse" : e === 1 ? "parabola" : "hyperbola";
        }

        if (type === "parabola") {
          const a = Number(data.a ?? 1);
          return (
            <>
              <GraphAxes {...view} />
              <path
                d={curvePath((x) => (x * x) / (4 * a), xMin, xMax, sx, sy)}
                fill="none"
                stroke={VIZ_COLORS.one}
                strokeWidth="3"
              />
              <Dot x={sx(0)} y={sy(a)} color={VIZ_COLORS.two} label="focus" />
              <line x1={sx(xMin)} y1={sy(-a)} x2={sx(xMax)} y2={sy(-a)} stroke="var(--text-soft)" strokeDasharray="5 5" />
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
                focus (0, {a}) · directrix y = −{a}
              </text>
            </>
          );
        }

        if (type === "hyperbola") {
          const a = Number(data.a ?? 3);
          const b = Number(data.b ?? 4);
          const right = Array.from({ length: 81 }, (_, index) => {
            const t = -2.2 + (4.4 * index) / 80;
            return `${index === 0 ? "M" : "L"}${sx(a * Math.cosh(t))} ${sy(b * Math.sinh(t))}`;
          }).join(" ");
          const left = Array.from({ length: 81 }, (_, index) => {
            const t = -2.2 + (4.4 * index) / 80;
            return `${index === 0 ? "M" : "L"}${sx(-a * Math.cosh(t))} ${sy(b * Math.sinh(t))}`;
          }).join(" ");
          return (
            <>
              <GraphAxes {...view} />
              <path d={right} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
              <path d={left} fill="none" stroke={VIZ_COLORS.one} strokeWidth="3" />
              <line x1={sx(xMin)} y1={sy((b / a) * xMin)} x2={sx(xMax)} y2={sy((b / a) * xMax)} stroke="var(--text-soft)" strokeDasharray="5 5" />
              <line x1={sx(xMin)} y1={sy((-b / a) * xMin)} x2={sx(xMax)} y2={sy((-b / a) * xMax)} stroke="var(--text-soft)" strokeDasharray="5 5" />
              <Dot x={sx(a)} y={sy(0)} color={VIZ_COLORS.two} label="vertex" />
            </>
          );
        }

        const a = Number(data.a ?? 4);
        const c = Number(data.c ?? 3);
        const b =
          Number(data.b ?? 0) ||
          (data.c != null ? Math.sqrt(Math.max(0.1, a * a - c * c)) : 3);
        const focus = data.c != null ? c : Math.sqrt(Math.max(0, a * a - b * b));
        return (
          <>
            <GraphAxes {...view} />
            <ellipse
              cx={sx(0)}
              cy={sy(0)}
              rx={Math.abs(sx(a) - sx(0))}
              ry={Math.abs(sy(b) - sy(0))}
              fill={VIZ_COLORS.one}
              fillOpacity="0.12"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <Dot x={sx(-focus)} y={sy(0)} color={VIZ_COLORS.two} label="focus" />
            <Dot x={sx(focus)} y={sy(0)} color={VIZ_COLORS.two} label="focus" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              a = {fmt(a, 2)} · b = {fmt(b, 2)} · c = {fmt(focus, 2)}
            </text>
          </>
        );
      }

      case "non-linear": {
        const kind = data.conic ?? "circle";
        const line = linearFromEquation(data.line ?? "y = x + 1");
        const radius = 3;
        return (
          <>
            <GraphAxes {...view} />
            {kind === "circle" ? (
              <circle
                cx={sx(0)}
                cy={sy(0)}
                r={Math.abs(sx(radius) - sx(0))}
                fill={VIZ_COLORS.one}
                fillOpacity="0.1"
                stroke={VIZ_COLORS.one}
                strokeWidth="3"
              />
            ) : (
              <path
                d={curvePath((x) => (x * x) / 4, xMin, xMax, sx, sy)}
                fill="none"
                stroke={VIZ_COLORS.one}
                strokeWidth="3"
              />
            )}
            {line ? (
              <line
                x1={sx(xMin)}
                y1={sy(line.slope * xMin + line.intercept)}
                x2={sx(xMax)}
                y2={sy(line.slope * xMax + line.intercept)}
                stroke={VIZ_COLORS.three}
                strokeWidth="2.6"
              />
            ) : null}
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              a line meeting a {kind}: count the intersection points
            </text>
          </>
        );
      }

      case "cartesian-product": {
        const a = data.a ?? [1, 2];
        const b = data.b ?? [3, 4];
        return (
          <>
            <GraphAxes {...view} />
            {a.map((first) =>
              b.map((second) => (
                <Dot
                  key={`${first}-${second}`}
                  x={sx(Number(first))}
                  y={sy(Number(second))}
                  color={VIZ_COLORS.two}
                  label={`(${first}, ${second})`}
                />
              )),
            )}
          </>
        );
      }

      case "vector": {
        const a = data.a ?? [3, 4];
        const b = data.b ?? [1, 2];
        const sum = [a[0] + b[0], a[1] + b[1]];
        return (
          <>
            <GraphAxes {...view} />
            <line x1={sx(0)} y1={sy(0)} x2={sx(a[0])} y2={sy(a[1])} stroke={VIZ_COLORS.one} strokeWidth="3.5" />
            <line x1={sx(0)} y1={sy(0)} x2={sx(b[0])} y2={sy(b[1])} stroke={VIZ_COLORS.three} strokeWidth="3.5" />
            <line
              x1={sx(a[0])}
              y1={sy(a[1])}
              x2={sx(sum[0])}
              y2={sy(sum[1])}
              stroke={VIZ_COLORS.three}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <line
              x1={sx(b[0])}
              y1={sy(b[1])}
              x2={sx(sum[0])}
              y2={sy(sum[1])}
              stroke={VIZ_COLORS.one}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <line x1={sx(0)} y1={sy(0)} x2={sx(sum[0])} y2={sy(sum[1])} stroke={VIZ_COLORS.two} strokeWidth="3" />
            <Dot x={sx(sum[0])} y={sy(sum[1])} color={VIZ_COLORS.two} label={`(${sum[0]}, ${sum[1]})`} />
            <text x={sx(a[0]) + 8} y={sy(a[1]) - 8} fontSize="14" fill={VIZ_COLORS.one}>
              a
            </text>
            <text x={sx(b[0]) + 8} y={sy(b[1]) - 8} fontSize="14" fill={VIZ_COLORS.three}>
              b
            </text>
          </>
        );
      }

      case "feasible-region":
      case "feasible-region-builder":
      case "corner-points":
      case "objective-sweep":
      case "vertex-optimum":
      case "unbounded-infeasible":
      case "multiple-optima":
      case "sensitivity":
      case "integer-feasible": {
        const sources = data.constraints ?? data.lines ?? ["x+y<=4", "x>=0", "y>=0"];
        const constraints = sources.map(parseConstraint).filter(Boolean);
        const cells = [];
        if (constraints.length) {
          for (let x = -5; x <= 6; x += 0.35) {
            for (let y = -5; y <= 6; y += 0.35) {
              if (constraints.every((constraint) => satisfies(x, y, constraint))) {
                cells.push([x, y]);
              }
            }
          }
        }
        const vertices = Array.isArray(data.vertices)
          ? data.vertices.map((point) => point.map(Number))
          : [];
        const objective = typeof data.objective === "string" ? parseConstraint(`${data.objective}=0`) : null;
        const integerMode = mode === "integer-feasible";

        return (
          <>
            <GraphAxes {...view} />
            {cells.map(([x, y], index) => (
              <rect
                key={index}
                x={sx(x) - 3}
                y={sy(y) - 3}
                width="6"
                height="6"
                fill={VIZ_COLORS.one}
                opacity="0.3"
              />
            ))}
            {constraints.map((constraint, index) =>
              drawConstraint(
                sx,
                sy,
                constraint,
                [VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two, VIZ_COLORS.five][index % 4],
                index,
              ),
            )}
            {vertices.map(([x, y]) => (
              <Dot key={`${x}-${y}`} x={sx(x)} y={sy(y)} color={VIZ_COLORS.two} label={`(${x}, ${y})`} />
            ))}
            {integerMode ? (
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
                integer points inside the region
              </text>
            ) : null}
            {objective ? (
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
                objective: {data.objective}
              </text>
            ) : null}
            {mode === "unbounded-infeasible" ? (
              <text x={PAD + 12} y={PAD + 42} fontSize="13" fill={VIZ_COLORS.four}>
                the feasible set may run to infinity or be empty
              </text>
            ) : null}
          </>
        );
      }

      case "half-plane": {
        const constraint = parseConstraint(`${data.a ?? 2}x + ${data.b ?? 3}y <= ${data.c ?? 6}`);
        const shaded = [];
        if (constraint) {
          for (let x = -5; x <= 6; x += 0.4) {
            for (let y = -5; y <= 6; y += 0.4) {
              if (satisfies(x, y, constraint)) shaded.push([x, y]);
            }
          }
        }
        return (
          <>
            <GraphAxes {...view} />
            {shaded.map(([x, y], index) => (
              <rect
                key={index}
                x={sx(x) - 3}
                y={sy(y) - 3}
                width="6"
                height="6"
                fill={VIZ_COLORS.one}
                opacity="0.22"
              />
            ))}
            {constraint ? drawConstraint(sx, sy, constraint, VIZ_COLORS.one, 0) : null}
            {constraint ? (
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill={VIZ_COLORS.two}>
                shaded side: {data.a ?? 2}x + {data.b ?? 3}y ≤ {data.c ?? 6}
              </text>
            ) : null}
          </>
        );
      }

      case "transformations": {
        const base = data.points ?? [[1, 1], [4, 1], [1, 3]];
        const image = data.image ?? [[-1, 1], [-4, 1], [-1, 3]];
        const toPoints = (points) => points.map(([x, y]) => `${sx(Number(x))},${sy(Number(y))}`).join(" ");
        return (
          <>
            <GraphAxes {...view} />
            <polygon points={toPoints(base)} fill={VIZ_COLORS.one} fillOpacity="0.16" stroke={VIZ_COLORS.one} strokeWidth="2.6" />
            <polygon points={toPoints(image)} fill={VIZ_COLORS.two} fillOpacity="0.12" stroke={VIZ_COLORS.two} strokeWidth="2.6" strokeDasharray="6 5" />
            <text x={sx(2.6)} y={sy(0.6)} fontSize="13" fill={VIZ_COLORS.one}>original</text>
            <text x={sx(-4.2)} y={sy(0.6)} fontSize="13" fill={VIZ_COLORS.two}>image</text>
          </>
        );
      }

      case "triangle-area": {
        const points = (data.points ?? [[0, 0], [4, 0], [0, 3]]).map((point) => point.map(Number));
        const area =
          points.length >= 3
            ? Math.abs(
                (points[0][0] * (points[1][1] - points[2][1]) +
                  points[1][0] * (points[2][1] - points[0][1]) +
                  points[2][0] * (points[0][1] - points[1][1])) /
                  2,
              )
            : 0;
        return (
          <>
            <GraphAxes {...view} />
            <polygon
              points={points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}
              fill={VIZ_COLORS.one}
              fillOpacity="0.18"
              stroke={VIZ_COLORS.one}
              strokeWidth="2.8"
            />
            {points.map(([x, y]) => (
              <Dot key={`${x}-${y}`} x={sx(x)} y={sy(y)} color={VIZ_COLORS.two} label={`(${x}, ${y})`} />
            ))}
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              area = {fmt(area, 2)} square units
            </text>
          </>
        );
      }

      case "slopes":
      case "angle-lines":
      case "family-lines":
      case "slope-intercept": {
        const m1 = Number(data.m1 ?? data.m ?? 2);
        const m2 = Number(data.m2 ?? -0.5);
        const c1 = Number(data.c ?? 1);
        const c2 = Number(data.c2 ?? -1);
        return (
          <>
            <GraphAxes {...view} />
            <line x1={sx(-6)} y1={sy(m1 * -6 + c1)} x2={sx(6)} y2={sy(m1 * 6 + c1)} stroke={VIZ_COLORS.one} strokeWidth="2.8" />
            <line x1={sx(-6)} y1={sy(m2 * -6 + c2)} x2={sx(6)} y2={sy(m2 * 6 + c2)} stroke={VIZ_COLORS.three} strokeWidth="2.8" />
            <text x={PAD + 12} y={PAD + 22} fontSize="13" fill={VIZ_COLORS.one}>m₁ = {fmt(m1, 2)}</text>
            <text x={PAD + 12} y={PAD + 42} fontSize="13" fill={VIZ_COLORS.three}>m₂ = {fmt(m2, 2)}</text>
            <text x={PAD + 12} y={PAD + 62} fontSize="13" fill="var(--text-muted)">
              m₁ × m₂ = {fmt(m1 * m2, 2)}
            </text>
          </>
        );
      }

      case "consistency": {
        const equations = data.equations ?? data.lines ?? ["x + y = 4", "x - y = 0"];
        const parsed = equations.map(linearFromEquation).filter(Boolean);
        return (
          <>
            <GraphAxes {...view} />
            {parsed.map((line, index) => (
              <line
                key={index}
                x1={sx(-6)}
                y1={sy(line.slope * -6 + line.intercept)}
                x2={sx(6)}
                y2={sy(line.slope * 6 + line.intercept)}
                stroke={index === 0 ? VIZ_COLORS.one : VIZ_COLORS.three}
                strokeWidth="2.6"
              />
            ))}
            {parsed.length >= 2 && Math.abs(parsed[0].slope - parsed[1].slope) < 1e-9 ? (
              <text x={PAD + 12} y={PAD + 22} fontSize="14" fill={VIZ_COLORS.four}>
                parallel lines → no solution
              </text>
            ) : null}
            {intersections.map((point) => (
              <Dot key={point.x} x={sx(point.x)} y={sy(point.y)} color={VIZ_COLORS.two} label={`(${fmt(point.x, 2)}, ${fmt(point.y, 2)})`} />
            ))}
          </>
        );
      }

      case "concurrency": {
        const equations = data.lines ?? ["x+y=4", "x-y=0", "2x+y=6"];
        const parsed = equations.map(linearFromEquation).filter(Boolean);
        return (
          <>
            <GraphAxes {...view} />
            {parsed.map((line, index) => (
              <line
                key={index}
                x1={sx(-6)}
                y1={sy(line.slope * -6 + line.intercept)}
                x2={sx(6)}
                y2={sy(line.slope * 6 + line.intercept)}
                stroke={[VIZ_COLORS.one, VIZ_COLORS.three, VIZ_COLORS.two][index % 3]}
                strokeWidth="2.6"
              />
            ))}
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              three lines, one common point
            </text>
          </>
        );
      }

      case "point-line-distance":
      case "parallel-distance":
      case "reflection-line": {
        const line = data.line ?? [1, -1, 0];
        const point = data.point ?? [4, 1];
        const drawLine = (coeffs, color) => {
          const [la, lb, lc] = coeffs;
          if (Math.abs(lb) > 1e-9) {
            return (
              <line
                x1={sx(-6)}
                y1={sy((lc - la * -6) / lb)}
                x2={sx(6)}
                y2={sy((lc - la * 6) / lb)}
                stroke={color}
                strokeWidth="2.6"
              />
            );
          }
          return <line x1={sx(lc / la)} y1={sy(-6)} x2={sx(lc / la)} y2={sy(6)} stroke={color} strokeWidth="2.6" />;
        };
        return (
          <>
            <GraphAxes {...view} />
            {drawLine(line, VIZ_COLORS.one)}
            {mode === "parallel-distance" && data.line2 ? drawLine(data.line2, VIZ_COLORS.three) : null}
            <Dot x={sx(Number(point[0]))} y={sy(Number(point[1]))} color={VIZ_COLORS.two} label={`(${point[0]}, ${point[1]})`} />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              {mode === "parallel-distance" ? "the distance is measured perpendicularly" : "the shortest path is perpendicular"}
            </text>
            {mode === "reflection-line" ? (
              <Dot x={sx(Number(point[0]))} y={sy(-Number(point[1]))} color={VIZ_COLORS.five} label="image" />
            ) : null}
          </>
        );
      }

      case "section-centroid": {
        const points = (data.points ?? [[0, 0], [6, 0], [0, 6]]).map((point) => point.map(Number));
        const centroid = points.reduce(
          (sum, [x, y]) => [sum[0] + x / points.length, sum[1] + y / points.length],
          [0, 0],
        );
        return (
          <>
            <GraphAxes {...view} />
            <polygon points={points.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")} fill={VIZ_COLORS.one} fillOpacity="0.12" stroke={VIZ_COLORS.one} strokeWidth="2.6" />
            {points.map(([x, y]) => (
              <Dot key={`${x}-${y}`} x={sx(x)} y={sy(y)} color={VIZ_COLORS.three} label={`(${x}, ${y})`} />
            ))}
            <Dot x={sx(centroid[0])} y={sy(centroid[1])} color={VIZ_COLORS.two} label={`centroid (${fmt(centroid[0], 2)}, ${fmt(centroid[1], 2)})`} />
          </>
        );
      }

      case "locus": {
        return (
          <>
            <GraphAxes {...view} />
            <circle cx={sx(0)} cy={sy(0)} r={Math.abs(sx(3) - sx(0))} fill={VIZ_COLORS.one} fillOpacity="0.1" stroke={VIZ_COLORS.one} strokeWidth="3" />
            <Dot x={sx(3)} y={sy(0)} color={VIZ_COLORS.two} label="distance = 3" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              locus: distance from (0, 0) equals 3
            </text>
          </>
        );
      }

      case "axes-transform": {
        const [shiftX, shiftY] = data.shift ?? [2, 1];
        return (
          <>
            <GraphAxes {...view} />
            <line x1={sx(-6 + shiftX)} y1={sy(shiftY)} x2={sx(6 + shiftX)} y2={sy(shiftY)} stroke={VIZ_COLORS.two} strokeWidth="2.4" strokeDasharray="6 5" />
            <line x1={sx(shiftX)} y1={sy(-6 + shiftY)} x2={sx(shiftX)} y2={sy(6 + shiftY)} stroke={VIZ_COLORS.two} strokeWidth="2.4" strokeDasharray="6 5" />
            <Dot x={sx(shiftX)} y={sy(shiftY)} color={VIZ_COLORS.two} label="new origin" />
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              shift the origin to ({shiftX}, {shiftY})
            </text>
          </>
        );
      }

      case "vertical-line":
      case "reflection-line-vertical": {
        const x = Number(data.x ?? 3);
        return (
          <>
            <GraphAxes {...view} />
            <line x1={sx(x)} y1={sy(-6)} x2={sx(x)} y2={sy(6)} stroke={VIZ_COLORS.one} strokeWidth="3" />
            <text x={sx(x) + 10} y={sy(4)} fontSize="14" fill={VIZ_COLORS.one}>x = {x}</text>
            <text x={PAD + 12} y={PAD + 22} fontSize="14" fill="var(--text-muted)">
              a vertical line has an undefined slope
            </text>
          </>
        );
      }

      case "projectile": {
        const speed = Number(data.speed ?? 20);
        const angle = Number(data.angle ?? 45);
        const theta = (angle * Math.PI) / 180;
        const g = 10;
        const range = (speed * speed * Math.sin(2 * theta)) / g;
        const peak = (speed * speed * Math.sin(theta) ** 2) / (2 * g);
        const trajectory = (x) => x * Math.tan(theta) - (g * x * x) / (2 * speed ** 2 * Math.cos(theta) ** 2);
        return (
          <>
            <GraphAxes {...view} />
            <path
              d={curvePath(trajectory, 0, range, sx, sy, 160)}
              fill="none"
              stroke={VIZ_COLORS.one}
              strokeWidth="3"
            />
            <line x1={sx(0)} y1={sy(0)} x2={sx(range)} y2={sy(0)} stroke="var(--border-strong)" strokeDasharray="6 4" />
            <Dot x={sx(range)} y={sy(0)} color={VIZ_COLORS.two} label={`range ${fmt(range, 1)} m`} />
            <Dot x={sx(range / 2)} y={sy(peak)} color={VIZ_COLORS.three} label={`peak ${fmt(peak, 1)} m`} />
          </>
        );
      }

      default:
        return <GraphAxes {...view} />;
    }
  })();

  return (
    <SceneShell
      footer={footer}
      label="Coordinate plane"
    >
      <SceneCanvas label="Coordinate plane">{body}</SceneCanvas>
    </SceneShell>
  );
}
