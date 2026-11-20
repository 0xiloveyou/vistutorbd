"use client";

import ClassPicker from "@/components/ClassPicker";
import { useGetMe, useSavePreferences } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { THEMES } from "@/lib/themes";
import { useClassSelection } from "@/providers/class.provider";
import { useCompanion } from "@/providers/companion.provider";
import { useLocale } from "@/providers/locale.provider";
import { useTheme } from "@/providers/theme.provider";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { locale, setLocale, t } = useLocale();
  const { theme, mode, setTheme, setMode } = useTheme();
  const { bandId, levelId } = useClassSelection();
  const { mode: companionMode, setMode: setCompanionMode } = useCompanion();
  const { data } = useGetMe();
  const user = data?.data;
  const save = useSavePreferences();

  const [sound, setSound] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setCompanionMode(user.companionEnabled ? "companion" : "default");
    setSound(user.soundEnabled !== false);
  }, [user, setCompanionMode]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setMessage(t("settings.loginNote"));
      return;
    }

    try {
      await save.mutateAsync({
        preferredLang: locale,
        preferredTheme: theme,
        classBandId: bandId || null,
        classLevelId: levelId || null,
        companionEnabled: companionMode === "companion",
        soundEnabled: sound,
      });
      setMessage(t("common.saved"));
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not save settings."));
    }
  };

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("settings.preferences")}</span>
        <h1>{t("settings.title")}</h1>
        {!user ? <p className="lead">{t("settings.loginNote")}</p> : null}
      </header>

      <form className="panel settings-form" onSubmit={submit}>
        <label className="field">
          <span>{t("settings.language")}</span>
          <select value={locale} onChange={(event) => setLocale(event.target.value)}>
            <option value="en">{t("common.english")}</option>
            <option value="bn">{t("common.bangla")}</option>
          </select>
        </label>

        <label className="field">
          <span>{t("settings.theme")}</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value)}>
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[locale] ?? item.name.en}
              </option>
            ))}
          </select>
        </label>

        <div className="theme-swatches" role="group" aria-label={t("settings.theme")}>
          {THEMES.map((item) => {
            const active = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={active ? "theme-swatch active" : "theme-swatch"}
                onClick={() => setTheme(item.id)}
                aria-pressed={active}
              >
                <span
                  className="theme-swatch-dot"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${item.swatch} 0%, ${item.swatch2 ?? item.swatch} 100%)`,
                  }}
                />
                <span>{item.name[locale] ?? item.name.en}</span>
                {active ? (
                  <span className="theme-swatch-check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <label className="field">
          <span>{t("settings.mode")}</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="light">{t("common.light")}</option>
            <option value="dark">{t("common.dark")}</option>
          </select>
        </label>

        <div className="field">
          <span>{t("settings.class")}</span>
          <ClassPicker showLink={false} />
        </div>

        <label className="field">
          <span>{t("settings.companionMode")}</span>
          <select
            value={companionMode}
            onChange={(event) => setCompanionMode(event.target.value)}
          >
            <option value="companion">{t("settings.aiCompanion")}</option>
            <option value="default">{t("settings.defaultVisualization")}</option>
          </select>
          <small className="muted">{t("settings.companionModeHint")}</small>
        </label>

        <div className="toggle-row">
          <label htmlFor="sound-toggle">
            {t("settings.sound")}
            <small>{t("topic.visualization")}</small>
          </label>
          <input
            id="sound-toggle"
            type="checkbox"
            checked={sound}
            onChange={(event) => setSound(event.target.checked)}
          />
        </div>

        {message ? <div className="alert alert-success">{message}</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="panel-actions">
          <button type="submit" className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>

      <section className="panel settings-privacy">
        <div>
          <h2>{t("settings.privacyChoices")}</h2>
          <p className="muted">{t("settings.privacyHint")}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => window.dispatchEvent(new Event("viztutor-open-privacy-settings"))}
        >
          {t("settings.privacyButton")}
        </button>
      </section>
    </>
  );
}
