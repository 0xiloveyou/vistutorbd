export function localized(value, locale = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || value.bn || "";
}