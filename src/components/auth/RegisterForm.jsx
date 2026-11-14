"use client";

import { useGoogleOAuth, useRegistration } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function RegisterForm() {
  const router = useRouter();
  const registration = useRegistration();
  const google = useGoogleOAuth();
  const { t } = useLocale();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await registration.mutateAsync(form);
      sessionStorage.setItem("pendingVerificationEmail", form.email);
      router.push("/verify-account");
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.registerFailed")));
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setError("");
    try {
      await google.mutateAsync({ idToken: credentialResponse.credential });
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.googleFailed")));
    }
  };

  return (
    <form className="auth-card" onSubmit={submit}>
      <span className="auth-kicker">$ auth register --role=user</span>
      <h1>{t("auth.registerTitle")}</h1>
      <p className="auth-muted">{t("auth.registerIntro")}</p>

      {error ? <div className="auth-error">{error}</div> : null}

      <label>
        {t("auth.name")}
        <input
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Ada Lovelace"
        />
      </label>

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
          placeholder="you@example.com"
        />
      </label>

      <label>
        {t("auth.password")}
        <input
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          placeholder={t("auth.newPasswordHint")}
        />
      </label>

      <button
        className="auth-submit"
        type="submit"
        disabled={registration.isPending}
      >
        {registration.isPending ? t("auth.sendingOtp") : t("common.register")}
      </button>

      {googleEnabled ? (
        <div className="auth-google">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError(t("auth.googleFailed"))}
            theme="filled_black"
            shape="pill"
          />
        </div>
      ) : null}

      <div className="auth-links">
        <Link href="/login">{t("auth.alreadyAccount")}</Link>
      </div>
    </form>
  );
}
