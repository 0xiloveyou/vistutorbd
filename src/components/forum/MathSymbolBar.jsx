"use client";

import { MATH_SYMBOL_GROUPS } from "@/lib/mathSymbols";
import { useState } from "react";

export default function MathSymbolBar({ onInsert, compact = false }) {
  const [active, setActive] = useState(MATH_SYMBOL_GROUPS[0].id);
  const group =
    MATH_SYMBOL_GROUPS.find((item) => item.id === active) ??
    MATH_SYMBOL_GROUPS[0];

  return (
    <div
      className={compact ? "math-symbol-bar compact" : "math-symbol-bar"}
      role="toolbar"
      aria-label="Math symbols"
    >
      <div className="math-symbol-tabs">
        {MATH_SYMBOL_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === active ? "math-symbol-tab active" : "math-symbol-tab"
            }
            title={item.title}
            aria-pressed={item.id === active}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="math-symbol-grid">
        {group.symbols.map((item) => (
          <button
            key={`${group.id}-${item.label}-${item.title}`}
            type="button"
            className="math-symbol"
            title={item.title}
            onClick={() => onInsert(item)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
