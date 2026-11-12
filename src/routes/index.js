export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyAccount: "/verify-account",
  forgotPassword: "/forgot-password",
  googleCallback: "/auth/google/callback",
  bookmarks: "/bookmarks",
  profile: "/profile",
  settings: "/settings",
  admin: "/admin",
  moderator: "/moderator",
};

export const classRoute = (levelId) => `/class/${levelId}`;

export const chapterRoute = (levelId, categorySlug, chapterSlug) =>
  `/class/${levelId}/${categorySlug}/${chapterSlug}`;

export const topicRoute = (slug) => `/topic/${slug}`;

export const practiceRoute = (chapterId) => `/practice/${chapterId}`;