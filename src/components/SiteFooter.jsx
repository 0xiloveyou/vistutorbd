"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

export default function SiteFooter() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const linkGroups = [
    {
      title: t("footer.explore"),
      links: [
        { href: "/learn", label: t("common.learn") },
        { href: "/search", label: t("common.search") },
        { href: "/forum", label: t("common.forum") },
        { href: "/bookmarks", label: t("common.bookmarks") },
        { href: "/faqs", label: t("common.faqs") },
        { href: "/settings", label: t("common.settings") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("common.about") },
        { href: "/contact", label: t("common.contact") },
        { href: "/presentation", label: "Presentation" },
        { href: "/pitchdeck", label: "Pitch deck" },
        { href: "/architecture", label: "Architecture" },
        { href: "/data", label: "Data" },
        { href: "/security", label: "Security" },
        { href: "/sources", label: "Sources & credits" },
        { href: "/app", label: "Open app" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/legal/terms", label: t("footer.terms") },
        { href: "/legal/privacy", label: t("footer.privacy") },
        { href: "/legal/disclaimer", label: t("footer.disclaimer") },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand" aria-label={t("common.appName")}>
            <img className="brand-logo" src="/logo.png" alt="" />
            <span className="brand-text">
              <strong>{t("common.appName")}</strong>
              <small>{t("common.tagline")}</small>
            </span>
          </Link>
          <p>{t("footer.aboutText")}</p>
        </div>

        {linkGroups.map((group) => (
          <nav key={group.title} className="footer-links" aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <span>
          © {year} {t("common.appName")} · {t("footer.rights")}
        </span>
        <span className="muted">Play → Class 12 · English + বাংলা</span>
      </div>
    </footer>
  );
}
