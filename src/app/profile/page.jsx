"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { useGetMe, useProgress, useQuizAttempts } from "@/hooks";
import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

function ProfileBody() {
  const { locale, t } = useLocale();
  const { data } = useGetMe();
  const user = data?.data;
  const progress = useProgress(undefined, Boolean(user));
  const attempts = useQuizAttempts(undefined, Boolean(user));

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("profile.account")}</span>
        <h1>{t("profile.title")}</h1>
        <p className="lead">{user?.email}</p>
      </header>

      <div className="profile-grid">
        <section className="info-card">
          <h2>{t("profile.account")}</h2>
          <ul className="info-list">
            <li>
              <span>{t("auth.name")}</span>
              <span>{user?.name ?? "—"}</span>
            </li>
            <li>
              <span>{t("auth.email")}</span>
              <span>{user?.email ?? "—"}</span>
            </li>
            <li>
              <span>{t("profile.role")}</span>
              <span>{user?.role ?? "—"}</span>
            </li>
            <li>
              <span>{t("common.language")}</span>
              <span>{user?.preferredLang?.toUpperCase() ?? "EN"}</span>
            </li>
            <li>
              <span>{t("settings.theme")}</span>
              <span>{user?.preferredTheme ?? "indigo"}</span>
            </li>
          </ul>
          <div className="page-actions">
            <Link href="/settings" className="btn btn-ghost btn-sm">
              {t("common.settings")}
            </Link>
            <Link href="/bookmarks" className="btn btn-ghost btn-sm">
              {t("common.bookmarks")}
            </Link>
          </div>
        </section>

        <section className="info-card">
          <h2>{t("profile.progress")}</h2>
          {progress.isPending ? <p className="muted">{t("common.loading")}</p> : null}
          {!progress.isPending && (progress.data ?? []).length === 0 ? (
            <p className="muted">{t("common.empty")}</p>
          ) : null}
          <ul className="info-list">
            {(progress.data ?? []).slice(0, 8).map((record) => (
              <li key={record.id}>
                <span>
                  {record.topic ? localized(record.topic.title, locale) : record.topicId}
                </span>
                <span>{record.isRead ? t("topic.read") : "—"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-card">
          <h2>{t("profile.attempts")}</h2>
          {attempts.isPending ? <p className="muted">{t("common.loading")}</p> : null}
          {!attempts.isPending && (attempts.data ?? []).length === 0 ? (
            <p className="muted">{t("profile.noAttempts")}</p>
          ) : null}
          <ul className="info-list">
            {(attempts.data ?? []).slice(0, 8).map((attempt) => (
              <li key={attempt.id}>
                <span className="mono">
                  {attempt.score} / {attempt.total}
                </span>
                <span className="muted">
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileBody />
    </AuthGuard>
  );
}