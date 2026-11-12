"use client";

import MathFormula from "./MathFormula";

const SPLIT = /(\$\$[^$]+\$\$|\$[^$]+\$)/g;

export default function RichMathText({ text }) {
  if (!text) return null;

  return (
    <span className="rich-text">
      {String(text)
        .split(SPLIT)
        .filter(Boolean)
        .map((part, index) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            return (
              <MathFormula key={index} formula={part.slice(2, -2)} block />
            );
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            return <MathFormula key={index} formula={part.slice(1, -1)} />;
          }
          return <span key={index}>{part}</span>;
        })}
    </span>
  );
}