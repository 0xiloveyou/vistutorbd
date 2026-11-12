"use client";

import {
  useGenerateQuiz,
  useGetMe,
  useQuizConfig,
  useSaveQuizConfig,
  useSubmitAttempt,
} from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { answersEquivalent } from "@/lib/mathCheck";
import { localized } from "@/lib/localized";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MathInput from "./MathInput";

const DEFAULT_CONFIG = {
  timeMode: "UNLIMITED",
  customSeconds: 30,
  answerMode: "MCQ",
  difficulty: 1,
};

const TIME_MODES = ["UNLIMITED", "BASIC", "MEDIUM", "HARD", "CUSTOM"];

export default function PracticeShell({ chapter }) {
  const { locale, t } = useLocale();
  const { data } = useGetMe();
  const user = data?.data;
  const { data: savedConfig } = useQuizConfig(chapter.id, Boolean(user));
  const saveConfig = useSaveQuizConfig();
  const generate = useGenerateQuiz();
  const submitAttempt = useSubmitAttempt();

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [stage, setStage] = useState("config");
  const [setData, setSetData] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!savedConfig) return;
    setConfig({
      timeMode: savedConfig.timeMode ?? DEFAULT_CONFIG.timeMode,
      customSeconds: savedConfig.customSeconds || DEFAULT_CONFIG.customSeconds,
      answerMode: savedConfig.answerMode ?? DEFAULT_CONFIG.answerMode,
      difficulty: savedConfig.difficulty ?? DEFAULT_CONFIG.difficulty,
    });
  }, [savedConfig]);

  const questions = setData?.questions ?? [];
  const current = questions[index];
  const timerSeconds = setData?.config?.timerSeconds ?? 0;

  useEffect(() => {
    if (stage !== "quiz" || !timerSeconds) return undefined;
    setSecondsLeft(timerSeconds);
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          setIndex((currentIndex) =>
            Math.min(currentIndex + 1, Math.max(questions.length - 1, 0)),
          );
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, stage, timerSeconds, questions.length]);

  const start = async () => {
    setError("");
    generate.mutate(
      {
        chapterId: chapter.id,
        count: 5,
        mode: config.answerMode,
        difficulty: config.difficulty,
      },
      {
        onSuccess: (data) => {
          setSetData(data);
          setAnswers({});
          setIndex(0);
          setResult(null);
          setStage("quiz");
          if (user) {
            saveConfig.mutate({
              chapterId: chapter.id,
              timeMode: config.timeMode,
              customSeconds: config.customSeconds,
              answerMode: config.answerMode,
              difficulty: config.difficulty,
              companionSlapstick: false,
            });
          }
        },
        onError: (caught) => setError(apiErrorMessage(caught, "Could not start the quiz.")),
      },
    );
  };

  const setAnswer = (value) =>
    setAnswers((currentAnswers) => ({ ...currentAnswers, [current?.id]: value }));

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]).length,
    [questions, answers],
  );

  const finish = async () => {
    setError("");
    const payload = questions.map((question) => {
      const selected = answers[question.id] ?? "";
      const option = question.options.find((item) => item.id === selected);
      return {
        templateKey: question.templateKey,
        seed: question.seed,
        submitted: option ? option.label.en : selected,
        expected: question.answer,
      };
    });

    if (!user) {
      const localResults = payload.map((answer) => ({
        ...answer,
        correct: answersEquivalent(answer.submitted, answer.expected),
      }));
      setResult({
        score: localResults.filter((item) => item.correct).length,
        total: localResults.length,
        results: localResults,
        guest: true,
      });
      setStage("result");
      return;
    }

    submitAttempt.mutate(
      {
        chapterId: chapter.id,
        durationSec: 0,
        answers: payload.map(({ templateKey, seed, submitted }) => ({
          templateKey,
          seed,
          submitted,
        })),
      },
      {
        onSuccess: (data) => {
          setResult({ ...data, guest: false });
          setStage("result");
        },
        onError: (caught) => setError(apiErrorMessage(caught, "Could not save the attempt.")),
      },
    );
  };

  if (stage === "config") {
    return (
      <section className="panel practice-panel">
        <header className="panel-head">
          <div>
            <span className="eyebrow">{t("practice.title")}</span>
            <h1>{localized(chapter.title, locale)}</h1>
          </div>
          <span className="badge">{t("practice.config")}</span>
        </header>

        <div className="form-grid">
          <label className="field">
            <span>{t("practice.timeMode")}</span>
            <select
              value={config.timeMode}
              onChange={(event) =>
                setConfig((value) => ({ ...value, timeMode: event.target.value }))
              }
            >
              {TIME_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {t(`practice.${mode.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </label>

          {config.timeMode === "CUSTOM" ? (
            <label className="field">
              <span>{t("practice.seconds")}</span>
              <input
                type="number"
                min="5"
                max="3600"
                value={config.customSeconds}
                onChange={(event) =>
                  setConfig((value) => ({
                    ...value,
                    customSeconds: Number(event.target.value),
                  }))
                }
              />
            </label>
          ) : null}

          <label className="field">
            <span>{t("practice.answerMode")}</span>
            <select
              value={config.answerMode}
              onChange={(event) =>
                setConfig((value) => ({ ...value, answerMode: event.target.value }))
              }
            >
              <option value="MCQ">{t("practice.mcq")}</option>
              <option value="TYPED">{t("practice.typed")}</option>
            </select>
          </label>

          <label className="field">
            <span>{t("practice.difficulty")}</span>
            <input
              type="range"
              min="1"
              max="5"
              value={config.difficulty}
              onChange={(event) =>
                setConfig((value) => ({
                  ...value,
                  difficulty: Number(event.target.value),
                }))
              }
            />
            <span className="mono">{config.difficulty} / 5</span>
          </label>
        </div>

        {!user ? <p className="muted">{t("practice.loginToSave")}</p> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="panel-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={start}
            disabled={generate.isPending}
          >
            {generate.isPending ? t("common.loading") : t("practice.start")}
          </button>
          <Link href={`/class/${chapter.classLevelId}`} className="btn btn-ghost">
            {t("common.back")}
          </Link>
        </div>
      </section>
    );
  }

  if (stage === "result" && result) {
    return (
      <section className="panel practice-panel">
        <header className="panel-head">
          <div>
            <span className="eyebrow">{t("practice.result")}</span>
            <h1>
              {t("practice.score")}: {result.score} / {result.total}
            </h1>
          </div>
        </header>

        {result.guest ? <p className="muted">{t("practice.loginToSave")}</p> : null}

        <ol className="result-list">
          {result.results.map((item, position) => (
            <li key={`${item.seed}-${position}`} className={item.correct ? "ok" : "bad"}>
              <span className="result-mark">{item.correct ? "✓" : "✕"}</span>
              <div>
                <p className="mono">
                  {t("practice.question")} {position + 1}: {item.submitted || "—"}
                </p>
                {!item.correct ? (
                  <p className="muted">
                    {t("practice.correct")}: <strong>{item.expected}</strong>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="panel-actions">
          <button type="button" className="btn btn-primary" onClick={() => setStage("config")}>
            {t("practice.tryAgain")}
          </button>
          <Link href={`/class/${chapter.classLevelId}`} className="btn btn-ghost">
            {t("common.back")}
          </Link>
        </div>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="panel practice-panel">
        <p className="muted">{t("practice.empty")}</p>
        <button type="button" className="btn btn-ghost" onClick={() => setStage("config")}>
          {t("common.back")}
        </button>
      </section>
    );
  }

  return (
    <section className="panel practice-panel">
      <header className="panel-head">
        <div>
          <span className="eyebrow">
            {t("practice.question")} {index + 1} {t("practice.of")} {questions.length}
          </span>
          <h1 className="question-prompt">{localized(current.prompt, locale)}</h1>
        </div>
        <div className="quiz-timer">
          {timerSeconds ? (
            <>
              <span className="muted">{t("practice.perQuestion")}</span>
              <strong className="mono">{secondsLeft}s</strong>
            </>
          ) : (
            <span className="muted">{t("practice.noTimer")}</span>
          )}
        </div>
      </header>

      {current.mode === "MCQ" ? (
        <div className="option-grid">
          {current.options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={answers[current.id] === option.id ? "option active" : "option"}
              onClick={() => setAnswer(option.id)}
            >
              <span className="option-key">{option.id.toUpperCase()}</span>
              <span>{localized(option.label, locale)}</span>
            </button>
          ))}
        </div>
      ) : (
        <MathInput
          value={answers[current.id] ?? ""}
          onChange={setAnswer}
          onSubmit={() => {
            if (index < questions.length - 1) setIndex(index + 1);
          }}
          placeholder={t("practice.typeAnswer")}
        />
      )}

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="quiz-progress">
        {questions.map((question, position) => (
          <button
            key={question.id}
            type="button"
            className={[
              "progress-dot",
              position === index ? "current" : "",
              answers[question.id] ? "answered" : "",
            ].join(" ")}
            onClick={() => setIndex(position)}
            aria-label={`${t("practice.question")} ${position + 1}`}
          >
            {position + 1}
          </button>
        ))}
      </div>

      <div className="panel-actions spread">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          disabled={index === 0}
        >
          {t("common.previous")}
        </button>

        <span className="muted mono">
          {answeredCount} / {questions.length}
        </span>

        {index < questions.length - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIndex((value) => Math.min(value + 1, questions.length - 1))}
          >
            {t("common.next")}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={finish}
            disabled={submitAttempt.isPending}
          >
            {submitAttempt.isPending ? t("common.loading") : t("practice.submit")}
          </button>
        )}
      </div>
    </section>
  );
}