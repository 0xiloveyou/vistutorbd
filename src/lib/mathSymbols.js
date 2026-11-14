/**
 * Maths toolbar data and caret-aware insertion helpers.
 *
 * A symbol is one of:
 *  - raw       plain text (calculator operators such as +, ×, ÷)
 *  - symbol    a single LaTeX token, inserted as `$...$`
 *  - power     applies an exponent to the selected text / token before the caret
 *  - subscript applies a subscript to the selected text / token before the caret
 *  - root      wraps the selection / previous token in a square or nth root
 *  - fraction  wraps the selection / previous token as the numerator
 *  - template  inserts a full LaTeX expression and selects a placeholder
 *
 * Keeping the definitions here means the forum composer, forum comments and the
 * AI chat all insert maths exactly the same way.
 */

const symbol = (label, title, latex) => ({
  label,
  title,
  kind: "symbol",
  latex,
});

const raw = (label, title, text) => ({ label, title, kind: "raw", text });

const power = (label, title, exponent) => ({
  label,
  title,
  kind: "power",
  exponent,
});

const subscript = (label, title, value) => ({
  label,
  title,
  kind: "subscript",
  value,
});

const root = (label, title, index) => ({
  label,
  title,
  kind: "root",
  ...(index ? { index } : {}),
});

const template = (label, title, latex, select) => ({
  label,
  title,
  kind: "template",
  latex,
  ...(select ? { select } : {}),
});

