"use client";

import ClassPicker from "@/components/ClassPicker";
import VisualLessons from "@/components/VisualLessons";
import {
  getCategories,
  getPublicAnalyticsStats,
  getTopics,
} from "@/api";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

function AnimatedCount({ value }) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const target = value;
    const format = (count) => count.toLocaleString();

    let frame = 0;
    let observer;
    let started = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = () => {
      if (started) return;
      started = true;
      if (reducedMotion) {
        element.textContent = format(target);
        return;
      }

      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 4;
        const count = Math.round(target * eased);
        element.textContent = progress === 1 ? format(target) : count.toLocaleString();
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      }, { threshold: 0.25 });
      observer.observe(element);
    } else {
      animate();
    }

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <strong ref={elementRef}>0</strong>;
}

function HomeCatalogStats({ onReady }) {
  const { bands } = useClassSelection();
  const visitors = useQuery({
    queryKey: ["home-catalog-count", "unique-visitors"],
    queryFn: getPublicAnalyticsStats,
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
  const countsLoaded =
    topics.isFetched &&
    categories.isFetched &&
    visitors.isFetched;
  const stats = [
    { label: "Visualizations", value: visitors.data?.visualizations },
    { label: "Unique visitors", value: visitors.data?.uniqueVisitors },
    { label: "Topics", value: topics.data?.meta?.total },
    { label: "Categories", value: categories.data?.length },
    { label: "Classes", value: classCount },
  ].filter((stat) => Number.isFinite(stat.value) && stat.value > 0);

  useEffect(() => {
    if (countsLoaded) onReady();
  }, [countsLoaded, onReady]);

  if (!countsLoaded) {
    return (
      <div className="home-catalog-stats home-catalog-stats-loading" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((item) => <span key={item} />)}
      </div>
    );
  }

  if (!stats.length) return null;

  return (
    <section className="home-catalog-stats" aria-label="Learning content">
      {stats.map((stat) => (
        <div className="home-stat" key={stat.label}>
          <AnimatedCount value={stat.value} />
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}

export default function HomePage() {
  const { t } = useLocale();
  const [visualReady, setVisualReady] = useState(false);
  const [countsReady, setCountsReady] = useState(false);
  const markVisualReady = useCallback(() => setVisualReady(true), []);
  const markCountsReady = useCallback(() => setCountsReady(true), []);

  return (
    <>
      <VisualLessons onReady={markVisualReady} />
      {visualReady ? (
        <>
          <HomeCatalogStats onReady={markCountsReady} />
          {countsReady ? (
            <>
              <section className="home-class-choice">
                <span className="eyebrow">{t("home.chooseClass")}</span>
                <ClassPicker showLink={false} />
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
          ) : null}
        </>
      ) : null}
    </>
  );
}
