"use client";

import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function ClassView({ level, categories = [] }) {
  const { locale, t } = useLocale();

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("class.categories")}</span>
        <h1>{localized(level?.name, locale)}</h1>
        <p className="lead">{localized(level?.summary, locale) || t("class.emptyCategories")}</p>
      </header>

      {categories.length === 0 ? (
        <div className="empty-panel">
          <h2>{t("common.empty")}</h2>
          <p>{t("class.emptyCategories")}</p>
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.id} className="category-card">
              <header>
                <span className="category-icon" aria-hidden="true">
                  {category.icon || "∑"}
                </span>
                <div>
                  <h2>{localized(category.title, locale)}</h2>
                  <p className="muted">{localized(category.summary, locale)}</p>
                </div>
              </header>

              {category.chapters?.length ? (
                <ul className="chapter-list">
                  {category.chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link
                        href={`/class/${level.id}/${category.slug}/${chapter.slug}`}
                      >
                        <span>{localized(chapter.title, locale)}</span>
                        <span className="muted">
                          {chapter.prerequisites?.length
                            ? `${chapter.prerequisites.length} prerequisites`
                            : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{t("class.emptyChapters")}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}