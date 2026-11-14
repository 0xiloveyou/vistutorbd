export default function ForumPostSkeleton() {
  return (
    <article className="forum-post forum-post-skeleton" aria-hidden="true">
      <header className="forum-post-head">
        <span className="forum-skeleton forum-skeleton-avatar" />
        <div className="forum-author">
          <span className="forum-skeleton forum-skeleton-name" />
          <span className="forum-skeleton forum-skeleton-meta" />
        </div>
        <span className="forum-skeleton forum-skeleton-tag" />
      </header>

      <span className="forum-skeleton forum-skeleton-title" />

      <div className="forum-skeleton-copy">
        <span className="forum-skeleton forum-skeleton-text" />
        <span className="forum-skeleton forum-skeleton-text" />
        <span className="forum-skeleton forum-skeleton-text forum-skeleton-short" />
      </div>

      <footer className="forum-post-actions">
        <span className="forum-skeleton forum-skeleton-action" />
        <span className="forum-skeleton forum-skeleton-action forum-skeleton-action-wide" />
      </footer>
    </article>
  );
}
