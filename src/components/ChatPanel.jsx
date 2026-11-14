"use client";

import { analyzeProblemImage } from "@/api";
import { useAskCompanion, useGetMe } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { insertMathSymbol } from "@/lib/mathSymbols";
import { stopSpeech } from "@/lib/speech";
import { useClassSelection } from "@/providers/class.provider";
import { useCompanion } from "@/providers/companion.provider";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useRef, useState } from "react";
import MathPreview from "./MathPreview";
import RichMathText from "./RichMathText";
import SpeakButton from "./SpeakButton";
import MathSymbolBar from "./forum/MathSymbolBar";

export default function ChatPanel({
  vizId,
  stepIndex,
  topicSlug,
  onClose,
  compact = false,
}) {
  const { locale, toggleLocale, t } = useLocale();
  const { bandId } = useClassSelection();
  const { context: companionContext } = useCompanion();
  const { data } = useGetMe();
  const user = data?.data;
  const ask = useAskCompanion();
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => () => stopSpeech(), []);

  // The dock chat has no props; it borrows the step context published by the
  // visualization so Bolt can answer about whatever is currently on screen.
  const activeVizId = vizId ?? companionContext.vizId;
  const activeStepIndex = stepIndex ?? companionContext.stepIndex;
  const activeTopicSlug = topicSlug ?? companionContext.topicSlug;

  const send = async (override) => {
    const question = (typeof override === "string" ? override : input).trim();
    if (!question || ask.isPending) return;

    setError("");
    if (typeof override !== "string") {
      setInput("");
      setSelection({ start: 0, end: 0 });
    }
    setMessages((current) => [...current, { role: "user", content: question }]);

    try {
      const result = await ask.mutateAsync({
        sessionId: sessionId ?? undefined,
        question,
        lang: locale,
        classBandId: bandId ?? undefined,
        vizId: activeVizId,
        stepIndex: activeStepIndex,
        topicSlug: activeTopicSlug,
      });

      setSessionId(result.sessionId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          grounded: result.grounded,
          provider: result.provider,
          sources: result.sources,
        },
      ]);
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not reach the assistant."));
    }
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("Please choose an image smaller than 4 MB.");
      return;
    }

    setImageBusy(true);
    setError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setMessages((current) => [
        ...current,
        { role: "user", content: t("chat.photoAttached"), image: dataUrl },
      ]);

      const result = await analyzeProblemImage({
        imageDataUrl: dataUrl,
        lang: locale,
        classBandId: bandId ?? undefined,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${result.problem}\n\n${result.confirmation}`,
          imageRead: true,
        },
      ]);
      setInput(result.problem);
      setSelection({ start: result.problem.length, end: result.problem.length });
    } catch (caught) {
      setError(apiErrorMessage(caught, "Could not read the photo."));
    } finally {
      setImageBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const syncSelection = (event) => {
    const { selectionStart, selectionEnd } = event.currentTarget;
    setSelection({
      start: selectionStart ?? 0,
      end: selectionEnd ?? selectionStart ?? 0,
    });
  };

  // Moving the caret inside the live preview mirrors it into the textarea.
  const movePreviewCaret = ({ start, end }) => {
    setSelection({ start, end });
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(start, end);
  };

  const insertSymbol = (item) => {
    const textarea = inputRef.current;

    if (!textarea) {
      setInput((current) => `${current}${item.label}`);
      return;
    }

    const result = insertMathSymbol(
      input,
      textarea.selectionStart ?? input.length,
      textarea.selectionEnd ?? input.length,
      item,
    );

    setInput(result.value);
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

  return (
    <section
      className={
        compact ? "chat-panel compact companion-chat" : "chat-panel companion-chat"
      }
    >
      <header className="chat-head">
        <div className="chat-head-title">
          <span className="eyebrow">{t("chat.title")}</span>
          <h2>{t("home.assistantTitle")}</h2>
          {!user ? <small className="muted">{t("common.guest")}</small> : null}
        </div>
        <div className="chat-head-actions">
          <button
            type="button"
            className="chip chip-lang"
            onClick={toggleLocale}
            aria-label={t("common.language")}
          >
            {locale === "en" ? "বাংলা" : "EN"}
          </button>
          {onClose ? (
            <button type="button" className="chip" onClick={onClose}>
              ✕ {t("chat.close")}
            </button>
          ) : null}
        </div>
      </header>

      <div className="chat-log" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>{t("home.assistantIntro")}</p>
            {activeTopicSlug ? (
              <small className="muted">{t("chat.stepContext")}</small>
            ) : null}
          </div>
        ) : (
          messages.map((message, index) => (
            <article
              key={index}
              className={`chat-bubble ${message.role === "user" ? "from-user" : "from-bot"}`}
            >
              {message.image ? (
                <img
                  className="chat-image"
                  src={message.image}
                  alt={t("chat.photoAttached")}
                />
              ) : null}
              <RichMathText text={message.content} />
              {message.role === "assistant" ? (
                <footer className="chat-meta">
                  {message.imageRead ? (
                    <>
                      <span className="dot-ok" />
                      {t("chat.photoRead")}
                    </>
                  ) : (
                    <>
                      <span className={message.grounded ? "dot-ok" : "dot-warn"} />
                      {message.grounded
                        ? t("chat.grounded")
                        : t("chat.notGrounded")}
                      {message.provider === "grounded-fallback" ? (
                        <em> · {t("chat.fallback")}</em>
                      ) : null}
                    </>
                  )}
                  <SpeakButton text={message.content} />
                </footer>
              ) : null}
            </article>
          ))
        )}
        {ask.isPending ? <div className="chat-typing">…</div> : null}
        {imageBusy ? (
          <div className="chat-typing">{t("chat.readingPhoto")}</div>
        ) : null}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="chat-chips">
        <button
          type="button"
          onClick={() => send(t("chat.chipConfused"))}
          disabled={ask.isPending}
        >
          {t("chat.chipConfused")}
        </button>
        <button
          type="button"
          onClick={() => send(t("chat.chipHint"))}
          disabled={ask.isPending}
        >
          {t("chat.chipHint")}
        </button>
      </div>

      <div className="chat-compose">
        <MathSymbolBar onInsert={insertSymbol} compact />
        <textarea
          ref={inputRef}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            syncSelection(event);
          }}
          onSelect={syncSelection}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={t("chat.placeholder")}
        />
        <MathPreview
          text={input}
          label={t("chat.mathPreview")}
          compact
          editable
          selection={selection}
          onSelect={movePreviewCaret}
        />
        <div className="chat-compose-actions">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImage}
            hidden
          />
          <button
            type="button"
            className="chip"
            onClick={() => fileRef.current?.click()}
            disabled={imageBusy}
          >
            {imageBusy ? "…" : `📷 ${t("chat.upload")}`}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => send()}
            disabled={ask.isPending || !input.trim()}
          >
            {t("chat.send")}
          </button>
        </div>
      </div>
    </section>
  );
}
