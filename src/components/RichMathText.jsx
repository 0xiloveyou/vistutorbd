"use client";

import MathFormula from "./MathFormula";

const SPLIT =
  /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\))/g;

/**
 * Splits a value into plain-text and LaTeX parts while keeping the source
 * offsets, so interactive previews can map a caret back to the textarea.
 */
export function splitMathParts(value) {
  const text = String(value ?? "");
  const parts = [];
  const regex = new RegExp(SPLIT.source, "g");
  let last = 0;
  let match = regex.exec(text);

  while (match) {
    if (match.index > last) {
      parts.push({
        kind: "text",
        text: text.slice(last, match.index),
        start: last,
        end: match.index,
      });
    }
    parts.push({
      kind: "math",
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    last = match.index + match[0].length;
    match = regex.exec(text);
  }

  if (last < text.length) {
    parts.push({
      kind: "text",
      text: text.slice(last),
      start: last,
      end: text.length,
    });
  }

  return parts;
}

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
          if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return (
              <MathFormula key={index} formula={part.slice(2, -2)} block />
            );
          }
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return <MathFormula key={index} formula={part.slice(2, -2)} />;
          }
          if (part.startsWith("$") && part.endsWith("$")) {
            return <MathFormula key={index} formula={part.slice(1, -1)} />;
          }
          return <span key={index}>{part}</span>;
        })}
    </span>
  );
}
