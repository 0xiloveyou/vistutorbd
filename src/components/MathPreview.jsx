"use client";

import { useLocale } from "@/providers/locale.provider";
import { useMemo } from "react";
import RichMathText, { splitMathParts } from "./RichMathText";

// Arguments of these commands are configuration, not editable values.
const SKIP_COMMANDS = new Set([
  "begin",
  "end",
  "color",
  "colorbox",
  "fcolorbox",
  "href",
  "htmlClass",
  "htmlData",
  "htmlId",
  "htmlStyle",
  "includegraphics",
  "label",
  "tag",
  "textcolor",
  "url",
]);

function innerRange(text) {
  if (text.startsWith("$$") && text.endsWith("$$")) {
    return [2, text.length - 2];
  }
  if (text.startsWith("\\[") && text.endsWith("\\]")) {
    return [2, text.length - 2];
  }
  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    return [2, text.length - 2];
  }
  if (text.startsWith("$") && text.endsWith("$")) {
    return [1, text.length - 1];
  }
  return [0, text.length];
}

/**
 * Finds the editable values inside one formula: `{...}` arguments (a in
 * `\int_{a}^{b}`, the numerator of a fraction, …) plus bare single-character
 * exponents and subscripts such as `x^2`.
 */
function findSlots(text, innerStart, innerEnd) {
  const source = text.slice(innerStart, innerEnd);
  const slots = [];
  const ranges = [];
  const stack = [];

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];

    if (char === "\\") {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push(index);
      continue;
    }

    if (char !== "}") continue;

    const open = stack.pop();
    if (open === undefined) continue;

    const content = source.slice(open + 1, index);
    if (!content.trim()) continue;

    const command = source.slice(0, open).match(/\\([a-zA-Z]+)\s*$/)?.[1];
    if (command && SKIP_COMMANDS.has(command)) continue;

    const start = innerStart + open + 1;
    ranges.push([start, innerStart + index]);
    slots.push({ start, end: innerStart + index, marker: null, replaceStart: start });
  }

  const marker = /[\^_]([A-Za-z0-9])/g;
  let match = marker.exec(source);

  while (match) {
    const charStart = innerStart + match.index + 1;
    const charEnd = charStart + 1;
    const covered = ranges.some(
      ([rangeStart, rangeEnd]) => charStart >= rangeStart && charEnd <= rangeEnd,
    );

    if (source[match.index - 1] !== "\\" && !covered) {
      slots.push({
        start: charStart,
        end: charEnd,
        marker: source[match.index],
        replaceStart: innerStart + match.index,
      });
    }

    match = marker.exec(source);
  }

  return slots.sort((a, b) => a.start - b.start);
}

/**
 * One atom per rendered unit. Plain text is split per character so the caret
 * can sit between letters; LaTeX is one atom because KaTeX renders it as a
 * single visual block, but it carries its editable slots.
 */
function buildAtoms(text) {
  const atoms = [];

  for (const part of splitMathParts(text)) {
    if (part.kind === "math") {
      const [innerStart, innerEnd] = innerRange(part.text);
      atoms.push({
        kind: "math",
        text: part.text,
        start: part.start,
        end: part.end,
        slots: findSlots(part.text, innerStart, innerEnd),
      });
      continue;
    }

    let offset = part.start;
    for (const char of Array.from(part.text)) {
      atoms.push({
        kind: "text",
        text: char,
        start: offset,
        end: offset + char.length,
      });
      offset += char.length;
    }
  }

  return atoms;
}

/**
 * Live preview for LaTeX-typed answers. Shared by the forum composer, forum
 * comments and the AI chat so all three render maths exactly the same way.
 *
 * Pass `selection` + `onSelect` to turn it into a caret-aware expression
 * viewer: clicking a symbol or using the arrow pad moves the textarea caret,
 * and the arrows inside a formula land on every editable value (a, b, x …).
 */
