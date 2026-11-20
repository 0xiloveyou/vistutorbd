"use client";

import { getLearnCarousel, getLearnCarousels } from "@/api";
import { useClassSelection } from "@/providers/class.provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import HomeLoading from "./home-loading/HomeLoading";
import SecureCarouselFrame from "./SecureCarouselFrame";

export default function VisualLessons({ onReady }) {
  const { level, ready } = useClassSelection();
  const classLevelId = level?.id ?? "class-9";
  const query = useQuery({
    queryKey: ["home-explanation-carousel", classLevelId],
    queryFn: async () => {
      const carousels = await getLearnCarousels({
        classLevelId,
        kind: "EXPLANATION",
      });
      const carousel = carousels?.find((item) =>
        item.slug.startsWith("legacy-"),
      );
      if (!carousel) return null;

      const detail = await getLearnCarousel(carousel.slug);
      return { carousel, detail };
    },
    enabled: ready,
    staleTime: 5 * 60 * 1000,
  });

  const carousel = query.data?.carousel;

  useEffect(() => {
    if (query.isFetched && (!carousel || !query.data?.detail?.html)) {
      onReady?.();
    }
  }, [carousel, onReady, query.data?.detail?.html, query.isFetched]);

  if (!ready || query.isLoading) {
    return (
      <section className="home-visual-lessons" aria-label="Interactive visual lessons">
        <HomeLoading />
      </section>
    );
  }

  if (!carousel) return null;

  return (
    <section className="home-visual-lessons" aria-label="Interactive visual lessons">
      <SecureCarouselFrame
        slug={carousel.slug}
        title={carousel.title?.en}
        carouselData={query.data.detail}
        onReady={onReady}
      />
    </section>
  );
}
