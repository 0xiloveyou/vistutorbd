"use client";

import {
  getLibraryChapter,
  getLibraryChapters,
  getLibraryClasses,
  getLibraryVisualization,
} from "@/api";
import ClassPicker from "@/components/ClassPicker";
import SecureCarouselFrame from "@/components/SecureCarouselFrame";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const stageRef = useRef(null);

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
    requestAnimationFrame(() => {
      stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const currentTitle = current
    ? locale === "bn" && current.titleBn
      ? current.titleBn
      : current.titleEn
    : "";

  if (!ready) {
    return (
      <>
        <header className="page-head">
          <span className="eyebrow">{t("learn.kicker")}</span>
          <h1>{t("learn.title")}</h1>
        </header>
        <p className="muted learn-status">{t("common.loading")}</p>
      </>
    );
  }

  if (!level) {
    return (
      <>
        <header className="page-head">
          <span className="eyebrow">{t("learn.kicker")}</span>
          <h1>{t("learn.title")}</h1>
          <p className="muted">{t("learn.pickPrompt")}</p>
        </header>

        <section className="learn-bands" aria-label={t("learn.allClasses")}>
          {bands.map((band) => (
            <div key={band.id} className="learn-band">
              <h2>{localized(band.name, locale)}</h2>
              <div className="learn-class-grid">
                {(band.levels ?? []).map((item) => {
                  const meta = classMeta.get(item.id);
                  const locked = Boolean(meta?.locked);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`learn-class-card ${locked ? "is-locked" : ""}`}
                      onClick={() => {
                        if (locked) return;
                        select(band.id, item.id);
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
          ))}
        </section>
      </>
    );
  }

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("learn.kicker")}</span>
        <h1>{t("learn.title")}</h1>
        <div className="learn-toolbar">
          <ClassPicker showLink={false} />
        </div>
      </header>

      <div className="learn-class-heading">
        <span className="eyebrow">{t("learn.currentClass")}</span>
        <h2>{localized(level.name, locale)}</h2>
        <span className="learn-chapter-total">
          {t("learn.chapterCount", { count: chapters.length })}
        </span>
      </div>

      <section className="learn-chapter-stage" ref={stageRef}>
        {!chapterId ? (
          <div className="learn-chapter-empty">
            <span className="learn-chapter-empty-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <h2>{t("learn.pickChapterTitle")}</h2>
            <p className="muted">{t("learn.pickChapterHint")}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setMenuOpen(true)}
            >
              {t("learn.openChapters")}
            </button>
          </div>
        ) : chapterQuery.isLoading ? (
          <div className="learn-carousel-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : chapterQuery.isError ? (
          <div className="empty-panel learn-carousel-error">
            <p>{t("learn.carouselUnavailable")}</p>
          </div>
        ) : (
          <>
            <div className="learn-chapter-titlebar">
              <div>
                <span className="eyebrow">{t("learn.currentChapter")}</span>
                <h2>{currentTitle}</h2>
              </div>
              <div className="learn-chapter-meta">
                <span>{chapterLabel(current)}</span>
                <span>
                  {t("learn.questionsShort", {
                    count: current?.questionCount ?? 0,
                  })}
                </span>
              </div>
            </div>

            {visualizationQuery.isLoading ? (
              <div className="learn-carousel-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : visualizationQuery.data?.html ? (
              <SecureCarouselFrame
                html={visualizationQuery.data.html}
                title={currentTitle}
              />
            ) : (
              <div className="learn-chapter-pending">
                <h3>{t("learn.visualizationPending")}</h3>
                <p className="muted">{t("learn.visualizationPendingHint")}</p>
              </div>
            )}
          </>
        )}
      </section>

      <div className={`learn-chapter-menu ${menuOpen ? "is-open" : ""}`}>
        {menuOpen ? (
          <div
            className="learn-chapter-panel"
            role="dialog"
            aria-label={t("learn.chaptersMenu")}
          >
            <div className="learn-chapter-panel-head">
              <div>
                <span className="eyebrow">{t("learn.chaptersMenu")}</span>
                <strong>{localized(level.name, locale)}</strong>
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
    </>
  );
}
