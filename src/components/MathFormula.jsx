"use client";

import katex from "katex";
import { useMemo } from "react";

export default function MathFormula({ formula, block = false }) {
  const html = useMemo(() => {
    if (!formula) return "";
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: block,
        output: "html",
      });
    } catch {
      return "";
    }
  }, [formula, block]);

  if (!html) return <code className="formula-fallback">{formula}</code>;

  return (
    <span
      className={block ? "math-formula block" : "math-formula"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}