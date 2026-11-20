"use client";

import Link from "next/link";
import { useLocale } from "@/providers/locale.provider";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, CONSENT_KEY } from "./VisitorTracker";

const copy = {
  en: {
    title: "Your privacy choices",
    intro: "Essential storage supports sign-in. Optional analytics measures page views.",
    ip: "IP addresses are also logged for security, even if analytics is off.",
    essential: "Essential only",
    customize: "Customize",
    analytics: "Optional analytics",
    analyticsHint: "Allow page-view measurement; analytics records include your request IP address.",
    save: "Save choices",
    accept: "Accept all",
    privacy: "Privacy Policy",
  },
  bn: {
    title: "আপনার গোপনীয়তা পছন্দ",
    intro: "সাইন-ইন ও আপনার পছন্দ চালু রাখতে প্রয়োজনীয় স্টোরেজ ব্যবহৃত হয়। ঐচ্ছিক অ্যানালিটিক্স সাইটের ব্যবহার মাপতে এলোমেলো ব্রাউজার আইডি, দেখা পৃষ্ঠা ও অনুরোধের IP ঠিকানা সংরক্ষণ করে.",
    ip: "এ ছাড়াও নিরাপত্তা ও সমস্যা সমাধানের জন্য ব্যাকএন্ড অপারেশনাল লগে সব অনুরোধের IP ঠিকানা রাখা হয়। IP ঠিকানা কুকি নয়। গোপনীয়তা নীতি দেখুন।",
    essential: "শুধু প্রয়োজনীয়",
    customize: "পছন্দ বদলান",
    analytics: "ঐচ্ছিক অ্যানালিটিক্স",
    analyticsHint: "বেনামি পৃষ্ঠা-দর্শন পরিমাপে অনুমতি দিন।",
    save: "পছন্দ সংরক্ষণ",
    accept: "সব গ্রহণ",
    privacy: "গোপনীয়তা নীতি",
  },
};

export default function ConsentManager() {
  const { locale } = useLocale();
  const lang = locale === "bn" ? "bn" : "en";
  const text = copy[lang];
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
      if (saved && typeof saved.analytics === "boolean") {
        setAnalytics(saved.analytics);
      } else {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
    const showSettings = () => {
      setCustomizing(true);
      setOpen(true);
    };
    window.addEventListener("viztutor-open-privacy-settings", showSettings);
    return () => window.removeEventListener("viztutor-open-privacy-settings", showSettings);
  }, []);

  const save = (allowAnalytics) => {
    const next = { essential: true, analytics: allowAnalytics, updatedAt: new Date().toISOString() };
    if (!allowAnalytics) localStorage.removeItem("viztutor-visitor-id");
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    setAnalytics(allowAnalytics);
    setOpen(false);
    setCustomizing(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  };

  return (
    <>
      {open ? (
        <div className="consent-backdrop" role="presentation">
          <section className="consent-panel" role="dialog" aria-modal="true" aria-labelledby="consent-title">
            <h2 id="consent-title">{text.title}</h2>
            <p>{text.intro} {text.ip} <Link href="/legal/privacy">{text.privacy}</Link></p>
            {customizing ? (
              <label className="consent-toggle">
                <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
                <span><strong>{text.analytics}</strong><small>{text.analyticsHint}</small></span>
              </label>
            ) : null}
            <div className="consent-actions">
              {customizing ? (
                <button type="button" className="btn btn-primary" onClick={() => save(analytics)}>{text.save}</button>
              ) : null}
              <button type="button" className="btn btn-ghost" onClick={() => save(false)}>{text.essential}</button>
              {!customizing ? <button type="button" className="btn btn-ghost" onClick={() => setCustomizing(true)}>{text.customize}</button> : null}
              {!customizing ? <button type="button" className="btn btn-primary" onClick={() => save(true)}>{text.accept}</button> : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
