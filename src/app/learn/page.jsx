"use client";

import { getCategories, getLearnCarousels, getTopics } from "@/api";
import ClassPicker from "@/components/ClassPicker";
import SecureCarouselFrame from "@/components/SecureCarouselFrame";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const SECTIONS = [
  { id: "explanation", icon: "🎬", label: "learn.explanations" },
  { id: "questions", icon: "❓", label: "learn.questions" },
  { id: "topics", icon: "🧭", label: "learn.topics" },
];

async function fetchAllTopics(levelId) {
  const first = await getTopics({ classLevelId: levelId, page: 1, limit: 50 });
  const topics = [...(first.topics ?? [])];
  const totalPages = first.meta?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getTopics({ classLevelId: levelId, page, limit: 50 });
    topics.push(...(next.topics ?? []));
  }

  return topics;
}

export default function LearnPage() {
  const { bands, level, ready, select } = useClassSelection();
  const { locale, t } = useLocale();
  const [visible, setVisible] = useState({
    explanation: true,
    questions: true,
    topics: true,
  });

  const carouselsQuery = useQuery({
    queryKey: ["learn-carousels", level?.id ?? null],
    queryFn: async () => {
      const [explanations, questions] = await Promise.all([
        getLearnCarousels({ classLevelId: level.id, kind: "EXPLANATION" }),
        getLearnCarousels({ classLevelId: level.id, kind: "QUESTION" }),
      ]);
      return { explanations, questions };
    },
    enabled: Boolean(level?.id),
  });

  const categoriesQuery = useQuery({
    queryKey: ["learn-categories", level?.id ?? null],
    queryFn: () => getCategories({ classLevelId: level.id }),
    enabled: Boolean(level?.id),
  });

  const topicsQuery = useQuery({
    queryKey: ["learn-topics", level?.id ?? null],
    queryFn: () => fetchAllTopics(level.id),
    enabled: Boolean(level?.id),
  });

  const explanations = useMemo(() => {
    const list = carouselsQuery.data?.explanations ?? [];
    if (!level?.id) return list;
    const specific = list.filter((item) =>
      item.classLevelIds?.includes(level.id),
    );
    return specific.length ? specific : list;
  }, [carouselsQuery.data?.explanations, level?.id]);
  const questions = carouselsQuery.data?.questions ?? [];
  const categories = categoriesQuery.data ?? [];
  const topics = topicsQuery.data ?? [];

  const topicGroups = useMemo(() => {
    if (!topics.length) return [];

    const byCategory = new Map();
    for (const topic of topics) {
      const key = topic.categoryId || "other";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(topic);
    }

    const groups = [];
    for (const category of categories) {
      const list = byCategory.get(category.id);
      if (list?.length) {
        groups.push({ id: category.id, title: category.title, topics: list });
      }
    }

    const known = new Set(categories.map((category) => category.id));
    for (const [id, list] of byCategory.entries()) {
      if (!known.has(id) && list.length) {
        groups.push({ id, title: null, topics: list });
      }
    }

    return groups;
  }, [categories, topics]);

  const toggleSection = useCallback((id) => {
    setVisible((current) => {
      const next = { ...current, [id]: !current[id] };
      if (next[id] && typeof document !== "undefined") {
        requestAnimationFrame(() => {
          document
            .getElementById(`learn-${id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return next;
    });
  }, []);

  const loading =
    carouselsQuery.isLoading || categoriesQuery.isLoading || topicsQuery.isLoading;

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("learn.kicker")}</span>
        <h1>{t("learn.title")}</h1>
        <p className="lead">{t("learn.subtitle")}</p>
        <div className="learn-toolbar">
          <ClassPicker showLink={false} />
        </div>
      </header>

      {!ready ? (
        <p className="muted learn-status">{t("common.loading")}</p>
      ) : !level ? (
        <section className="learn-bands" aria-label={t("learn.allClasses")}>
          <p className="muted">{t("learn.pickPrompt")}</p>
          {bands.map((band) => (
            <div key={band.id} className="learn-band">
              <h2>{localized(band.name, locale)}</h2>
              <div className="learn-class-grid">
                {(band.levels ?? []).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="learn-class-card"
                    onClick={() => select(band.id, item.id)}
                  >
                    <strong>{localized(item.name, locale)}</strong>
                    <small>{t("learn.openClass")}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <>
          <nav
            className="learn-float-toggles"
            aria-label={t("learn.sections")}
          >
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={visible[section.id] ? "is-on" : ""}
                aria-pressed={visible[section.id]}
                aria-controls={`learn-${section.id}`}
                onClick={() => toggleSection(section.id)}
              >
                <span aria-hidden="true">{section.icon}</span>
                {t(section.label)}
              </button>
            ))}
          </nav>

          <div className="learn-class-heading">
            <span className="eyebrow">{t("learn.currentClass")}</span>
            <h2>{localized(level.name, locale)}</h2>
          </div>

          <section
            id="learn-explanation"
            className={visible.explanation ? "learn-section" : "learn-section is-hidden"}
            aria-hidden={!visible.explanation}
          >
            <div className="learn-section-head">
              <h2>{t("learn.explanationsTitle")}</h2>
              <p className="muted">{t("learn.explanationsSubtitle")}</p>
            </div>

            {loading ? (
              <div className="learn-carousel-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : explanations.length ? (
              explanations.map((carousel) => (
                <SecureCarouselFrame
                  key={carousel.id}
                  slug={carousel.slug}
                  title={localized(carousel.title, locale)}
                />
              ))
            ) : (
              <div className="empty-panel">
                <p>{t("learn.carouselUnavailable")}</p>
              </div>
            )}
          </section>

          <section
            id="learn-questions"
            className={visible.questions ? "learn-section" : "learn-section is-hidden"}
            aria-hidden={!visible.questions}
          >
            <div className="learn-section-head">
              <h2>{t("learn.questionsTitle")}</h2>
              <p className="muted">{t("learn.questionsSubtitle")}</p>
            </div>

            {loading ? (
              <div className="learn-carousel-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : questions.length ? (
              questions.map((carousel) => (
                <SecureCarouselFrame
                  key={carousel.id}
                  slug={carousel.slug}
                  title={localized(carousel.title, locale)}
                />
              ))
            ) : (
              <div className="empty-panel">
                <h3>{t("learn.questionsEmptyTitle")}</h3>
                <p>{t("learn.questionsEmpty")}</p>
              </div>
            )}
          </section>

          <section
            id="learn-topics"
            className={visible.topics ? "learn-section" : "learn-section is-hidden"}
            aria-hidden={!visible.topics}
          >
            <div className="learn-section-head">
              <h2>{t("learn.topicsTitle")}</h2>
              <p className="muted">{t("learn.topicsSubtitle")}</p>
            </div>

            {loading ? (
              <p className="muted learn-status">{t("common.loading")}</p>
            ) : topicGroups.length ? (
              <div className="learn-topic-groups">
                {topicGroups.map((group) => (
                  <div key={group.id} className="learn-topic-group">
                    {group.title ? (
                      <h3>{localized(group.title, locale)}</h3>
                    ) : null}
                    <div className="learn-topic-grid">
                      {group.topics.map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/topic/${topic.slug}`}
                          className="learn-topic-card"
                        >
                          <strong>{localized(topic.title, locale)}</strong>
                          <span>{localized(topic.summary, locale)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <h3>{t("common.empty")}</h3>
                <p>{t("class.emptyCategories")}</p>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
