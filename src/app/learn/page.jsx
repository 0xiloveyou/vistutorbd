"use client";

import {
  getLibraryChapter,
  getLibraryChapters,
  getLibraryClasses,
  getLibraryVisualization,
} from "@/api";
import SecureCarouselFrame from "@/components/SecureCarouselFrame";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const chapterLabel = (chapter) =>
  chapter.paper
    ? `${String(chapter.chapterNo).padStart(2, "0")} · ${chapter.paper.toUpperCase()}`
    : String(chapter.chapterNo).padStart(2, "0");

export default function LearnPage() {
  const { bands, level, ready, select } = useClassSelection();
  const { locale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(true);
  const [chapterId, setChapterId] = useState(null);
  const [filter, setFilter] = useState("");

  const classesQuery = useQuery({
    queryKey: ["library-classes"],
    queryFn: getLibraryClasses,
    enabled: ready,
    staleTime: 5 * 60 * 1000,
  });

  const chaptersQuery = useQuery({
    queryKey: ["library-chapters", level?.id ?? null],
    queryFn: () => getLibraryChapters(level.id),
    enabled: Boolean(level?.id),
    staleTime: 5 * 60 * 1000,
  });

  const chapterQuery = useQuery({
    queryKey: ["library-chapter", chapterId],
    queryFn: () => getLibraryChapter(chapterId),
    enabled: Boolean(chapterId),
    staleTime: 5 * 60 * 1000,
  });

  const visualizationQuery = useQuery({
    queryKey: ["library-visualization", chapterId],
    queryFn: () => getLibraryVisualization(chapterId),
    enabled: Boolean(chapterQuery.data?.visualization?.slug),
    staleTime: 5 * 60 * 1000,
  });

  const classMeta = useMemo(
    () => new Map((classesQuery.data ?? []).map((item) => [item.id, item])),
    [classesQuery.data],
  );

  // One flat list: Play, Nursery, Class 1 … Class 12. No band categories.
  const allClasses = useMemo(
    () =>
      (bands ?? [])
        .flatMap((band) =>
          (band.levels ?? []).map((item) => ({ ...item, bandId: band.id })),
        )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [bands],
  );

  const chapters = chaptersQuery.data ?? [];
  const current = useMemo(
    () => chapters.find((chapter) => chapter.chapterId === chapterId) ?? null,
    [chapters, chapterId],
  );

  useEffect(() => {
    setChapterId(null);
    setFilter("");
    setMenuOpen(true);
  }, [level?.id]);

  const visibleChapters = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return chapters;
    return chapters.filter((chapter) => {
      const haystack = [
        chapter.titleEn,
        chapter.titleBn,
        chapter.chapterId,
        chapter.paper,
        String(chapter.chapterNo),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [chapters, filter]);

  const chooseChapter = (nextId) => {
    setChapterId(nextId);
    setMenuOpen(false);
  };

  const switchClass = (nextId) => {
    const next = allClasses.find((item) => item.id === nextId);
    if (next) select(next.bandId, next.id);
  };

  const currentTitle = current
    ? locale === "bn" && current.titleBn
      ? current.titleBn
      : current.titleEn
    : "";

  if (!ready) {
    return (
      <div className="learn-screen learn-screen-status">
        <span>{t("common.loading")}</span>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="learn-picker">
        <Link href="/" className="learn-picker-home">
          ← {t("common.home")}
        </Link>
        <header className="learn-picker-head">
          <span className="eyebrow">{t("learn.kicker")}</span>
          <h1>{t("home.chooseClass")}</h1>
        </header>
        <div className="learn-picker-grid">
          {allClasses.map((item) => {
            const meta = classMeta.get(item.id);
            const locked = Boolean(meta?.locked);
            return (
              <button
                key={item.id}
                type="button"
                className={`learn-picker-card ${locked ? "is-locked" : ""}`}
                onClick={() => {
                  if (locked) return;
                  select(item.bandId, item.id);
                  setMenuOpen(true);
                }}
                disabled={locked}
              >
                <strong>{localized(item.name, locale)}</strong>
                <small>
                  {locked
                    ? t("learn.lockedClass")
                    : t("learn.chapterCount", {
                        count: meta?.chapterCount ?? 0,
                      })}
                </small>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="learn-screen">
      {!chapterId ? (
        <button
          type="button"
          className="learn-screen-empty"
          onClick={() => setMenuOpen(true)}
        >
          <span className="eyebrow">{t("learn.currentClass")}</span>
          <strong>{localized(level.name, locale)}</strong>
          <span>{t("learn.pickChapterTitle")} →</span>
        </button>
      ) : chapterQuery.isLoading || visualizationQuery.isLoading ? (
        <div className="learn-screen-status">
          <span>{t("common.loading")}</span>
        </div>
      ) : chapterQuery.isError ? (
        <div className="learn-screen-status">
          <p>{t("learn.carouselUnavailable")}</p>
        </div>
      ) : visualizationQuery.data?.html ? (
        <SecureCarouselFrame
          fill
          html={visualizationQuery.data.html}
          title={currentTitle}
        />
      ) : (
        <div className="learn-screen-status">
          <h2>{t("learn.visualizationPending")}</h2>
          <p>{t("learn.visualizationPendingHint")}</p>
        </div>
      )}

      <div className={`learn-chapter-menu ${menuOpen ? "is-open" : ""}`}>
        {menuOpen ? (
          <div
            className="learn-chapter-panel"
            role="dialog"
            aria-label={t("learn.chaptersMenu")}
          >
            <div className="learn-chapter-panel-head">
              <div>
                <span className="eyebrow">{t("home.chooseClass")}</span>
                <select
                  className="learn-class-select"
                  aria-label={t("home.chooseClass")}
                  value={level.id}
                  onChange={(event) => switchClass(event.target.value)}
                >
                  {allClasses.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={Boolean(classMeta.get(item.id)?.locked)}
                    >
                      {localized(item.name, locale)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="learn-chapter-close"
                onClick={() => setMenuOpen(false)}
                aria-label={t("learn.closeChapters")}
              >
                ×
              </button>
            </div>

            <p className="learn-chapter-panel-hint">
              {t("learn.chapterMenuHint")}
            </p>

            <input
              className="learn-chapter-search"
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={t("learn.searchChapters")}
              aria-label={t("learn.searchChapters")}
            />

            <div className="learn-chapter-list">
              {chaptersQuery.isLoading ? (
                <p className="muted learn-chapter-list-note">
                  {t("common.loading")}
                </p>
              ) : visibleChapters.length === 0 ? (
                <p className="muted learn-chapter-list-note">
                  {chapters.length
                    ? t("learn.noChapterMatch")
                    : t("learn.noChapters")}
                </p>
              ) : (
                visibleChapters.map((chapter) => (
                  <button
                    key={chapter.chapterId}
                    type="button"
                    className={`learn-chapter-item ${
                      chapter.chapterId === chapterId ? "is-active" : ""
                    }`}
                    onClick={() => chooseChapter(chapter.chapterId)}
                  >
                    <span className="learn-chapter-no">
                      {chapterLabel(chapter)}
                    </span>
                    <span className="learn-chapter-info">
                      <strong>
                        {locale === "bn" && chapter.titleBn
                          ? chapter.titleBn
                          : chapter.titleEn}
                      </strong>
                      <small>
                        {t("learn.questionsShort", {
                          count: chapter.questionCount ?? 0,
                        })}
                      </small>
                    </span>
                    <span
                      className={`learn-chapter-badge ${
                        chapter.visualizationSlug ? "is-ready" : ""
                      }`}
                    >
                      {chapter.visualizationSlug
                        ? t("learn.vizReady")
                        : t("learn.vizPending")}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="learn-chapter-panel-foot">
              <Link href="/">{t("common.home")}</Link>
              <span>
                {localized(level.name, locale)} ·{" "}
                {t("learn.chapterCount", { count: chapters.length })}
              </span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className={`learn-chapter-fab ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={
            menuOpen ? t("learn.closeChapters") : t("learn.openChapters")
          }
          title={menuOpen ? t("learn.closeChapters") : t("learn.openChapters")}
        >
          <span className="learn-hamburger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {!menuOpen && current ? (
            <span className="learn-fab-current" aria-hidden="true">
              {chapterLabel(current)}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
