# MathPlay — Frontend

Next.js 15 + React 19 learner client for **MathPlay**, a visualization-first math platform for Play, Nursery and Class 1–12 in English and Bangla. It talks to the Express/MongoDB backend in `../backend` at `/api/v1`.

> **Skeleton phase.** All routes, providers, shells and the player/quiz/chat UI are wired. Real chapters, topics and visualization renderers come next. See [`progress.md`](progress.md).

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
API_INTERNAL_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

- `NEXT_PUBLIC_API_BASE_URL` is used by the browser and must be reachable from the client.
- `API_INTERNAL_URL` is optional and only used by server components (`src/lib/serverApi.js`). It falls back to the public URL.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is optional. When set, the login page renders Google Sign-In; the backend must use the same client ID.

Start the backend first (`cd ../backend && npm run dev`).

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Pages

| Route | Access | Notes |
| --- | --- | --- |
| `/` | public | Animated visual-lesson carousel, class picker, features, grounded chat |
| `/search` | public | Topic search with class filter and pagination (`?q=&classLevelId=&page=`) |
| `/about` | public | Mission, what the platform offers, audience |
| `/contact` | public | Contact form → backend SMTP |
| `/faqs` | public | Expandable frequently asked questions |
| `/legal/terms` | public | Terms & Conditions |
| `/legal/privacy` | public | Privacy Policy |
| `/legal/disclaimer` | public | Disclaimer |
| `/class/[level]` | public | Categories and chapters for a class |
| `/class/[level]/[category]/[chapter]` | public | Chapter topics + practice link |
| `/topic/[slug]` | public | Lesson blocks, visualization player, bookmarks/progress, chat |
| `/practice/[chapter]` | public | Quiz config, MCQ/typed practice, results |
| `/login` | public | Email/password + optional Google |
| `/register` | public | Name/email/password → OTP |
| `/verify-account` | public | 6-digit OTP verification |
| `/forgot-password` | public | Request and apply a reset OTP |
| `/auth/google/callback` | public | Exchange Google authorization code |
| `/bookmarks` | signed in | Saved topics |
| `/profile` | signed in | Account, progress, recent attempts |
| `/settings` | public (sync needs login) | Palette, mode, language, class, companion |
| `/moderator` | `ADMIN`, `MODERATOR` | Report queue |
| `/admin` | `ADMIN` | Users, templates, editor shell |

The full route → endpoint map is in [`docs/routes.md`](docs/routes.md).

## Structure

```text
src/app/
  layout.jsx                   Global providers, header, footer, dock, KaTeX CSS
  page.jsx                     Home
  globals.css                  Design tokens, 4 palettes × 2 modes, component styles
  class/[level]/               Class page
  class/[level]/[category]/[chapter]/
  topic/[slug]/                Topic page
  practice/[chapter]/          Practice page
  search/                      Topic search + class filter + pagination
  about|contact|faqs/          Informational pages
  legal/[slug]/                Terms, privacy and disclaimer
  login|register|verify-account|forgot-password|auth/google/callback/
  bookmarks|profile|settings|admin|moderator/
src/api/                       One module per backend feature
src/hooks/                     React Query hooks (auth + platform)
src/lib/                       apiClient, serverApi, i18n, themes, mathCheck, localized
src/providers/                 Theme, locale, class, Google, React Query
src/components/                Header (search + hamburger), footer, pagination, visitor tracker,
                               picker, dock, lesson, viz host, chat, quiz, auth
src/viz/                       Player shell + placeholder renderer registry
src/routes/index.js            Route constants
```

## Data flow

1. Server components call `serverGet()` (`src/lib/serverApi.js`) with `cache: "no-store"` and render empty states if the backend is unavailable.
2. Client components use `src/api/*` through React Query hooks or mutations.
3. `apiClient` sets `credentials: "include"`, so the backend's httpOnly cookies travel with every request.
4. `useGetMe()` is the source of truth for the current user. Login, Google login and OTP verification invalidate `["user"]`.
5. `AuthGuard` redirects unauthenticated visitors to `/login`; `RoleGuard` also shows an access-denied card for the wrong role.
6. `VisitorTracker` keeps a browser visitor id in `localStorage` and posts one page view per route to `POST /analytics/visit`; it never blocks rendering.
7. `serverGetWithMeta()` is used by `/search` for pagination; `serverGet()` remains the simple data-only helper.

## Theming and language

- `ThemeProvider` writes `data-theme` and `data-mode` on `<html>`; palettes are pure CSS variables in `globals.css`.
- Palettes: `indigo`, `emerald`, `sunset`, `contrast` (high contrast). Each supports light and dark.
- `LocaleProvider` defaults to **Bangla** (`bn`), keeps `en`/`bn` in `localStorage` and exposes `t(key)`; the header has an English/Bangla switch beside the theme controls. Math stays readable in both languages through KaTeX.
- A tiny inline script in the root layout restores theme, mode and language before hydration.

## Notes

- Math rendering uses KaTeX (`MathFormula`, `RichMathText`); answers use a custom textarea + symbol keypad (`MathInput`).
- The visualization player accepts any `spec`; unknown renderers fall back to `PlaceholderRenderer`.
- Guest practice is verified locally; signed-in attempts are re-checked by the backend math engine.
- No `next.config.mjs` rewrites: browser requests go directly to `NEXT_PUBLIC_API_BASE_URL`.
