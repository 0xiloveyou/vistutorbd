"use client";

import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function ChapterView({ level, category, chapter, topics = [] }) {
  const { locale, t } = useLocale();

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={`/class/${level.id}`}>{localized(level.name, locale)}</Link>
        <span>/</span>
        <span>{localized(category.title, locale)}</span>
        <span>/</span>
        <span>{localized(chapter.title, locale)}</span>
      </nav>

      <header className="page-head">
        <span className="eyebrow">{t("chapter.topicsTitle")}</span>
        <h1>{localized(chapter.title, locale)}</h1>
        <p className="lead">{localized(chapter.summary, locale)}</p>
        <div className="page-actions">
          <Link href={`/practice/${chapter.id}`} className="btn btn-primary">
            {t("chapter.practice")} →
          </Link>
        </div>
      </header>

      {topics.length === 0 ? (
        <div className="empty-panel">
          <h2>{t("common.empty")}</h2>
          <p>{t("chapter.emptyTopics")}</p>
        </div>
      ) : (
        <div className="topic-list">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topic/${topic.slug}`} className="topic-card">
              <div>
                <h2>{localized(topic.title, locale)}</h2>
                <p className="muted">{localized(topic.summary, locale)}</p>
              </div>
              <div className="topic-card-meta">
                <span className="badge">L{topic.difficulty ?? 1}</span>
                <span className="badge">
                  {topic.visualizationIds?.length ?? 0} viz
                </span>
                <span className="muted mono">{topic.knowledgeStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}