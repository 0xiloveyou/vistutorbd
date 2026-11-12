"use client";

import RichMathText from "@/components/RichMathText";
import MathFormula from "@/components/MathFormula";
import { useAskCompanion } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useClassSelection } from "@/providers/class.provider";
import { useCompanion } from "@/providers/companion.provider";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useState } from "react";
import CompanionRobot from "./CompanionRobot";

/**
 * Companion mode for the visualization player. Bolt stands beside the stage,
 * narrates the visible step, and can ask the grounded AI companion for a
 * deeper explanation. The step context is also published to the dock chat.
 */
export default function CompanionStage({
  vizId,
  topicSlug,
  step,
  stepIndex,
  steps,
  onAsk,
}) {
  const { locale, t } = useLocale();
  const { bandId } = useClassSelection();
  const { setContext, setChatOpen } = useCompanion();
  const ask = useAskCompanion();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const narration =
    step?.narration?.[locale] || step?.narration?.en || step?.formula || "";
  const total = steps?.length ?? 0;
  const side = stepIndex % 2 === 0 ? "left" : "right";

  useEffect(() => {
    setContext({
      vizId,
      topicSlug,
      stepIndex,
      narration,
    });
  }, [vizId, topicSlug, stepIndex, narration, setContext]);

  useEffect(() => {
    setAnswer("");
    setError("");
  }, [stepIndex]);

  const explain = async () => {
    if (ask.isPending) return;
    setError("");
    setAnswer("");

    try {
      const result = await ask.mutateAsync({
        question:
          locale === "bn"
            ? `ভিজ্যুয়ালাইজেশনের ${stepIndex + 1} নম্বর ধাপটি সহজ বাংলায় ব্যাখ্যা করো: ${narration || "বর্তমান দৃশ্য"}`
            : `Explain step ${stepIndex + 1} of this visualization in simple English: ${narration || "the current frame"}`,
        lang: locale,
        classBandId: bandId ?? undefined,
        vizId,
        stepIndex,
        topicSlug,
      });
      setAnswer(result.answer);
    } catch (caught) {
      setError(apiErrorMessage(caught, t("companion.failed")));
    }
  };

  const openChat = () => {
    setContext({ vizId, topicSlug, stepIndex, narration });
    setChatOpen(true);
    onAsk?.(stepIndex, step);
  };

  return (
    <section className="companion-stage" aria-live="polite">
      <div className={`companion-stage-robot ${side}`}>
        <div className="companion-bubble">
          {narration || t("companion.noStep")}
        </div>
        <CompanionRobot
          emotion={
            ask.isPending ? "think" : answer ? "happy" : step ? "happy" : "confused"
          }
          talking={ask.isPending}
          walking
          className="companion-stage-bot"
        />
      </div>

      <div className="companion-stage-copy">
        <div className="companion-stage-head">
          <span className="eyebrow">{t("companion.title")}</span>
          <span className="chip chip-soft">
            {t("companion.step", {
              current: Math.min(stepIndex + 1, Math.max(total, 1)),
              total: Math.max(total, 1),
            })}
          </span>
        </div>

        {answer ? (
          <div className="companion-answer">
            <RichMathText text={answer} />
          </div>
        ) : (
          <p className="muted companion-stage-hint">{t("companion.hint")}</p>
        )}

        {step?.formula ? <MathFormula formula={step.formula} block /> : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="companion-stage-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={explain}
            disabled={ask.isPending}
          >
            ✨ {ask.isPending ? t("companion.explaining") : t("companion.explain")}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={openChat}>
            {t("companion.ask")}
          </button>
        </div>
      </div>
    </section>
  );
}