export const MATH_SYMBOL_GROUPS = [
  {
    id: "basic",
    label: "123",
    title: "Basic calculator signs",
    symbols: [
      raw("+", "Plus", " + "),
      raw("−", "Minus", " − "),
      raw("×", "Multiply", " × "),
      raw("÷", "Divide", " ÷ "),
      raw("=", "Equals", " = "),
      raw("≠", "Not equal", " ≠ "),
      raw("≈", "Approximately equal", " ≈ "),
      raw("±", "Plus or minus", " ± "),
      raw("<", "Less than", " < "),
      raw(">", "Greater than", " > "),
      raw("≤", "Less than or equal", " ≤ "),
      raw("≥", "Greater than or equal", " ≥ "),
      raw("%", "Percent", "%"),
      raw("(", "Open bracket", "("),
      raw(")", "Close bracket", ")"),
      raw("|", "Absolute value bar", "|"),
      raw("!", "Factorial", "!"),
      raw("°", "Degree", "°"),
    ],
  },
  {
    id: "numbers",
    label: "0–9",
    title: "Calculator digits",
    symbols: [
      raw("7", "Seven", "7"),
      raw("8", "Eight", "8"),
      raw("9", "Nine", "9"),
      raw("4", "Four", "4"),
      raw("5", "Five", "5"),
      raw("6", "Six", "6"),
      raw("1", "One", "1"),
      raw("2", "Two", "2"),
      raw("3", "Three", "3"),
      raw("0", "Zero", "0"),
      raw(".", "Decimal point", "."),
      raw(",", "Comma", ", "),
      raw("/", "Slash / division", "/"),
      raw("^", "Caret / power", "^"),
      raw("−0", "Negative sign", "−"),
      raw("0.00", "Decimal number", "0.00"),
    ],
  },
  {
    id: "power",
    label: "x²",
    title: "Powers and roots",
    symbols: [
      power("x²", "Square the selected value or the value before the caret", "2"),
      power("x³", "Cube the selected value or the value before the caret", "3"),
      power("xⁿ", "Raise to a power (edit n)", "n"),
      power("x⁻¹", "Reciprocal power", "-1"),
      root("√", "Square root of the selection or previous value"),
      root("∛", "Cube root of the selection or previous value", "3"),
      root("ⁿ√", "Nth root (edit n)", "n"),
      subscript("x₁", "Subscript 1", "1"),
      subscript("xᵢ", "Subscript i (edit i)", "i"),
      template("x!", "Factorial of x", "x!", "x"),
      template("1/x", "Reciprocal", "\\frac{1}{x}", "x"),
      symbol("e", "Euler's number", "e"),
    ],
  },
  {
    id: "fraction",
    label: "a/b",
    title: "Fractions and ratios",
    symbols: [
      { label: "a/b", title: "Fraction", kind: "fraction" },
      {
        label: "a/b + c/d",
        title: "Add two fractions",
        kind: "template",
        latex: "\\frac{a}{b} + \\frac{c}{d}",
        select: "a",
      },
      {
        label: "mixed",
        title: "Mixed number",
        kind: "template",
        latex: "a\\frac{b}{c}",
        select: "a",
      },
      {
        label: "large",
        title: "Large fraction",
        kind: "fraction",
        command: "dfrac",
      },
      template("nCr", "Combination", "\\binom{n}{r}", "n"),
      raw(":", "Ratio sign", " : "),
      raw("∶", "Ratio sign", " ∶ "),
      raw("∴", "Therefore", " ∴ "),
      raw("∵", "Because", " ∵ "),
    ],
  },
  {
    id: "algebra",
    label: "x",
    title: "Algebra",
    symbols: [
      symbol("x", "Variable x", "x"),
      symbol("y", "Variable y", "y"),
      symbol("a", "Variable a", "a"),
      symbol("b", "Variable b", "b"),
      symbol("π", "Pi", "\\pi"),
      symbol("∞", "Infinity", "\\infty"),
      symbol("∝", "Proportional to", "\\propto"),
      symbol("≡", "Identical to", "\\equiv"),
      symbol("∼", "Similar to", "\\sim"),
      template("x²+y²", "Circle equation", "x^2 + y^2 = r^2", "r"),
      template(
        "a²+b²",
        "Pythagoras theorem",
        "a^2 + b^2 = c^2",
        "a",
      ),
      template("√2", "Square root of 2", "\\sqrt{2}", "2"),
      template(
        "quadratic",
        "Quadratic formula",
        "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        "b",
      ),
    ],
  },
  {
    id: "geometry",
    label: "△",
    title: "Geometry",
    symbols: [
      symbol("∠", "Angle", "\\angle"),
      symbol("△", "Triangle", "\\triangle"),
      symbol("⊥", "Perpendicular", "\\perp"),
      symbol("∥", "Parallel", "\\parallel"),
      symbol("≅", "Congruent", "\\cong"),
      symbol("∼", "Similar", "\\sim"),
      symbol("⊙", "Circle", "\\odot"),
      symbol("°", "Degree", "^{\\circ}"),
      template("∠ABC", "Named angle", "\\angle ABC", "ABC"),
      template("△ABC", "Named triangle", "\\triangle ABC", "ABC"),
      template("AB", "Line segment", "\\overline{AB}", "AB"),
      template("→AB", "Vector", "\\vec{AB}", "AB"),
      template("arc AB", "Arc", "\\overset{\\frown}{AB}", "AB"),
    ],
  },
  {
    id: "calculus",
    label: "∫",
    title: "Calculus",
    symbols: [
      template(
        "∫",
        "Definite integral",
        "\\int_{a}^{b} f(x)\\,dx",
        "a",
      ),
      template(
        "∫ dx",
        "Indefinite integral",
        "\\int f(x)\\,dx",
        "f",
      ),
      template(
        "∬",
        "Double integral",
        "\\iint_{D} f(x,y)\\,dA",
        "D",
      ),
      symbol("∂", "Partial derivative", "\\partial"),
      symbol("Δ", "Delta / change", "\\Delta"),
      symbol("∇", "Nabla / gradient", "\\nabla"),
      template(
        "dy/dx",
        "Derivative",
        "\\frac{dy}{dx}",
        "y",
      ),
      template(
        "d/dx",
        "Derivative operator",
        "\\frac{d}{dx}\\left( f(x) \\right)",
        "f",
      ),
      template(
        "lim",
        "Limit",
        "\\lim_{x \\to a} f(x)",
        "a",
      ),
      template(
        "∑",
        "Summation",
        "\\sum_{i=1}^{n} a_i",
        "i",
      ),
      template(
        "∏",
        "Product",
        "\\prod_{i=1}^{n} a_i",
        "i",
      ),
      raw("′", "Prime", "′"),
    ],
  },
  {
    id: "trigonometry",
    label: "sin",
    title: "Trigonometry",
    symbols: [
      template("sin", "Sine", "\\sin(\\theta)", "\\theta"),
      template("cos", "Cosine", "\\cos(\\theta)", "\\theta"),
      template("tan", "Tangent", "\\tan(\\theta)", "\\theta"),
      template("cot", "Cotangent", "\\cot(\\theta)", "\\theta"),
      template("sec", "Secant", "\\sec(\\theta)", "\\theta"),
      template("csc", "Cosecant", "\\csc(\\theta)", "\\theta"),
      template(
        "sin²",
        "Sine squared",
        "\\sin^2(\\theta)",
        "\\theta",
      ),
      template(
        "identity",
        "Pythagorean identity",
        "\\sin^2\\theta + \\cos^2\\theta = 1",
        "\\theta",
      ),
      symbol("θ", "Theta", "\\theta"),
      symbol("α", "Alpha", "\\alpha"),
      symbol("β", "Beta", "\\beta"),
      symbol("γ", "Gamma", "\\gamma"),
      symbol("φ", "Phi", "\\phi"),
      symbol("ω", "Omega", "\\omega"),
    ],
  },
  {
    id: "sets",
    label: "∈",
    title: "Sets and logic",
    symbols: [
      symbol("∈", "Element of", "\\in"),
      symbol("∉", "Not an element of", "\\notin"),
      symbol("⊂", "Subset", "\\subset"),
      symbol("⊆", "Subset or equal", "\\subseteq"),
      symbol("∪", "Union", "\\cup"),
      symbol("∩", "Intersection", "\\cap"),
      symbol("∅", "Empty set", "\\varnothing"),
      symbol("∀", "For all", "\\forall"),
      symbol("∃", "There exists", "\\exists"),
      symbol("⇒", "Implies", "\\Rightarrow"),
      symbol("⇔", "If and only if", "\\Leftrightarrow"),
      symbol("¬", "Not", "\\neg"),
      symbol("ℕ", "Natural numbers", "\\mathbb{N}"),
      symbol("ℤ", "Integers", "\\mathbb{Z}"),
      symbol("ℚ", "Rational numbers", "\\mathbb{Q}"),
      symbol("ℝ", "Real numbers", "\\mathbb{R}"),
      template("set", "Set of values", "\\{a, b, c\\}", "a"),
      template("P(A)", "Probability", "P(A)", "A"),
    ],
  },
  {
    id: "matrices",
    label: "▦",
    title: "Matrices and complex numbers",
    symbols: [
      template(
        "matrix 2×2",
        "Two by two matrix",
        "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
        " a ",
      ),
      template(
        "matrix 2×3",
        "Two by three matrix",
        "\\begin{bmatrix} a & b & c \\\\ d & e & f \\end{bmatrix}",
        " a ",
      ),
      template(
        "det",
        "Determinant",
        "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}",
        " a ",
      ),
      template(
        "column",
        "Column vector",
        "\\begin{pmatrix} x \\\\ y \\end{pmatrix}",
        " x ",
      ),
      symbol("i", "Imaginary unit", "i"),
      template("a+bi", "Complex number", "a + bi", "a"),
      template("z̄", "Complex conjugate", "\\overline{z}", "z"),
      template("Aᵀ", "Matrix transpose", "A^{T}", "A"),
      template("A⁻¹", "Matrix inverse", "A^{-1}", "A"),
      template("|A|", "Determinant of A", "\\left| A \\right|", "A"),
    ],
  },
];

