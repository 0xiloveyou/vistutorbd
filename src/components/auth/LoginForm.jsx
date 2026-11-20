"use client";

import { useGoogleOAuth, useLogin } from "@/hooks";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export default function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const google = useGoogleOAuth();
  const { t } = useLocale();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login.mutateAsync(form);
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(apiErrorMessage(caught, t("auth.loginFailed")));
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
      <span className="auth-kicker">$ auth login</span>
      <h1>{t("auth.welcome")}</h1>
      <p className="auth-muted">{t("auth.loginIntro")}</p>

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
          placeholder="you@example.com"
        />
      </label>

      <label>
        {t("auth.password")}
        <input
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="••••••••"
        />
      </label>

      <button className="auth-submit" type="submit" disabled={login.isPending}>
        {login.isPending ? t("auth.signingIn") : t("auth.signIn")}
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

      <div className="demo-login-actions" aria-label="Judge demo accounts">
        <Link href="/demo-user" className="btn">Continue as demo learner</Link>
        <Link href="/demo-admin" className="btn">Continue as demo admin</Link>
      </div>

      <div className="auth-links">
        <Link href="/forgot-password">{t("auth.forgot")}</Link>
        <Link href="/register">{t("auth.noAccount")}</Link>
      </div>
    </form>
  );
}
