"use client";

import ChatPanel from "@/components/ChatPanel";
import ClassPicker from "@/components/ClassPicker";
import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import VisualLessons from "@/components/VisualLessons";

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
            <ClassPicker showLink={false} />
          </div>

          <div className="hero-actions">
            {level ? (
              <Link href={`/class/${level.id}`} className="btn btn-primary">
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

      <section className="feature-grid">
        {[
          ["🧭", t("home.featureVisual"), t("home.featureVisualText")],
          ["🗣", t("home.featureBilingual"), t("home.featureBilingualText")],
          ["✅", t("home.featureQuiz"), t("home.featureQuizText")],
        ].map(([icon, title, text]) => (
          <article key={title} className="feature-card">
            <span className="feature-icon" aria-hidden="true">
              {icon}
            </span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="home-chat">
        <ChatPanel />
      </section>
    </>
  );
}
