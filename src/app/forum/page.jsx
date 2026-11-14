"use client";

import ForumComposer from "@/components/forum/ForumComposer";
import ForumPostCard from "@/components/forum/ForumPostCard";
import ForumPostSkeleton from "@/components/forum/ForumPostSkeleton";
import { useForumPosts, useForumTags } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useRef, useState } from "react";

export default function ForumPage() {
  const { locale, t } = useLocale();
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("new");
  const [showComposer, setShowComposer] = useState(false);
  const composerRef = useRef(null);
  const sentinelRef = useRef(null);

  const tagsQuery = useForumTags();
  const postsQuery = useForumPosts({
    ...(tag ? { tag } : {}),
    sort,
    limit: 10,
  });

  const predefined = tagsQuery.data?.predefined ?? [];
  const popular = tagsQuery.data?.popular ?? [];
  const customTags = popular.filter(
    (item) => !predefined.some((tagItem) => tagItem.id === item.id),
  );
  const posts =
    postsQuery.data?.pages.flatMap((pageData) => pageData.posts) ?? [];
  const meta = postsQuery.data?.pages[0]?.meta;
  const hasNextPage = Boolean(postsQuery.hasNextPage);
  const loadingMore = postsQuery.isFetchingNextPage;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !loadingMore &&
          !postsQuery.isFetching
        ) {
          postsQuery.fetchNextPage();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, postsQuery.isFetching, postsQuery.fetchNextPage]);

  const openComposer = () => {
    setShowComposer((current) => !current);
    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="forum-page">
      {showComposer ? (
        <div ref={composerRef} id="forum-composer">
          <ForumComposer
            predefinedTags={predefined}
            autoFocus
            onCancel={() => setShowComposer(false)}
            onCreated={() => {
              setShowComposer(false);
              postsQuery.refetch();
            }}
          />
        </div>
      ) : null}

      <section className="forum-feed">
        <div className="forum-feed-head">
          <div>
            <h2>{t("forum.latest")}</h2>
            <p className="muted">
              {postsQuery.isLoading
                ? t("common.loading")
                : t("forum.count", { count: meta?.total ?? 0 })}
            </p>
          </div>

          <div className="forum-feed-actions">
            <button
              type="button"
              className={showComposer ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}
              onClick={openComposer}
              aria-expanded={showComposer}
              aria-controls="forum-composer"
            >
              {showComposer
                ? `✕ ${t("forum.closeComposer")}`
                : `✍️ ${t("forum.newPost")}`}
            </button>
            <label className="forum-sort">
              <span>{t("forum.sort")}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="new">{t("forum.newest")}</option>
                <option value="old">{t("forum.oldest")}</option>
              </select>
            </label>
          </div>
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

        {postsQuery.isError ? (
          <div className="alert alert-error">
            {apiErrorMessage(postsQuery.error, t("forum.loadFailed"))}
          </div>
        ) : null}

        {!postsQuery.isLoading && !postsQuery.isError && !posts.length ? (
          <div className="forum-empty panel">
            <p>{t("forum.empty")}</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowComposer(true)}
            >
              ✍️ {t("forum.newPost")}
            </button>
          </div>
        ) : null}

        {postsQuery.isLoading ? (
          <div
            className="forum-list"
            role="status"
            aria-label={t("common.loading")}
          >
            {Array.from({ length: 3 }, (_, index) => (
              <ForumPostSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="forum-list">
            {posts.map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
            {loadingMore ? <ForumPostSkeleton /> : null}
          </div>
        )}

        <div ref={sentinelRef} className="forum-load-more">
          {loadingMore ? <span>{t("forum.loadingMore")}</span> : null}
          {!loadingMore && hasNextPage ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => postsQuery.fetchNextPage()}
            >
              ↓ {t("forum.loadMore")}
            </button>
          ) : null}
          {!loadingMore && !hasNextPage && posts.length ? (
            <small className="muted">{t("forum.endOfFeed")}</small>
          ) : null}
        </div>
      </section>
    </div>
  );
}
