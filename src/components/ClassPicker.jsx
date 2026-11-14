"use client";

import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClassPicker({ showLink = true, redirectTo = null }) {
  const { bands, bandId, levelId, band, level, select } = useClassSelection();
  const { locale, t } = useLocale();
  const router = useRouter();

  const levels = band?.levels ?? [];

  // Selecting a class can take the visitor straight to the class-based lessons.
  const choose = (nextBandId, nextLevelId) => {
    select(nextBandId, nextLevelId);
    if (redirectTo && nextLevelId) router.push(redirectTo);
  };

  return (
    <div className="class-picker" aria-label={t("home.chooseClass")}>
      <select
        aria-label={t("home.chooseClass")}
        value={bandId ?? ""}
        onChange={(event) => {
          const nextBand = bands.find((item) => item.id === event.target.value);
          const nextLevel = nextBand?.levels?.[0]?.id ?? null;
          choose(event.target.value, nextLevel);
        }}
      >
        <option value="">{t("class.choose")}</option>
        {bands.map((item) => (
          <option key={item.id} value={item.id}>
            {localized(item.name, locale)}
          </option>
        ))}
      </select>

      <select
        aria-label={t("settings.class")}
        value={levelId ?? ""}
        onChange={(event) => choose(bandId, event.target.value)}
        disabled={!bandId}
      >
        <option value="">—</option>
        {levels.map((item) => (
          <option key={item.id} value={item.id}>
            {localized(item.name, locale)}
          </option>
        ))}
      </select>

      {showLink && level ? (
        <Link className="btn btn-ghost btn-sm" href={`/class/${level.id}`}>
          {localized(level.name, locale)} →
        </Link>
      ) : null}
    </div>
  );
}