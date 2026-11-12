"use client";

import { localized } from "@/lib/localized";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function ClassPicker({ showLink = true }) {
  const { bands, bandId, levelId, band, level, select } = useClassSelection();
  const { locale, t } = useLocale();

  const levels = band?.levels ?? [];

  return (
    <div className="class-picker" aria-label={t("home.chooseClass")}>
      <select
        aria-label={t("home.chooseClass")}
        value={bandId ?? ""}
        onChange={(event) => {
          const nextBand = bands.find((item) => item.id === event.target.value);
          const nextLevel = nextBand?.levels?.[0]?.id ?? null;
          select(event.target.value, nextLevel);
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
        onChange={(event) => select(bandId, event.target.value)}
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