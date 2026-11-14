"use client";

import { getCategories, getChapters } from "@/api";
import ClassPicker from "@/components/ClassPicker";
import ClassView from "@/components/ClassView";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";

export default function LearnPage() {
  const { bands, level, ready, select } = useClassSelection();
  const { locale, t } = useLocale();

  const categoriesQuery = useQuery({
    queryKey: ["learn-categories", level?.id ?? null],
    queryFn: () => getCategories({ classLevelId: level.id }),
    enabled: Boolean(level?.id),
  });

  const categories = categoriesQuery.data ?? [];
  const categoryIds = categories.map((category) => category.id).join(",");

  const chaptersQuery = useQuery({
    queryKey: ["learn-chapters", level?.id ?? null, categoryIds],
    queryFn: async () => {
      const chapterLists = await Promise.all(
        categories.map((category) => getChapters({ categoryId: category.id })),
      );
      return categories.map((category, index) => ({
        ...category,
        chapters: chapterLists[index] ?? [],
      }));
    },
    enabled: categories.length > 0,
  });

  const loading = categoriesQuery.isLoading || chaptersQuery.isLoading;

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
      ) : loading ? (
        <p className="muted learn-status">{t("common.loading")}</p>
      ) : (
        <ClassView level={level} categories={chaptersQuery.data ?? []} />
      )}
    </>
  );
}
