"use client";

import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import MathFormula from "./MathFormula";
import RichMathText from "./RichMathText";

const LABELS = {
  text: "Text",
  formula: "Formula",
  example: "Example",
  visualization: "Visualization",
  callout: "Note",
  quiz: "Check yourself",
};

export default function TopicLesson({ blocks = [] }) {
  const { locale, t } = useLocale();

  if (!blocks.length) {
    return (
      <div className="empty-panel">
        <h2>{t("common.empty")}</h2>
        <p>{t("topic.noLesson")}</p>
      </div>
    );
  }

  return (
    <div className="lesson-stack">
      {[...blocks]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((block) => (
          <article
            key={block.id}
            className={`lesson-block ${block.type === "callout" ? "callout" : ""} ${
              block.type === "formula" ? "formula" : ""
            }`}
          >
            <span className="block-type">{LABELS[block.type] ?? block.type}</span>
            {block.title ? <h3>{localized(block.title, locale)}</h3> : null}
            {block.body ? (
              <p>
                <RichMathText text={localized(block.body, locale)} />
              </p>
            ) : null}
            {block.formula ? <MathFormula formula={block.formula} block /> : null}
            {block.vizId ? <span className="badge">{block.vizId}</span> : null}
          </article>
        ))}
    </div>
  );
}