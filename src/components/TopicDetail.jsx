"use client";

import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import MathFormula from "./MathFormula";
import TopicLesson from "./TopicLesson";
import TopicWorkspace from "./TopicWorkspace";

export default function TopicDetail({ topic }) {
  const { locale, t } = useLocale();

  const level = topic.classLevel;
  const category = topic.category;
  const chapter = topic.chapter;

  return (
    <>
      {level && chapter ? (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href={`/class/${level.id}`}>{localized(level.name, locale)}</Link>
          <span>/</span>
          {category ? (
            <>
              <Link href={`/class/${level.id}/${category.slug}/${chapter.slug}`}>
                {localized(category.title, locale)}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span>{localized(chapter.title, locale)}</span>
          <span>/</span>
          <span>{localized(topic.title, locale)}</span>
        </nav>
      ) : null}

      <header className="page-head">
        <span className="eyebrow">{t("topic.lesson")}</span>
        <h1>{localized(topic.title, locale)}</h1>
        <p className="lead">{localized(topic.summary, locale)}</p>
      </header>

      <div className="topic-layout">
        <div className="topic-main">
          <TopicLesson blocks={topic.lesson ?? []} />
        </div>

        <aside className="topic-aside">
          <TopicWorkspace topic={topic} />

          <div className="topic-meta-card">
            <h2>{t("topic.visualization")}</h2>
            <dl>
              <dt>{t("practice.difficulty")}</dt>
              <dd>{topic.difficulty ?? 1} / 5</dd>
              <dt>{t("class.chapters")}</dt>
              <dd>{localized(chapter?.title, locale) || "—"}</dd>
              <dt>{t("class.categories")}</dt>
              <dd>{localized(category?.title, locale) || "—"}</dd>
              <dt>{t("admin.knowledge")}</dt>
              <dd>{topic.knowledgeStatus}</dd>
            </dl>
            {topic.visualizations?.length ? (
              <div className="page-actions">
                {topic.visualizations.map((viz) => (
                  <span key={viz.vizId} className="badge">
                    {viz.kind}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">{t("topic.noVisualization")}</p>
            )}
            {topic.lesson?.some((block) => block.formula) ? (
              <MathFormula
                formula={topic.lesson.find((block) => block.formula)?.formula}
                block
              />
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}