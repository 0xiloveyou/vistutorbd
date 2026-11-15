/**
 * Tiny expression compiler for the visualization renderers.
 *
 * The seeded lesson data stores plain expressions such as `x^2 - 5x + 6`,
 * `2^x` or `(x - 1)/(x + 2)`. We only need to sample them for a graph, so this
 * keeps a deliberately small grammar and never evaluates arbitrary JS.
 */

const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  log: Math.log10,
  log10: Math.log10,
  ln: Math.log,
  log2: Math.log2,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

function tokenize(source) {
  const text = String(source ?? "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\div/g, "/")
    .replace(/\\pi/g, "pi")
    .replace(/\\theta/g, "theta")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\sqrt/g, "sqrt")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, "");

  const tokens = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (/[0-9.]/.test(char)) {
      let number = "";
      while (index < text.length && /[0-9.]/.test(text[index])) {
        number += text[index];
        index += 1;
      }
      tokens.push({ type: "number", value: Number(number) });
      continue;
    }

    if (/[a-zA-Z]/.test(char)) {
      let name = "";
      while (index < text.length && /[a-zA-Z0-9_]/.test(text[index])) {
        name += text[index];
        index += 1;
      }
      tokens.push({ type: "name", value: name.toLowerCase() });
      continue;
    }

    if ("+-*/^()".includes(char)) {
      tokens.push({ type: "op", value: char });
      index += 1;
      continue;
    }

    // Unknown symbol (¿, ≤, …): stop parsing rather than guessing.
    tokens.push({ type: "op", value: "#" });
    index += 1;
  }

  return tokens;
}

function parse(tokens) {
  let position = 0;

  const peek = () => tokens[position];
  const next = () => tokens[position++];

  const parseExpression = () => {
    let left = parseTerm();
    while (peek() && peek().type === "op" && (peek().value === "+" || peek().value === "-")) {
      const operator = next().value;
      const right = parseTerm();
      left = { type: "binary", operator, left, right };
    }
    return left;
  };

  const startsPrimary = (token) =>
    token && (token.type === "number" || token.type === "name" || token.value === "(");

  const parseTerm = () => {
    let left = parseUnary();
    while (peek()) {
      const token = peek();
      if (token.type === "op" && (token.value === "*" || token.value === "/")) {
        const operator = next().value;
        const right = parseUnary();
        left = { type: "binary", operator, left, right };
        continue;
      }
      // Implicit multiplication: 5x, 2(x+1), x sin(x).
      if (startsPrimary(token)) {
        const right = parseUnary();
        left = { type: "binary", operator: "*", left, right };
        continue;
      }
      break;
    }
    return left;
  };

  const parseUnary = () => {
    const token = peek();
    if (token && token.type === "op" && (token.value === "+" || token.value === "-")) {
      next();
      const argument = parseUnary();
      return token.value === "-"
        ? { type: "unary", operator: "-", argument }
        : argument;
    }
    return parsePower();
  };

  const parsePower = () => {
    const base = parsePrimary();
    if (peek() && peek().type === "op" && peek().value === "^") {
      next();
      // Right-associative, and the exponent may itself be unary.
      const exponent = parseUnary();
      return { type: "binary", operator: "^", left: base, right: exponent };
    }
    return base;
  };

  const parsePrimary = () => {
    const token = next();
    if (!token) return { type: "number", value: 0 };

    if (token.type === "number") return { type: "number", value: token.value };

    if (token.type === "name") {
      const name = token.value;
      if (peek() && peek().value === "(") {
        next();
        const argument = parseExpression();
        if (peek() && peek().value === ")") next();
        return { type: "call", name, argument };
      }
      return { type: "variable", name };
    }

    if (token.value === "(") {
      const inner = parseExpression();
      if (peek() && peek().value === ")") next();
      return inner;
    }

    return { type: "number", value: 0 };
  };

  return parseExpression();
}

