"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { useBookmarks, useRemoveBookmark } from "@/hooks";
import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

function BookmarksBody() {
  const { locale, t } = useLocale();
  const { data, isPending, isError } = useBookmarks();
  const remove = useRemoveBookmark();
  const bookmarks = data ?? [];

  return (
    <>
      <header className="page-head">
        <span className="eyebrow">{t("common.bookmarks")}</span>
        <h1>{t("bookmarks.title")}</h1>
      </header>

      {isPending ? <p className="muted">{t("common.loading")}</p> : null}
      {isError ? <div className="alert alert-error">{t("bookmarks.empty")}</div> : null}

      {!isPending && bookmarks.length === 0 ? (
        <div className="empty-panel">
          <h2>{t("common.empty")}</h2>
          <p>{t("bookmarks.empty")}</p>
          <Link href="/" className="btn btn-primary">
            {t("notFound.back")}
          </Link>
        </div>
      ) : null}

      <div className="topic-list">
        {bookmarks.map((bookmark) => {
          const topic = bookmark.topic;
          if (!topic) return null;

          return (
            <article key={bookmark.id} className="info-card">
              <div>
                <h2>{localized(topic.title, locale)}</h2>
                <p className="muted">{localized(topic.summary, locale)}</p>
              </div>
              <div className="topic-actions">
                <Link href={`/topic/${topic.slug}`} className="btn btn-primary btn-sm">
                  {t("topic.lesson")} →
                </Link>
                <span className="badge">L{topic.difficulty ?? 1}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => remove.mutate(topic.id)}
                  disabled={remove.isPending}
                >
                  ★ {t("topic.bookmarked")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function BookmarksPage() {
  return (
    <AuthGuard>
      <BookmarksBody />
    </AuthGuard>
  );
}