export default function MathPreview({
  text,
  label,
  compact = false,
  editable = false,
  selection = null,
  onSelect,
}) {
  const { t } = useLocale();
  const value = String(text ?? "");
  const interactive = editable && typeof onSelect === "function";

  const atoms = useMemo(() => buildAtoms(value), [value]);

  const stops = useMemo(() => {
    const raw = [];

    for (const atom of atoms) {
      raw.push({ start: atom.start, end: atom.start });

      if (atom.slots?.length) {
        for (const slot of atom.slots) {
          raw.push({
            start: atom.start + slot.start,
            end: atom.start + slot.end,
          });
        }
      }

      raw.push({ start: atom.end, end: atom.end });
    }

    raw.push({ start: value.length, end: value.length });

    const seen = new Set();
    return raw
      .filter(
        (stop) =>
          stop.start >= 0 && stop.end <= value.length && stop.start <= stop.end,
      )
      .filter((stop) => {
        const key = `${stop.start}:${stop.end}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.start - b.start || a.end - b.end);
  }, [atoms, value.length]);

  if (!value.includes("$")) return null;

  const start = selection?.start ?? 0;
  const end = selection?.end ?? start;
  const collapsed = start === end;

  const select = (range) => {
    if (!interactive || !range) return;
    onSelect({ start: range.start, end: range.end });
  };

  const moveTo = (offset) => {
    if (offset == null) return;
    const next = Math.max(0, Math.min(value.length, offset));
    select({ start: next, end: next });
  };

  const moveHorizontal = (direction) => {
    const currentIndex = stops.findIndex(
      (stop) => stop.start === start && stop.end === end,
    );

    if (currentIndex !== -1) {
      select(stops[currentIndex + direction]);
      return;
    }

    // A selection made outside the preview (e.g. dragged in the textarea)
    // collapses first, like a normal text field.
    if (!collapsed) {
      moveTo(direction < 0 ? start : end);
      return;
    }

    const next =
      direction < 0
        ? [...stops].reverse().find((stop) => stop.end <= start && stop.start < start)
        : stops.find((stop) => stop.start >= end && stop.end > end);

    select(next);
  };

  const moveVertical = (direction) => {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const column = start - lineStart;

    if (direction < 0) {
      if (lineStart === 0) return;
      const previousEnd = lineStart - 1;
      const previousStart = value.lastIndexOf("\n", previousEnd - 1) + 1;
      moveTo(Math.min(previousStart + column, previousEnd));
      return;
    }

    const lineEnd = value.indexOf("\n", start);
    if (lineEnd === -1) return;
    const nextStart = lineEnd + 1;
    const nextEndIndex = value.indexOf("\n", nextStart);
    const nextEnd = nextEndIndex === -1 ? value.length : nextEndIndex;
    moveTo(Math.min(nextStart + column, nextEnd));
  };

  const handleAtomClick = (event, atom) => {
    if (!interactive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const before = event.clientX < rect.left + rect.width / 2;
    const offset = before ? atom.start : atom.end;
    moveTo(offset);
  };

  const nodes = [];
  let caretRendered = false;

  atoms.forEach((atom, index) => {
    if (interactive && collapsed && !caretRendered && atom.start >= start) {
      nodes.push(
        <span
          key={`caret-${index}`}
          className="math-preview-caret"
          aria-hidden="true"
        />,
      );
      caretRendered = true;
    }

    const activeSlot = atom.slots?.find(
      (slot) =>
        atom.start + slot.start === start && atom.start + slot.end === end,
    );

    const isSelected =
      interactive &&
      !collapsed &&
      !activeSlot &&
      atom.start < end &&
      atom.end > start;

    let content;

    if (atom.kind === "math") {
      let formula = atom.text;

      if (activeSlot) {
        const replacement = `\\boxed{${atom.text.slice(activeSlot.start, activeSlot.end)}}`;
        const boxed = activeSlot.marker
          ? `${activeSlot.marker}{${replacement}}`
          : replacement;

        formula =
          atom.text.slice(0, activeSlot.replaceStart) +
          boxed +
          atom.text.slice(activeSlot.end);
      }

      content = <RichMathText text={formula} />;
    } else {
      content = atom.text;
    }

    nodes.push(
      <span
        key={`atom-${atom.start}-${index}`}
        className={
          isSelected ? "math-preview-atom is-selected" : "math-preview-atom"
        }
        onClick={interactive ? (event) => handleAtomClick(event, atom) : undefined}
      >
        {content}
      </span>,
    );
  });

  if (interactive && collapsed && !caretRendered) {
    nodes.push(
      <span key="caret-end" className="math-preview-caret" aria-hidden="true" />,
    );
  }

  return (
    <div
      className={compact ? "math-preview compact" : "math-preview"}
      aria-live="polite"
    >
      {label || interactive ? (
        <div className="math-preview-head">
          {label ? <span className="eyebrow">{label}</span> : <span />}
          {interactive ? (
            <div
              className="math-preview-nav"
              role="group"
              aria-label={t("mathPreview.cursor")}
            >
              <button
                type="button"
                className="math-preview-nav-up"
                aria-label={t("mathPreview.moveUp")}
                title={t("mathPreview.moveUp")}
                onClick={() => moveVertical(-1)}
              >
                ▲
              </button>
              <button
                type="button"
                className="math-preview-nav-left"
                aria-label={t("mathPreview.moveLeft")}
                title={t("mathPreview.moveLeft")}
                onClick={() => moveHorizontal(-1)}
              >
                ◀
              </button>
              <button
                type="button"
                className="math-preview-nav-down"
                aria-label={t("mathPreview.moveDown")}
                title={t("mathPreview.moveDown")}
                onClick={() => moveVertical(1)}
              >
                ▼
              </button>
              <button
                type="button"
                className="math-preview-nav-right"
                aria-label={t("mathPreview.moveRight")}
                title={t("mathPreview.moveRight")}
                onClick={() => moveHorizontal(1)}
              >
                ▶
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="math-preview-body">{nodes}</div>
    </div>
  );
}
