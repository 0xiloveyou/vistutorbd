"use client";

import { useAskForumAi, useCreateForumComment, useGetMe } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { insertMathSymbol } from "@/lib/mathSymbols";
import { useClassSelection } from "@/providers/class.provider";
import { useLocale } from "@/providers/locale.provider";
import { useRef, useState } from "react";
import RichMathText from "@/components/RichMathText";
import MathSymbolBar from "./MathSymbolBar";

const formatDate = (value, locale) => {
  try {
    return new Date(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
};

export default function ForumPostCard({ post }) {
  const { locale, t } = useLocale();
  const { bandId } = useClassSelection();
  const { data } = useGetMe();
  const user = data?.data;

  const askAi = useAskForumAi(post.id);
  const addComment = useCreateForumComment(post.id);
  const commentRef = useRef(null);

  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [imageVisible, setImageVisible] = useState(true);
  const [error, setError] = useState("");

  const runAi = async () => {
    setError("");
    try {
      const result = await askAi.mutateAsync({
        lang: locale,
        classBandId: bandId ?? undefined,
      });
      setAiAnswer(result);
    } catch (caught) {
      setError(apiErrorMessage(caught, t("forum.aiFailed")));
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim() || addComment.isPending) return;

    setError("");
    try {
      await addComment.mutateAsync({
        body: comment.trim(),
        isAnonymous: !user || anonymous,
      });
      setComment("");
      setAnonymous(true);
    } catch (caught) {
      setError(apiErrorMessage(caught, t("forum.commentFailed")));
    }
  };

  const insertCommentSymbol = (item) => {
    const textarea = commentRef.current;
    if (!textarea) {
      setComment((current) => `${current}${item.label}`);
      return;
    }

    const result = insertMathSymbol(
      comment,
      textarea.selectionStart ?? comment.length,
      textarea.selectionEnd ?? comment.length,
      item,
    );

    setComment(result.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        result.selectionStart,
        result.selectionEnd,
      );
    });
  };

  return (
    <article className="forum-post">
      <header className="forum-post-head">
        <span className="forum-avatar" aria-hidden="true">
          {post.isAnonymous ? "?" : post.author.slice(0, 1).toUpperCase()}
        </span>
        <div className="forum-author">
          <strong>{post.author}</strong>
          <small className="muted">{formatDate(post.createdAt, locale)}</small>
        </div>
        <div className="forum-post-tags">
          {post.tags.map((tag) => (
            <span key={tag} className="tag-chip small">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <h3 className="forum-post-title">
        <RichMathText text={post.title} />
      </h3>

      <div className="forum-body">
        <RichMathText text={post.body} />
      </div>

      {post.imageUrl && imageVisible ? (
        <a
          className="forum-image"
          href={post.imageUrl}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageVisible(false)}
          />
        </a>
      ) : null}

      <footer className="forum-post-actions">
        <button
          type="button"
          className="chip"
          onClick={() => setShowComments((value) => !value)}
        >
          💬 {post.commentCount} {t("forum.comments")}
        </button>
        <button
          type="button"
          className="chip chip-primary"
          onClick={runAi}
          disabled={askAi.isPending}
        >
          ✨ {askAi.isPending ? t("forum.asking") : t("forum.askAi")}
        </button>
      </footer>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {aiAnswer ? (
        <div className="forum-ai-answer">
          <div className="forum-ai-head">
            <strong>🤖 {t("forum.aiAnswer")}</strong>
            <span className={aiAnswer.grounded ? "dot-ok" : "dot-warn"} />
            <small className="muted">
              {aiAnswer.grounded
                ? t("forum.grounded")
                : t("forum.notGrounded")}
            </small>
          </div>
          <RichMathText text={aiAnswer.answer} />
        </div>
      ) : null}

      {showComments ? (
        <section className="forum-comments">
          {post.comments?.length ? (
            <ul className="forum-comment-list">
              {post.comments.map((item) => (
                <li key={item.id} className="forum-comment">
                  <div className="forum-comment-head">
                    <strong>{item.author}</strong>
                    <small className="muted">
                      {formatDate(item.createdAt, locale)}
                    </small>
                  </div>
                  <div className="forum-comment-body">
                    <RichMathText text={item.body} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t("forum.noComments")}</p>
          )}

          <form className="forum-comment-form" onSubmit={submitComment}>
            <MathSymbolBar onInsert={insertCommentSymbol} compact />
            <textarea
              ref={commentRef}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              maxLength={4000}
              placeholder={t("forum.commentPlaceholder")}
            />
            {comment.includes("$") ? (
              <div className="math-preview compact" aria-live="polite">
                <span className="eyebrow">{t("forum.mathPreview")}</span>
                <div className="math-preview-body">
                  <RichMathText text={comment} />
                </div>
              </div>
            ) : null}
            <div className="forum-comment-actions">
              <label className="forum-anon-toggle">
                <input
                  type="checkbox"
                  checked={!user || anonymous}
                  disabled={!user}
                  onChange={(event) => setAnonymous(event.target.checked)}
                />
                <span>
                  {!user
                    ? t("forum.guestAnon")
                    : anonymous
                      ? t("forum.anonymous")
                      : t("forum.postAs", { name: user.name })}
                </span>
              </label>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={addComment.isPending || !comment.trim()}
              >
                {addComment.isPending
                  ? t("forum.commenting")
                  : t("forum.comment")}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </article>
  );
}
