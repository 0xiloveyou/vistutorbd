"use client";

import Pagination from "@/components/Pagination";
import { useDebouncedValue } from "@/hooks";
import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function buildSearchUrl(query, classLevelId) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (classLevelId) params.set("classLevelId", classLevelId);
  const suffix = params.toString();
  return suffix ? `/search?${suffix}` : "/search";
}

export default function SearchView({
  bands = [],
  q = "",
  classLevelId = "",
  page = 1,
  topics = [],
  meta = {},
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [level, setLevel] = useState(classLevelId);
  const debouncedQuery = useDebouncedValue(query, 450);
  const lastRequested = useRef({ q, classLevelId });
  const levels = bands.flatMap((band) => band.levels ?? []);
  const levelById = new Map(levels.map((level) => [level.id, level]));
  const selectedLevel = levelById.get(classLevelId);

  // Keep the inputs in sync when navigation changes the props from outside
  // (browser back/forward, pagination, or a link into a new search).
  useEffect(() => {
    if (
      q !== lastRequested.current.q ||
      classLevelId !== lastRequested.current.classLevelId
    ) {
      setQuery(q);
      setLevel(classLevelId);
      lastRequested.current = { q, classLevelId };
    }
  }, [q, classLevelId]);

  useEffect(() => {
    const nextQuery = debouncedQuery.trim();
    if (nextQuery === q && level === classLevelId) return;

    lastRequested.current = { q: nextQuery, classLevelId: level };
    router.replace(buildSearchUrl(nextQuery, level), { scroll: false });
  }, [debouncedQuery, level, q, classLevelId, router]);

  const submit = (event) => {
    event.preventDefault();
    const nextQuery = query.trim();
    lastRequested.current = { q: nextQuery, classLevelId: level };
    router.replace(buildSearchUrl(nextQuery, level), { scroll: false });
  };

  const reset = () => {
    setQuery("");
    setLevel("");
  };

  return (
    <div className="search-page">
      <header className="page-head">
        <span className="eyebrow">{t("search.kicker")}</span>
        <h1>{t("search.title")}</h1>
        <p className="lead">{t("search.subtitle")}</p>
      </header>

      <form className="search-form panel" action="/search" onSubmit={submit}>
        <div className="search-form-row">
          <label className="search-field">
            <span>{t("common.search")}</span>
            <input
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder")}
              autoComplete="off"
            />
          </label>

          <label className="search-field">
            <span>{t("search.filterClass")}</span>
            <select
              name="classLevelId"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <option value="">{t("common.allClasses")}</option>
              {bands.map((band) => (
                <optgroup
                  key={band.id}
                  label={localized(band.name, locale)}
                >
                  {(band.levels ?? []).map((level) => (
                    <option key={level.id} value={level.id}>
                      {localized(level.name, locale)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="search-form-actions">
            <button type="submit" className="btn btn-primary">
              {t("search.submit")} →
            </button>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              {t("common.reset")}
            </button>
          </div>
        </div>
      </form>

      <section className="search-results">
        <div className="section-head">
          <div>
            <h2>
              {selectedLevel
                ? localized(selectedLevel.name, locale)
                : t("common.allClasses")}
            </h2>
            <p className="muted">
              {q
                ? `${t("search.results", { count: meta.total ?? 0 })} · “${q}”`
                : t("search.browseAll")}
            </p>
          </div>
        </div>

        {topics.length === 0 ? (
          <div className="empty-panel">
            <h2>{t("search.empty")}</h2>
            <p>{t("search.emptyHint")}</p>
          </div>
        ) : (
          <div className="topic-list search-topic-list">
            {topics.map((topic) => {
              const topicLevel = levelById.get(topic.classLevelId);
              return (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className="topic-card"
                >
                  <div>
                    <div className="topic-card-tags">
                      <span className="badge">
                        {topicLevel
                          ? localized(topicLevel.name, locale)
                          : topic.classLevelId}
                      </span>
                      <span className="badge">L{topic.difficulty ?? 1}</span>
                    </div>
                    <h2>{localized(topic.title, locale)}</h2>
                    <p className="muted">{localized(topic.summary, locale)}</p>
                  </div>
                  <div className="topic-card-meta">
                    <span className="badge">
                      {topic.visualizationIds?.length ?? 0} viz
                    </span>
                    <span className="search-open">{t("search.viewTopic")} →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <Pagination
          page={meta.page ?? page}
          totalPages={meta.totalPages ?? 1}
          basePath="/search"
          params={{ q, classLevelId }}
        />
      </section>
    </div>
  );
}
