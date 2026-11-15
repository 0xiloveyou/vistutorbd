"use client";

import { getLearnCarousels } from "@/api";
import { useQuery } from "@tanstack/react-query";
import SecureCarouselFrame from "./SecureCarouselFrame";

export default function VisualLessons() {
  const query = useQuery({
    queryKey: ["home-explanation-carousel"],
    queryFn: () => getLearnCarousels({ kind: "EXPLANATION" }),
    staleTime: 5 * 60 * 1000,
  });

  const carousel = query.data?.[0];

  if (query.isLoading) {
    return (
      <section className="home-visual-lessons" aria-label="Interactive visual lessons">
        <div className="learn-carousel-skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (!carousel) return null;

  return (
    <section className="home-visual-lessons" aria-label="Interactive visual lessons">
      <SecureCarouselFrame slug={carousel.slug} title={carousel.title?.en} />
    </section>
  );
}
