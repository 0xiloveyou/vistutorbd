"use client";

import {
  useAddBookmark,
  useGetMe,
  useRemoveBookmark,
  useSaveProgress,
} from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useState } from "react";
import LoginPrompt from "./LoginPrompt";

export default function TopicActions({ topic }) {
  const { t } = useLocale();
  const { data } = useGetMe();
  const user = data?.data;
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const saveProgress = useSaveProgress();

  const [bookmarked, setBookmarked] = useState(Boolean(topic.bookmarked));
  const [isRead, setIsRead] = useState(Boolean(topic.progress?.isRead));
  const [promptOpen, setPromptOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBookmarked(Boolean(topic.bookmarked));
    setIsRead(Boolean(topic.progress?.isRead));
  }, [topic.bookmarked, topic.progress?.isRead]);

  const toggleBookmark = async () => {
    if (!user) {
      setPromptOpen(true);
      return;
    }

    setError("");
    try {
      if (bookmarked) {
        await removeBookmark.mutateAsync(topic.id);
        setBookmarked(false);
      } else {
        await addBookmark.mutateAsync(topic.id);
        setBookmarked(true);
      }
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not update the bookmark."));
    }
  };

  const markRead = async () => {
    if (!user) {
      setPromptOpen(true);
      return;
    }

    setError("");
    try {
      await saveProgress.mutateAsync({
        topicId: topic.id,
        payload: { isRead: !isRead },
      });
      setIsRead((value) => !value);
      setMessage(t("topic.progressSaved"));
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not save progress."));
    }
  };

  return (
    <div className="topic-actions">
      <button
        type="button"
        className={bookmarked ? "btn btn-primary" : "btn btn-ghost"}
        onClick={toggleBookmark}
        disabled={addBookmark.isPending || removeBookmark.isPending}
      >
        {bookmarked ? `★ ${t("topic.bookmarked")}` : `☆ ${t("topic.bookmark")}`}
      </button>
      <button
        type="button"
        className={isRead ? "btn btn-soft" : "btn btn-ghost"}
        onClick={markRead}
        disabled={saveProgress.isPending}
      >
        {isRead ? `✓ ${t("topic.read")}` : t("topic.markRead")}
      </button>
      {message ? <span className="muted">{message}</span> : null}
      {error ? <span className="error-text">{error}</span> : null}
      <LoginPrompt open={promptOpen} onClose={() => setPromptOpen(false)} />
    </div>
  );
}