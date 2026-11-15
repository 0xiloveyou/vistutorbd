"use client";

import ClassPicker from "@/components/ClassPicker";
import VisualLessons from "@/components/VisualLessons";
import { getCategories, getTopics, getVisualizations } from "@/api";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

function HomeCatalogStats() {
  const { bands } = useClassSelection();
  const visualizations = useQuery({
    queryKey: ["home-catalog-count", "visualizations"],
    queryFn: () => getVisualizations({ page: 1, limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });
  const topics = useQuery({
    queryKey: ["home-catalog-count", "topics"],
    queryFn: () => getTopics({ page: 1, limit: 1 }),
    staleTime: 5 * 60 * 1000,
  });
  const categories = useQuery({
    queryKey: ["home-catalog-count", "categories"],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  const classCount = bands.reduce((total, band) => total + (band.levels?.length ?? 0), 0);
  const stats = [
    { label: "Visualizations", value: visualizations.data?.meta?.total },
    { label: "Topics", value: topics.data?.meta?.total },
    { label: "Categories", value: categories.data?.length },
    { label: "Classes", value: classCount },
  ].filter((stat) => Number.isFinite(stat.value) && stat.value > 0);

  if (!stats.length) return null;

  return (
    <section className="home-catalog-stats" aria-label="Learning content">
      {stats.map((stat) => (
        <div className="home-stat" key={stat.label}>
          <strong>{stat.value.toLocaleString()}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export default function HomePage() {
  const { t } = useLocale();

  return (
    <>
      <VisualLessons />
      <HomeCatalogStats />
      <section className="home-class-choice">
        <span className="eyebrow">{t("home.chooseClass")}</span>
        <ClassPicker showLink={false} redirectTo="/learn" />
      </section>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("home.kicker")}</span>
          <h1>{t("home.title")}</h1>
          <p className="lead">{t("home.subtitle")}</p>

          <div className="hero-actions">
            <Link href="/learn" className="btn btn-primary">
              {t("home.startLearning")} →
            </Link>
            <Link href="/bookmarks" className="btn btn-ghost">
              {t("common.bookmarks")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
