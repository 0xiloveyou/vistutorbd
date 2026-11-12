"use client";

import ForumComposer from "@/components/forum/ForumComposer";
import ForumPostCard from "@/components/forum/ForumPostCard";
import { useForumPosts, useForumTags } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useState } from "react";

export default function ForumPage() {
  const { locale, t } = useLocale();
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("new");

  const tagsQuery = useForumTags();
  const postsQuery = useForumPosts({
    ...(tag ? { tag } : {}),
    sort,
    limit: 30,
  });

  const predefined = tagsQuery.data?.predefined ?? [];
  const popular = tagsQuery.data?.popular ?? [];
  const customTags = popular.filter(
    (item) => !predefined.some((tagItem) => tagItem.id === item.id),
  );
  const posts = postsQuery.data?.posts ?? [];

  return (
    <div className="forum-page">
      <section className="forum-hero">
        <span className="eyebrow">{t("forum.kicker")}</span>
        <h1>{t("forum.title")}</h1>
        <p className="lead">{t("forum.subtitle")}</p>
        <div className="forum-hero-points">
          <span className="chip chip-soft">✍️ {t("forum.pointPost")}</span>
          <span className="chip chip-soft">🖼 {t("forum.pointImage")}</span>
          <span className="chip chip-soft">🤖 {t("forum.pointAi")}</span>
        </div>
      </section>

      <ForumComposer
        predefinedTags={predefined}
        onCreated={() => postsQuery.refetch()}
      />

      <section className="forum-feed">
        <div className="forum-feed-head">
          <div>
            <h2>{t("forum.latest")}</h2>
            <p className="muted">
              {t("forum.count", { count: postsQuery.data?.meta?.total ?? 0 })}
            </p>
          </div>

          <label className="forum-sort">
            <span>{t("forum.sort")}</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="new">{t("forum.newest")}</option>
              <option value="old">{t("forum.oldest")}</option>
            </select>
          </label>
        </div>

        <div className="forum-tag-filter" aria-label={t("forum.filterByTag")}>
          <button
            type="button"
            className={tag ? "tag-chip" : "tag-chip active"}
            onClick={() => setTag("")}
          >
            {t("forum.allTags")}
          </button>

          {predefined.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tag === item.id ? "tag-chip active" : "tag-chip"}
              onClick={() => setTag(tag === item.id ? "" : item.id)}
            >
              #{locale === "bn" ? item.bn : item.en}
            </button>
          ))}

          {customTags.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tag === item.id ? "tag-chip active" : "tag-chip"}
              onClick={() => setTag(tag === item.id ? "" : item.id)}
            >
              #{item.id} <small className="muted">{item.count}</small>
            </button>
          ))}
        </div>

        {postsQuery.isLoading ? (
          <p className="muted">{t("common.loading")}</p>
        ) : null}

        {postsQuery.isError ? (
          <div className="alert alert-error">
            {apiErrorMessage(postsQuery.error, t("forum.loadFailed"))}
          </div>
        ) : null}

        {!postsQuery.isLoading && !postsQuery.isError && !posts.length ? (
          <div className="forum-empty panel">
            <p>{t("forum.empty")}</p>
          </div>
        ) : null}

        <div className="forum-list">
          {posts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
