"use client";

import { useLocale } from "@/providers/locale.provider";
import Link from "next/link";

const range = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const result = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) result.push(`gap-${item}`);
    result.push(item);
  });
  return result;
};

const buildHref = (basePath, params, page) => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export default function Pagination({
  page = 1,
  totalPages = 1,
  basePath = "",
  params = {},
  onChange,
  className = "",
}) {
  const { t } = useLocale();

  if (totalPages <= 1) return null;
  const activePage = Math.min(Math.max(1, page), totalPages);
  const isInteractive = typeof onChange === "function";

  const renderItem = (target, label, { active = false, disabled = false, ariaLabel } = {}) => {
    const classes = `pagination-button${active ? " active" : ""}${disabled ? " disabled" : ""}`;
    const key = `${target}-${label}`;

    if (disabled) {
      return (
        <span key={key} className={classes} aria-disabled="true">
          {label}
        </span>
      );
    }

    if (isInteractive) {
      return (
        <button
          key={key}
          type="button"
          className={classes}
          aria-current={active ? "page" : undefined}
          aria-label={ariaLabel}
          onClick={() => onChange(target)}
        >
          {label}
        </button>
      );
    }

    return (
      <Link
        key={key}
        href={buildHref(basePath, params, target)}
        className={classes}
        aria-current={active ? "page" : undefined}
        aria-label={ariaLabel}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav
      className={`pagination ${className}`.trim()}
      aria-label={t("common.pagination")}
    >
      {renderItem(activePage - 1, t("common.previous"), {
        disabled: activePage <= 1,
        ariaLabel: t("common.previous"),
      })}

      {range(activePage, totalPages).map((entry) =>
        typeof entry === "string" ? (
          <span key={entry} className="pagination-gap" aria-hidden="true">
            …
          </span>
        ) : (
          renderItem(entry, String(entry), { active: entry === activePage })
        ),
      )}

      {renderItem(activePage + 1, t("common.next"), {
        disabled: activePage >= totalPages,
        ariaLabel: t("common.next"),
      })}
    </nav>
  );
}
