# VizTutorBD — Frontend

Next.js 15 + React 19 learner client for **VizTutorBD**, a visualization-first math platform for Play, Nursery and Class 1–12 in English and Bangla. It talks to the Express/MongoDB backend in `../vistutorbd-backend` at `/api/v1`.

> **Skeleton phase.** All routes, providers, shells and the player/quiz/chat UI are wired. Real chapters, topics and visualization renderers come next. See [`progress.md`](progress.md).

## Latest changes

- Next-plan activities on `/learn`: 15 new MongoDB carousels built from the merged folder 1/2/3 content — one **game**, one **visual explanation** and one **Q&A set** for each of Play & Nursery, Class 1–5, 6–8, 9–10 and 11–12.
- Every activity uses Bolt, the cute robot from the folder-1 game pattern, as the default explainer. Play & Nursery hides the style switch, so the robot is always on; other groups can switch to line art or text.
- Games: count the mangoes, fraction pizza, integer elevator, parabola hoop shots, secant-slope tracker. Visuals: shape detectives, equivalent fraction wall, Pythagoras squares, parabola family, secant→tangent. Q&A: four bilingual questions per set with picture scenes and an explanation after each answer.
- The carousels are seeded by the backend (`next-game-*`, `next-visual-*`, `next-question-*`) and embedded by `SecureCarouselFrame`; `/learn` shows the game, visual and Q&A for the selected class from the same `EXPLANATION` / `QUESTION` lists.
- Home visual lessons: a class-aware carousel served from MongoDB through `/api/v1/learn/*` and embedded by `src/components/VisualLessons.jsx`, with play/pause, scrub, speed, keyboard/swipe navigation and mobile dots.
- Class 9–10 visual lab: 14 lessons (11 robot explainers + 3 explore/line-art lessons) with a featured hero and live controls for logarithms, circle angles, elevation, similarity, series, mensuration and more.
- Robot-first lessons: every visual with a robot mode is placed before the rest, then sorted by rank. The home carousel requests the selected class and prefers its class-specific carousel over the generic one.
- New Class 11–12 visuals: **Chain rule**, **Motion of a particle in a plane**, and **Fundamental Theorem: area and slope are inverses**, alongside first principles, the power rule, antiderivatives and Riemann sums.
- Themes: eight palettes (indigo, emerald, sunset, rose, ocean, violet, amber, contrast) with light/dark modes and a swatch gallery in Settings.
- Forum: three shimmer skeleton cards while the first page loads and one while loading more; the count shows “Loading…” instead of `0`, and no dummy post remains in the feed.
- Forum: the composer is hidden behind a top **New post** button, the feed uses infinite scroll to load more posts at the bottom, and empty forums receive ten seeded starter posts from the backend.
- Maths toolbar: 135 signs in ten groups (calculator digits, calculator basics, powers/roots, fractions, algebra, geometry, calculus, trigonometry, sets/logic, matrices/complex). It is shared by the forum composer, forum comments and the AI chat.
- Insertion is caret-aware (a preceding number/variable becomes the base of a power/root/fraction) and the composer/comment box shows a live KaTeX preview.
- Homepage: removed the inline chat panel; the companion chat is opened from the floating dock button only.
- `RichMathText` also accepts `\(...\)` and `\[...\]` in addition to `$...$` and `$$...$$`.

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
| `/` | public | Class-aware visual-lesson carousel, class picker, features; companion chat opens from the floating dock |
| `/learn` | public | Class picker, explanation and question carousels for the selected class |
| `/search` | public | Topic search with class filter and pagination (`?q=&classLevelId=&page=`) |
| `/forum` | public | Top New-post button, infinite post feed, maths toolbar + live preview, comments, Ask AI |
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

## Visual lessons

- Carousel HTML lives in `../vistutorbd-backend/src/app/content/carousels/` and is seeded into MongoDB by `seed-learn-carousels.ts`; the client never serves it as a static file.
- `VisualLessons.jsx` requests explanations for the selected class, prefers a class-specific carousel over the generic `explanation-all` document, and embeds it through `SecureCarouselFrame`, which reports the iframe height back to the parent.
- The generic carousel has 29 lessons from Play to Class 12. The Class 9–10 carousel adds 14 lessons: 11 robot-led explanations with line-art modes and 3 explore/line-art lessons.
- Each lesson supports play/pause, restart, previous/next, speed, progress scrubbing, keyboard arrows and swipe; mobile uses a one-row dot navigator.
- `/learn` applies the same priority: a class-specific explanation carousel replaces the generic one when it exists.
- The next-plan cycle adds 15 documents to the same pipeline. Each class receives a game and a Q&A set in the `QUESTION` list and a visual explanation in the `EXPLANATION` list; the Play & Nursery versions carry `classLevelIds: ["play", "nursery"]`, and the other groups use their band's level ids. The documents are generated by the backend with `npm run content:next-plan` and never served as static files.
- All 15 activities share one runtime and load Bolt from `content/next-plan/runtime/robot.svg`; the generated payload is `window.__NEXT_PLAN__`. Bangla/English switching, "Show me how", hints, "I didn't understand", sound and restart work the same way in every activity.

## Structure

```text
src/app/
  layout.jsx                   Global providers, header, footer, dock, KaTeX CSS
  page.jsx                     Home
  globals.css                  Design tokens, 8 palettes × 2 modes, component styles
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
- Palettes: `indigo`, `emerald`, `sunset`, `rose`, `ocean`, `violet`, `amber`, `contrast` (high contrast). Each supports light and dark.
- `LocaleProvider` defaults to **Bangla** (`bn`), keeps `en`/`bn` in `localStorage` and exposes `t(key)`; the header has an English/Bangla switch beside the theme controls. Math stays readable in both languages through KaTeX.
- A tiny inline script in the root layout restores theme, mode and language before hydration.

## Notes

- Math rendering uses KaTeX (`MathFormula`, `RichMathText`); answers use a custom textarea + symbol keypad (`MathInput`).
- The shared maths toolbar data/caret logic lives in `src/lib/mathSymbols.js` and is rendered by `src/components/forum/MathSymbolBar.jsx`.
- The visualization player accepts any `spec`; unknown renderers fall back to `PlaceholderRenderer`.
- Guest practice is verified locally; signed-in attempts are re-checked by the backend math engine.
- No `next.config.mjs` rewrites: browser requests go directly to `NEXT_PUBLIC_API_BASE_URL`.
