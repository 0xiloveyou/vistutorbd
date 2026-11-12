"use client";

import katex from "katex";
import { useMemo, useRef } from "react";
import { useLocale } from "@/providers/locale.provider";

const KEYS = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "=", "+"],
  ["(", ")", "^", "/"],
  ["√", "π", "θ", "∑"],
  ["∫", "≤", "≥", "≠"],
  ["x", "y", "a", "b"],
  ["{", "}", "[", "]"],
];

const REPLACEMENTS = {
  "×": "\\times ",
  "÷": "\\div ",
  "−": "-",
  "√": "\\sqrt{}",
  "π": "\\pi ",
  "θ": "\\theta ",
  "∑": "\\sum ",
  "∫": "\\int ",
  "≤": "\\le ",
  "≥": "\\ge ",
  "≠": "\\ne ",
};

export default function MathInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  rows = 3,
  showPreview = true,
}) {
  const { t } = useLocale();
  const inputRef = useRef(null);

  const preview = useMemo(() => {
    if (!value?.trim()) return "";
    try {
      return katex.renderToString(value, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return "";
    }
  }, [value]);

  const insert = (key) => {
    const token = REPLACEMENTS[key] ?? key;
    const input = inputRef.current;
    if (!input) {
      onChange(`${value ?? ""}${token}`);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      input.focus();
      const position = start + token.length;
      input.setSelectionRange(position, position);
    });
  };

  return (
    <div className="math-input">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        rows={rows}
        placeholder={placeholder ?? t("practice.typeAnswer")}
        spellCheck={false}
        inputMode="text"
      />

      {showPreview && preview ? (
        <div
          className="math-preview"
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      ) : null}

      <div className="math-keypad" role="group" aria-label="Math symbols">
        {KEYS.flat().map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => insert(key)}
            aria-label={key}
          >
            {key}
          </button>
        ))}
        <button type="button" className="key-wide" onClick={() => onChange("")}>
          ⌫ {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}