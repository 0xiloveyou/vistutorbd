"use client";

import { useGetMe, useLogout } from "@/hooks";
import { THEMES } from "@/lib/themes";
import { useLocale } from "@/providers/locale.provider";
import { useTheme } from "@/providers/theme.provider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ClassPicker from "./ClassPicker";

export default function SiteHeader({ showClassPicker = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useGetMe();
  const logout = useLogout();
  const { locale, toggleLocale, t } = useLocale();
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const user = data?.data;
  const isEditor = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Return to the public site even if the network call failed.
    }
    router.push("/");
    router.refresh();
  };

  const navLink = (href, label) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link href={href} className={active ? "nav-link active" : "nav-link"}>
        {label}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <Link href="/" className="brand" aria-label={t("common.appName")}>
          <img className="brand-logo" src="/logo.png" alt="" />
          <span className="brand-text">
            <strong>{t("common.appName")}</strong>
            <small>{t("common.tagline")}</small>
          </span>
        </Link>

        <nav className="header-nav" aria-label="Main">
          {navLink("/", t("common.home"))}
          {navLink("/forum", t("common.forum"))}
          {navLink("/bookmarks", t("common.bookmarks"))}
          {navLink("/settings", t("common.settings"))}
          {user ? navLink("/profile", t("common.profile")) : null}
          {isEditor ? navLink("/admin", t("common.admin")) : null}
          {isEditor ? navLink("/moderator", t("common.moderator")) : null}
        </nav>

        <div className="header-actions">
          {showClassPicker ? <ClassPicker /> : null}

          <div className="header-tools">
            <select
              className="chip chip-select"
              aria-label={t("common.theme")}
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              {THEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name[locale] ?? item.name.en}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="chip"
              onClick={toggleMode}
              aria-label={mode === "dark" ? t("common.light") : t("common.dark")}
            >
              {mode === "dark" ? "☀" : "☾"}
            </button>

            <button
              type="button"
              className="chip chip-lang"
              onClick={toggleLocale}
              aria-label={t("common.language")}
              title={t("common.language")}
            >
              {locale === "en" ? "বাংলা" : "English"}
            </button>
          </div>

          {user ? (
            <>
              <Link href="/profile" className="chip chip-user">
                {user.name?.split(" ")[0] || t("common.profile")}
              </Link>
              <button type="button" className="chip" onClick={handleLogout}>
                {t("common.logout")}
              </button>
            </>
          ) : (
            <Link href="/login" className="chip chip-primary">
              {t("common.login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
