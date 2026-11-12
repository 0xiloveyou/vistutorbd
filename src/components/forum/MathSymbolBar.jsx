"use client";

const SYMBOLS = [
  { label: "x²", title: "Power", value: "$x^{2}$" },
  { label: "√", title: "Square root", value: "$\\sqrt{x}$" },
  { label: "a/b", title: "Fraction", value: "$\\frac{a}{b}$" },
  { label: "∑", title: "Sum", value: "$\\sum_{i=1}^{n}$" },
  { label: "∫", title: "Integral", value: "$\\int_{a}^{b}$" },
  { label: "π", title: "Pi", value: "$\\pi$" },
  { label: "≤", title: "Less or equal", value: "$\\le$" },
  { label: "≠", title: "Not equal", value: "$\\ne$" },
  { label: "∞", title: "Infinity", value: "$\\infty$" },
  { label: "θ", title: "Theta", value: "$\\theta$" },
  { label: "matrix", title: "Matrix", value: "$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$" },
];

export default function MathSymbolBar({ onInsert }) {
  return (
    <div className="math-symbol-bar" role="toolbar" aria-label="Math symbols">
      {SYMBOLS.map((symbol) => (
        <button
          key={symbol.label}
          type="button"
          className="math-symbol"
          title={symbol.title}
          onClick={() => onInsert(symbol.value)}
        >
          {symbol.label}
        </button>
      ))}
    </div>
  );
}
