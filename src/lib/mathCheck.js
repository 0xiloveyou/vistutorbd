// Small client-side helper used only for guest practice feedback.
// Signed-in attempts are always re-checked by the backend math engine.

const normalize = (input) =>
  String(input ?? "")
    .trim()
    .replace(/[×✕]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "");

const evaluate = (expression) => {
  const input = normalize(expression);
  if (!input || !/^[0-9+\-*/^().]+$/.test(input) || input.length > 80) {
    return null;
  }

  let index = 0;
  const peek = () => input[index];
  const consume = () => input[index++];

  const parseNumber = () => {
    let value = "";
    if (peek() === "(") {
      consume();
      const nested = parseExpression();
      if (peek() === ")") consume();
      return nested;
    }
    while (peek() !== undefined && /[0-9.]/.test(peek())) value += consume();
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const parsePower = () => {
    const base = parseNumber();
    if (peek() === "^") {
      consume();
      return base ** parsePower();
    }
    return base;
  };

  const parseTerm = () => {
    let value = parsePower();
    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const next = parsePower();
      value = operator === "*" ? value * next : value / next;
    }
    return value;
  };

  const parseExpression = () => {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const next = parseTerm();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  };

  const result = parseExpression();
  return Number.isFinite(result) ? result : null;
};

export const answersEquivalent = (submitted, expected) => {
  const a = evaluate(submitted);
  const b = evaluate(expected);
  if (a !== null && b !== null) return Math.abs(a - b) < 1e-9;
  return normalize(submitted).toLowerCase() === normalize(expected).toLowerCase();
};