function evaluate(node, x) {
  if (!node) return NaN;

  switch (node.type) {
    case "number":
      return node.value;
    case "variable": {
      const { name } = node;
      if (name === "x") return x;
      if (name === "theta" || name === "t") return x;
      if (name in CONSTANTS) return CONSTANTS[name];
      return NaN;
    }
    case "unary":
      return -evaluate(node.argument, x);
    case "call": {
      const fn = FUNCTIONS[node.name];
      if (!fn) return NaN;
      return fn(evaluate(node.argument, x));
    }
    case "binary": {
      const left = evaluate(node.left, x);
      const right = evaluate(node.right, x);
      switch (node.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return right === 0 ? NaN : left / right;
        case "^":
          return Math.pow(left, right);
        default:
          return NaN;
      }
    }
    default:
      return NaN;
  }
}

/**
 * Compiles an expression to `(x) => y`. Returns a function that yields NaN for
 * anything outside the supported grammar so graphs can simply skip points.
 */
export function compileExpression(source) {
  if (!source) return () => NaN;

  try {
    const node = parse(tokenize(source));
    return (x) => {
      const value = evaluate(node, x);
      return Number.isFinite(value) ? value : NaN;
    };
  } catch {
    return () => NaN;
  }
}

/** Numeric derivative, used for tangent lines and slope readouts. */
export function derivativeOf(fn, x, h = 1e-4) {
  const a = fn(x + h);
  const b = fn(x - h);
  const value = (a - b) / (2 * h);
  return Number.isFinite(value) ? value : NaN;
}

/** Collects sign-change roots by scanning an interval. */
export function approximateRoots(fn, from, to, samples = 400) {
  const roots = [];
  let previousX = from;
  let previousY = fn(from);

  for (let index = 1; index <= samples; index += 1) {
    const x = from + ((to - from) * index) / samples;
    const y = fn(x);

    if (Number.isFinite(previousY) && Number.isFinite(y)) {
      if (previousY === 0) roots.push(Number(previousX.toFixed(3)));
      else if (y === 0) roots.push(Number(x.toFixed(3)));
      else if (previousY * y < 0) {
        let low = previousX;
        let high = x;
        for (let step = 0; step < 40; step += 1) {
          const mid = (low + high) / 2;
          const value = fn(mid);
          if (previousY * value <= 0) high = mid;
          else low = mid;
        }
        roots.push(Number(((low + high) / 2).toFixed(3)));
      }
    }

    previousX = x;
    previousY = y;
  }

  return roots.filter(
    (root, index) => index === 0 || Math.abs(root - roots[index - 1]) > 0.05,
  );
}

/**
 * Reads a simple two-variable linear equation (`2x + 3y = 6`, `x - y = 1`)
 * as `y = mx + c`. Returns null when the equation is not linear in y.
 */
export function linearFromEquation(source) {
  const text = String(source ?? "")
    .replace(/\s+/g, "")
    .replace(/−/g, "-");
  const [lhsRaw, rhsRaw] = text.split("=");
  if (!lhsRaw || rhsRaw === undefined) return null;

  const lhs = lhsRaw;
  const rhs = rhsRaw;
  const sides = [
    { text: lhs, sign: 1 },
    { text: rhs, sign: -1 },
  ];

  let xCoefficient = 0;
  let yCoefficient = 0;
  let constant = 0;

  for (const side of sides) {
    const tokens = side.text
      .replace(/-/g, "+-")
      .split("+")
      .filter(Boolean);

    for (const token of tokens) {
      const signed = token;
      const match = signed.match(/^([+-]?)(\d*\.?\d*)([xy]?)$/);
      if (!match) return null;
      const [, sign, numberText, variable] = match;
      const magnitude = numberText === "" || numberText === "." ? 1 : Number(numberText);
      const value = (sign === "-" ? -1 : 1) * magnitude * side.sign;

      if (variable === "x") xCoefficient += value;
      else if (variable === "y") yCoefficient += value;
      else constant += value;
    }
  }

  if (!Number.isFinite(xCoefficient) || !Number.isFinite(yCoefficient)) return null;
  if (yCoefficient === 0) return null;

  return {
    slope: -xCoefficient / yCoefficient,
    intercept: -constant / yCoefficient,
  };
}
