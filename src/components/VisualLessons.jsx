"use client";

import { getLearnCarousels } from "@/api";
import { useClassSelection } from "@/providers/class.provider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import SecureCarouselFrame from "./SecureCarouselFrame";

export default function VisualLessons() {
  const { level } = useClassSelection();
  const query = useQuery({
    queryKey: ["home-explanation-carousel", level?.id ?? null],
    queryFn: () =>
      getLearnCarousels({
        kind: "EXPLANATION",
        ...(level?.id ? { classLevelId: level.id } : {}),
      }),
    staleTime: 5 * 60 * 1000,
  });

  const carousel = useMemo(() => {
    const list = query.data ?? [];
    if (level?.id) {
      const specific = list.find((item) =>
        item.classLevelIds?.includes(level.id),
      );
      if (specific) return specific;
    }
    return list[0];
  }, [query.data, level?.id]);

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
