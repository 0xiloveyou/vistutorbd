"use client";

import { sendContactMessage } from "@/api";
import { apiErrorMessage } from "@/lib/apiClient";
import { useLocale } from "@/providers/locale.provider";
import { useState } from "react";

const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "care.1337.leet@gmail.com";

export default function ContactPage() {
  const { t } = useLocale();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("sending");

    try {
      await sendContactMessage(form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (caught) {
      setStatus("idle");
      setError(apiErrorMessage(caught, t("contact.failed")));
    }
  };

  return (
    <div className="contact-page">
      <header className="page-head">
        <span className="eyebrow">{t("common.contact")}</span>
        <h1>{t("contact.title")}</h1>
        <p className="lead">{t("contact.subtitle")}</p>
      </header>

      <div className="contact-layout">
        <form className="panel contact-form" onSubmit={submit}>
          <div className="contact-row">
            <label className="field">
              <span>{t("contact.name")}</span>
              <input
                required
                value={form.name}
                onChange={update("name")}
                minLength={2}
                maxLength={120}
              />
            </label>
            <label className="field">
              <span>{t("contact.email")}</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                maxLength={160}
              />
            </label>
          </div>

          <label className="field">
            <span>{t("contact.subject")}</span>
            <input
              required
              value={form.subject}
              onChange={update("subject")}
              minLength={3}
              maxLength={160}
            />
          </label>

          <label className="field">
            <span>{t("contact.message")}</span>
            <textarea
              required
              rows={7}
              value={form.message}
              onChange={update("message")}
              minLength={10}
              maxLength={4000}
            />
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {status === "sent" ? (
            <div className="alert alert-success">{t("contact.sent")}</div>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === "sending"}
          >
            {status === "sending" ? t("contact.sending") : t("contact.send")} →
          </button>
        </form>

        <aside className="panel contact-aside">
          <h2>{t("contact.direct")}</h2>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <h3>{t("contact.hours")}</h3>
          <p className="muted">{t("contact.hoursValue")}</p>
        </aside>
      </div>
    </div>
  );
}
