"use client";

import { getLearnCarousels } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import HomeLoading from "./home-loading/HomeLoading";
import SecureCarouselFrame from "./SecureCarouselFrame";

export default function VisualLessons({ onReady }) {
  const query = useQuery({
    queryKey: ["home-explanation-carousel"],
    queryFn: () => getLearnCarousels({ kind: "EXPLANATION" }),
    staleTime: 5 * 60 * 1000,
  });

  const carousel = query.data?.[0];

  useEffect(() => {
    if (query.isFetched && !carousel) onReady?.();
  }, [carousel, onReady, query.isFetched]);

  if (query.isLoading) {
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
        onReady={onReady}
        loadingFallback={<HomeLoading />}
      />
    </section>
  );
}
