"use client";

import { getTopics } from "@/api";
import { useDebouncedValue, useGetMe, useLogout } from "@/hooks";
import { localized } from "@/lib/localized";
import { THEMES } from "@/lib/themes";
import { useLocale } from "@/providers/locale.provider";
import { useTheme } from "@/providers/theme.provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useGetMe();
  const logout = useLogout();
  const { locale, toggleLocale, t } = useLocale();
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const user = data?.data;
  const isEditor = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const debouncedSearch = useDebouncedValue(search, 350);
  const query = debouncedSearch.trim();
  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ["header-search", query],
    queryFn: () => getTopics({ q: query, limit: 5 }),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
  const suggestions = query.length >= 2 ? searchData?.topics ?? [] : [];
  const showSuggestions = searchOpen && query.length >= 2;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      // Return to the public site even if the network call failed.
    }
    router.push("/");
    router.refresh();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const value = search.trim();
    setSearchOpen(false);
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  const navLink = (href, label) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={active ? "nav-link active" : "nav-link"}
        aria-current={active ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <Link
          href="/"
          className="brand"
          aria-label={t("common.appName")}
          title={t("common.appName")}
          onClick={() => setMenuOpen(false)}
        >
          <img className="brand-logo" src="/logo.png" alt="" />
          <span className="brand-text">
            <strong>{t("common.appName")}</strong>
            <small>{t("common.tagline")}</small>
          </span>
        </Link>

        <div className="header-actions">
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
              aria-pressed={mode === "dark"}
              title={mode === "dark" ? t("common.light") : t("common.dark")}
            >
              {mode === "dark" ? "☀" : "☾"}
            </button>

            <button
              type="button"
              className="chip chip-lang"
              onClick={toggleLocale}
              aria-label={t("common.language")}
              title={t("common.language")}
              aria-pressed={locale === "bn"}
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

          <button
            type="button"
            className="nav-toggle"
            aria-label={
              menuOpen ? t("common.closeMenu") : t("common.openMenu")
            }
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <div className="header-bottom">
        <nav
          id="primary-navigation"
          className={menuOpen ? "header-nav open" : "header-nav"}
          aria-label="Main"
        >
          {navLink("/learn", t("common.learn"))}
          {navLink("/forum", t("common.forum"))}
          {navLink("/bookmarks", t("common.bookmarks"))}
          {navLink("/about", t("common.about"))}
          {navLink("/contact", t("common.contact"))}
          {navLink("/faqs", t("common.faqs"))}
          {navLink("/settings", t("common.settings"))}
          {user ? navLink("/profile", t("common.profile")) : null}
          {isEditor ? navLink("/admin", t("common.admin")) : null}
          {isEditor ? navLink("/moderator", t("common.moderator")) : null}
        </nav>

        <div className="header-search-row">
        <form
          ref={searchRef}
          className="header-search"
          action="/search"
          method="get"
          role="search"
          onSubmit={handleSearch}
        >
          <span className="header-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSearchOpen(false);
            }}
            placeholder={t("common.searchPlaceholder")}
            aria-label={t("common.searchPlaceholder")}
            aria-expanded={showSuggestions}
            aria-controls="header-search-suggestions"
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            {t("search.submit")}
          </button>

          {showSuggestions ? (
            <div
              id="header-search-suggestions"
              className="header-search-suggestions"
            >
              {searching && suggestions.length === 0 ? (
                <p className="header-search-empty">{t("common.loading")}</p>
              ) : null}

              {!searching && suggestions.length === 0 ? (
                <p className="header-search-empty">{t("search.empty")}</p>
              ) : null}

              {suggestions.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className="header-search-suggestion"
                  onClick={() => setSearchOpen(false)}
                >
                  <span>{localized(topic.title, locale)}</span>
                  <small>{topic.classLevelId}</small>
                </Link>
              ))}

              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="header-search-all"
                onClick={() => setSearchOpen(false)}
              >
                {t("search.submit")} “{query}” →
              </Link>
            </div>
          ) : null}
        </form>
        </div>
      </div>
    </header>
  );
}
