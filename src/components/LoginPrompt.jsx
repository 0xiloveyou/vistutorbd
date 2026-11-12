"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function LoginPrompt({ open, onClose }) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h2>{t("common.loginRequired")}</h2>
        <p>{t("common.loginPrompt")}</p>
        <div className="modal-actions">
          <Link href="/login" className="btn btn-primary">
            {t("common.login")}
          </Link>
          <Link href="/register" className="btn btn-ghost">
            {t("common.register")}
          </Link>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}