"use client";

import { useVerifyAccount } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyForm() {
  const router = useRouter();
  const verify = useVerifyAccount();
  const { t } = useLocale();
  const [form, setForm] = useState({ email: "", otp: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const email = sessionStorage.getItem("pendingVerificationEmail");
    if (email) {
      setForm((current) => ({ ...current, email }));
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await verify.mutateAsync(form);
      sessionStorage.removeItem("pendingVerificationEmail");
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.verifyFailed")));
    }
  };

  return (
    <form className="auth-card" onSubmit={submit}>
      <span className="auth-kicker">$ auth verify --otp</span>
      <h1>{t("auth.verifyTitle")}</h1>
      <p className="auth-muted">{t("auth.verifyIntro")}</p>

      {error ? <div className="auth-error">{error}</div> : null}

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
          placeholder="123456"
        />
      </label>

      <button className="auth-submit" type="submit" disabled={verify.isPending}>
        {verify.isPending ? t("auth.verifying") : t("auth.signIn")}
      </button>
    </form>
  );
}