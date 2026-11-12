"use client";

import { googleCallback } from "@/api";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function GoogleCallbackPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      setBusy(false);
      setError("Google did not return an authorization code.");
      return;
    }

    googleCallback({ code })
      .then(() => {
        router.replace("/");
        router.refresh();
      })
      .catch((caught) => {
        setBusy(false);
        setError(apiErrorMessage(caught, "Google login failed."));
      });
  }, [router]);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <span className="auth-kicker">$ auth google --callback</span>
        <h1>{t("auth.signIn")}</h1>
        {busy ? <p className="auth-muted">{t("common.loading")}</p> : null}
        {error ? <div className="auth-error">{error}</div> : null}
      </div>
    </div>
  );
}