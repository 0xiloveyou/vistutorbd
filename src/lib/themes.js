export const THEMES = [
  {
    id: "indigo",
    name: { en: "Indigo", bn: "ইন্ডিগো" },
    swatch: "#4f46e5",
    swatch2: "#7c3aed",
  },
  {
    id: "emerald",
    name: { en: "Emerald", bn: "এমারেল্ড" },
    swatch: "#059669",
    swatch2: "#0d9488",
  },
  {
    id: "sunset",
    name: { en: "Sunset", bn: "সানসেট" },
    swatch: "#ea580c",
    swatch2: "#db2777",
  },
  {
    id: "rose",
    name: { en: "Rose", bn: "রোজ" },
    swatch: "#e11d48",
    swatch2: "#a21caf",
  },
  {
    id: "ocean",
    name: { en: "Ocean", bn: "ওশিয়ান" },
    swatch: "#0891b2",
    swatch2: "#4f46e5",
  },
  {
    id: "violet",
    name: { en: "Violet", bn: "ভায়োলেট" },
    swatch: "#7c3aed",
    swatch2: "#db2777",
  },
  {
    id: "amber",
    name: { en: "Amber", bn: "অ্যাম্বার" },
    swatch: "#b45309",
    swatch2: "#ea580c",
  },
  {
    id: "contrast",
    name: { en: "High contrast", bn: "উচ্চ কনট্রাস্ট" },
    swatch: "#000000",
    swatch2: "#555555",
  },
];

export const DEFAULT_THEME = "indigo";

export const isThemeId = (value) => THEMES.some((theme) => theme.id === value);