export const MATH_SYMBOLS = MATH_SYMBOL_GROUPS.flatMap((group) => group.symbols);

const TOKEN_BEFORE =
  /(\\[a-zA-Z]+|\d+(?:\.\d+)?|[A-Za-zΑ-Ωα-ω]|\)|\]|\})$/u;

const tokenBefore = (value, position) => {
  const before = value.slice(0, position);
  const math = before.match(/\$([^$]+)\$$/u);

  if (math) {
    return { token: math[1], start: position - math[0].length };
  }

  const match = before.match(TOKEN_BEFORE);

  if (!match) return null;

  return { token: match[0], start: position - match[0].length };
};

const latexFor = (value) => `$${value}$`;

const insertAt = (value, start, end, replacement, selectText) => {
  const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
  let from = start + replacement.length;
  let to = from;

  if (selectText) {
    const index = replacement.indexOf(selectText);
    if (index >= 0) {
      from = start + index;
      to = from + selectText.length;
    }
  }

  return { value: next, selectionStart: from, selectionEnd: to };
};

/**
 * Applies a toolbar symbol at the current selection.
 * Returns the new value plus the caret/selection range to restore.
 */
export function insertMathSymbol(value, selectionStart, selectionEnd, item) {
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? start;
  const selected = value.slice(start, end);
  const previous = selected ? null : tokenBefore(value, start);

  if (item.kind === "raw") {
    return insertAt(value, start, end, item.text ?? item.label);
  }

  if (item.kind === "symbol") {
    return insertAt(value, start, end, latexFor(item.latex ?? item.label));
  }

  if (item.kind === "power" || item.kind === "subscript") {
    const base = selected || previous?.token;
    const baseStart = selected ? start : (previous?.start ?? start);
    const marker = item.kind === "power" ? "^" : "_";
    const body = item.kind === "power" ? item.exponent : item.value;

    if (base) {
      const replacement = latexFor(`${base}${marker}{${body}}`);
      const shouldSelectBody = body !== "2" && body !== "3" && body !== "-1";

      return insertAt(
        value,
        baseStart,
        end,
        replacement,
        shouldSelectBody ? body : undefined,
      );
    }

    const replacement = latexFor(`x${marker}{${body}}`);
    return insertAt(
      value,
      start,
      end,
      replacement,
      body !== "2" && body !== "3" && body !== "-1" ? body : undefined,
    );
  }

  if (item.kind === "root") {
    const base = selected || previous?.token || "x";
    const baseStart = selected ? start : (previous?.start ?? start);
    const index = item.index ? `[${item.index}]` : "";
    const replacement = latexFor(`\\sqrt${index}{${base}}`);
    const selectText = item.index === "n" ? "n" : base === "x" ? "x" : undefined;

    return insertAt(value, baseStart, end, replacement, selectText);
  }

  if (item.kind === "fraction") {
    const base = selected || previous?.token;
    const baseStart = selected ? start : (previous?.start ?? start);
    const command = item.command ?? "frac";

    if (base) {
      return insertAt(
        value,
        baseStart,
        end,
        latexFor(`\\${command}{${base}}{b}`),
        "b",
      );
    }

    return insertAt(value, start, end, latexFor(`\\${command}{a}{b}`), "a");
  }

  if (item.kind === "template") {
    return insertAt(value, start, end, latexFor(item.latex), item.select);
  }

  return insertAt(value, start, end, item.label);
}

export const mathSymbolsText = (item) => {
  if (item.kind === "raw") return item.text ?? item.label;
  if (item.kind === "template") return `$${item.latex}$`;
  if (item.kind === "power" || item.kind === "subscript") {
    return `$x^{${item.exponent ?? item.value}}$`;
  }
  if (item.kind === "root") return `$\\sqrt{x}$`;
  if (item.kind === "fraction") return "$\\frac{a}{b}$";
  return `$${item.latex ?? item.label}$`;
};
