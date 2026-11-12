"use client";

import { getVisualization } from "@/api";
import { localized } from "@/lib/localized";
import { useCompanion } from "@/providers/companion.provider";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useMemo, useState } from "react";
import TopicActions from "./TopicActions";
import VizPlayer from "@/viz/VizPlayer";

export default function TopicWorkspace({ topic }) {
  const { locale, t } = useLocale();
  const { mode, setChatOpen, setContext } = useCompanion();
  const visualizations = useMemo(
    () => topic.visualizations ?? [],
    [topic.visualizations],
  );
  const [activeVizId, setActiveVizId] = useState(visualizations[0]?.vizId ?? null);
  const [spec, setSpec] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  const activeViz =
    visualizations.find((item) => item.vizId === activeVizId) ?? visualizations[0];

  useEffect(() => {
    setActiveVizId(visualizations[0]?.vizId ?? null);
    setStepIndex(0);
  }, [topic.slug, visualizations]);

  useEffect(() => {
    let active = true;
    if (!activeViz?.vizId) {
      setSpec(null);
      return undefined;
    }

    setSpec(null);
    getVisualization(activeViz.vizId)
      .then((data) => {
        if (active) setSpec(data);
      })
      .catch(() => {
        if (active) setSpec(null);
      });

    return () => {
      active = false;
    };
  }, [activeViz?.vizId]);

  useEffect(
    () => () => {
      setContext({
        vizId: undefined,
        stepIndex: undefined,
        topicSlug: undefined,
        narration: "",
      });
    },
    [setContext],
  );

  const openChat = (index = 0) => {
    setStepIndex(index);
    setContext({
      vizId: activeViz?.vizId,
      stepIndex: index,
      topicSlug: topic.slug,
    });
    setChatOpen(true);
  };

  return (
    <div className="topic-workspace">
      <TopicActions topic={topic} />

      {visualizations.length > 1 ? (
        <div className="viz-picker" role="tablist" aria-label={t("topic.visualization")}>
          {visualizations.map((viz) => (
            <button
              key={viz.vizId}
              type="button"
              role="tab"
              aria-selected={viz.vizId === activeViz?.vizId}
              className={`viz-picker-chip${
                viz.vizId === activeViz?.vizId ? " active" : ""
              }`}
              onClick={() => {
                setActiveVizId(viz.vizId);
                setStepIndex(0);
              }}
            >
              {localized(viz.title, locale) || viz.vizId}
            </button>
          ))}
        </div>
      ) : null}

      <VizPlayer
        key={activeViz?.vizId ?? "no-viz"}
        vizId={activeViz?.vizId}
        spec={spec}
        topicSlug={topic.slug}
        companionMode={mode === "companion"}
        initialStep={activeViz?.vizId === visualizations[0]?.vizId ? topic.progress?.lastStepIndex ?? 0 : 0}
        onStepChange={(index, step) => {
          setStepIndex(index);
          setContext({
            vizId: activeViz?.vizId,
            stepIndex: index,
            topicSlug: topic.slug,
            narration: step?.narration?.[locale] ?? "",
          });
        }}
        onAsk={openChat}
      />

      <div className="ask-strip">
        <div>
          <strong>{t("topic.askCompanion")}</strong>
          <p className="muted">{t("home.assistantIntro")}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openChat(stepIndex)}>
          {t("chat.title")}
        </button>
      </div>

      {visualizations.length === 0 ? (
        <p className="muted center">{t("topic.noVisualization")}</p>
      ) : null}
    </div>
  );
}
