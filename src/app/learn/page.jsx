"use client";

import { getCategories, getLearnCarousels, getTopics } from "@/api";
import ClassPicker from "@/components/ClassPicker";
import SecureCarouselFrame from "@/components/SecureCarouselFrame";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

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

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("learn.kicker")}</span>
        <h1>{t("learn.title")}</h1>
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
          <div className="learn-class-heading">
            <span className="eyebrow">{t("learn.currentClass")}</span>
            <h2>{localized(level.name, locale)}</h2>
          </div>

          {explanations.length > 0 ? <section className="learn-section learn-content-panel">
            <div className="learn-section-head">
              <h2>{t("learn.explanationsTitle")}</h2>
            </div>
            {explanations.map((carousel) => (
                <SecureCarouselFrame
                  key={carousel.id}
                  slug={carousel.slug}
                  title={localized(carousel.title, locale)}
                />
              ))}
          </section> : null}

          {questions.length > 0 ? <section className="learn-section learn-content-panel">
            <div className="learn-section-head">
              <h2>{t("learn.questionsTitle")}</h2>
            </div>
            {questions.map((carousel) => (
                <SecureCarouselFrame
                  key={carousel.id}
                  slug={carousel.slug}
                  title={localized(carousel.title, locale)}
                />
              ))}
          </section> : null}

          {topicGroups.length > 0 ? <section className="learn-section learn-content-panel">
            <div className="learn-section-head">
              <h2>{t("learn.topicsTitle")}</h2>
            </div>
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
          </section> : null}
        </>
      )}
    </>
  );
}
