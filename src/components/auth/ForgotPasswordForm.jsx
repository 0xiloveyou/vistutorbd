"use client";

import { useForgotPassword, useResetPassword } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const { t } = useLocale();
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await forgot.mutateAsync({ email: form.email });
      setStep("reset");
      setMessage(t("auth.otpSent"));
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.resetFailed")));
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await reset.mutateAsync(form);
      setMessage(t("auth.passwordChanged"));
      setStep("done");
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.resetFailed")));
    }
  };

  return (
    <form
      className="auth-card"
      onSubmit={step === "request" ? requestOtp : resetPassword}
    >
      <span className="auth-kicker">$ auth reset-password</span>
      <h1>{t("auth.resetTitle")}</h1>
      <p className="auth-muted">
        {step === "request"
          ? t("auth.resetRequestIntro")
          : t("auth.resetApplyIntro")}
      </p>

      {error ? <div className="auth-error">{error}</div> : null}
      {message ? <div className="auth-success">{message}</div> : null}

      <label>
        {t("auth.email")}
        <input
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
      </label>

      {step !== "request" ? (
        <>
          <label>
            {t("auth.otp")}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={form.otp}
              onChange={(event) =>
                setForm((current) => ({ ...current, otp: event.target.value }))
              }
            />
          </label>

          <label>
            {t("auth.newPassword")}
            <input
              type="password"
              autoComplete="new-password"
              required
              placeholder={t("auth.newPasswordHint")}
              value={form.newPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
            />
          </label>
        </>
      ) : null}

      {step !== "done" ? (
        <button
          className="auth-submit"
          type="submit"
          disabled={forgot.isPending || reset.isPending}
        >
          {step === "request" ? t("auth.sendOtp") : t("auth.changePassword")}
        </button>
      ) : null}

      <div className="auth-links">
        <Link href="/login">{t("auth.backToLogin")}</Link>
      </div>
    </form>
  );
}