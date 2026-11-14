"use client";

import ClassPicker from "@/components/ClassPicker";
import VisualLessons from "@/components/VisualLessons";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { level } = useClassSelection();

  return (
    <>
      <VisualLessons />
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("home.kicker")}</span>
          <h1>{t("home.title")}</h1>
          <p className="lead">{t("home.subtitle")}</p>

          <div className="hero-picker">
            <span className="muted">{t("home.chooseClass")}</span>
            <ClassPicker showLink={false} redirectTo="/learn" />
          </div>

          <div className="hero-actions">
            {level ? (
              <Link href="/learn" className="btn btn-primary">
                {t("home.startLearning")} · {localized(level.name, locale)} →
              </Link>
            ) : (
              <span className="btn btn-disabled">{t("home.pickFirst")}</span>
            )}
            <Link href="/bookmarks" className="btn btn-ghost">
              {t("common.bookmarks")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
