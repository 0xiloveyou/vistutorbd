"use client";

import { useCreateForumPost, useGetMe } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { insertMathSymbol } from "@/lib/mathSymbols";
import { useLocale } from "@/providers/locale.provider";
import { useRef, useState } from "react";
import MathPreview from "@/components/MathPreview";
import MathSymbolBar from "./MathSymbolBar";

export default function ForumComposer({
  predefinedTags = [],
  onCreated,
  onCancel,
  autoFocus = false,
}) {
  const { locale, t } = useLocale();
  const { data } = useGetMe();
  const user = data?.data;
  const createPost = useCreateForumPost();
  const bodyRef = useRef(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [error, setError] = useState("");

  const toggleTag = (id) => {
    setTags((current) =>
      current.includes(id)
        ? current.filter((tag) => tag !== id)
        : current.length >= 6
          ? current
          : [...current, id],
    );
  };

  const addCustomTag = () => {
    const value = customTag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!value) return;
    if (!tags.includes(value) && tags.length < 6) setTags([...tags, value]);
    setCustomTag("");
  };

  const insertSymbol = (item) => {
    const textarea = bodyRef.current;

    if (!textarea) {
      setBody((current) => `${current}${item.label}`);
      return;
    }

    const result = insertMathSymbol(
      body,
      textarea.selectionStart ?? body.length,
      textarea.selectionEnd ?? body.length,
      item,
    );

    setBody(result.value);
    setSelection({
      start: result.selectionStart,
      end: result.selectionEnd,
    });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        result.selectionStart,
        result.selectionEnd,
      );
    });
  };

  const syncSelection = (event) => {
    const { selectionStart, selectionEnd } = event.currentTarget;
    setSelection({
      start: selectionStart ?? 0,
      end: selectionEnd ?? selectionStart ?? 0,
    });
  };

  const movePreviewCaret = ({ start, end }) => {
    setSelection({ start, end });
    const textarea = bodyRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(start, end);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (createPost.isPending) return;

    setError("");

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim(),
        tags,
        isAnonymous: !user || anonymous,
      });

      setTitle("");
      setBody("");
      setSelection({ start: 0, end: 0 });
      setImageUrl("");
      setTags([]);
      setCustomTag("");
      setAnonymous(true);
      onCreated?.();
    } catch (caught) {
      setError(apiErrorMessage(caught, t("forum.failed")));
    }
  };

  return (
    <form className="forum-composer panel" onSubmit={submit}>
      <div className="forum-composer-head">
        <div>
          <span className="eyebrow">{t("forum.composeKicker")}</span>
          <h2>{t("forum.compose")}</h2>
        </div>
        <div className="forum-composer-head-actions">
          <span className="chip chip-soft">{t("forum.anonymousOrName")}</span>
          {onCancel ? (
            <button
              type="button"
              className="chip"
              onClick={onCancel}
              aria-label={t("forum.closeComposer")}
            >
              ✕ {t("forum.closeComposer")}
            </button>
          ) : null}
        </div>
      </div>

      <label className="field">
        <span>{t("forum.postTitle")}</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          required
          autoFocus={autoFocus}
          placeholder={t("forum.postTitlePlaceholder")}
        />
      </label>

      <label className="field">
        <span>{t("forum.body")}</span>
        <MathSymbolBar onInsert={insertSymbol} />
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            syncSelection(event);
          }}
          onSelect={syncSelection}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          rows={5}
          maxLength={8000}
          required
          placeholder={t("forum.bodyPlaceholder")}
        />
        <small className="muted">{t("forum.mathHint")}</small>
      </label>

      <MathPreview
        text={body}
        label={t("forum.mathPreview")}
        editable
        selection={selection}
        onSelect={movePreviewCaret}
      />

      <label className="field">
        <span>{t("forum.imageUrl")}</span>
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          maxLength={2000}
          placeholder="https://example.com/problem.png"
        />
        <small className="muted">{t("forum.imageUrlHint")}</small>
      </label>

      <div className="field">
        <span>{t("forum.tags")}</span>
        <div className="forum-tag-picker">
          {predefinedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={tags.includes(tag.id) ? "tag-chip active" : "tag-chip"}
              onClick={() => toggleTag(tag.id)}
            >
              #{locale === "bn" ? tag.bn : tag.en}
            </button>
          ))}
        </div>

        <div className="forum-custom-tag">
          <input
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTag();
              }
            }}
            maxLength={24}
            placeholder={t("forum.customTag")}
          />
          <button type="button" className="chip" onClick={addCustomTag}>
            + {t("forum.add")}
          </button>
        </div>

        {tags.length ? (
          <div className="forum-selected-tags">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="tag-chip active"
                onClick={() => toggleTag(tag)}
                title={t("forum.removeTag")}
              >
                #{tag} ×
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="forum-composer-footer">
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
          className="btn btn-primary"
          disabled={createPost.isPending || !title.trim() || !body.trim()}
        >
          {createPost.isPending ? t("forum.publishing") : t("forum.publish")}
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
    </form>
  );
}
