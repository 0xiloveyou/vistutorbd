export const THEMES = [
  {
    id: "indigo",
    name: { en: "Indigo", bn: "ইন্ডিগো" },
    swatch: "#4f46e5",
  },
  {
    id: "emerald",
    name: { en: "Emerald", bn: "এমারেল্ড" },
    swatch: "#059669",
  },
  {
    id: "sunset",
    name: { en: "Sunset", bn: "সানসেট" },
    swatch: "#ea580c",
  },
  {
    id: "contrast",
    name: { en: "High contrast", bn: "উচ্চ কনট্রাস্ট" },
    swatch: "#000000",
  },
];

export const DEFAULT_THEME = "indigo";

export const isThemeId = (value) => THEMES.some((theme) => theme.id === value);