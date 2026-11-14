# Frontend progress

_Last updated: 29-lesson visual carousel with robot-first explanations, eight themes, particle-motion lesson, and forum loading skeletons._

## Status

| Area | State | Notes |
| --- | --- | --- |
| App shell | ✅ | Root layout, global header, footer, floating dock, providers |
| Theme system | ✅ | 8 palettes (`indigo`, `emerald`, `sunset`, `rose`, `ocean`, `violet`, `amber`, `contrast`) × light/dark, persisted |
| i18n | ✅ | Bangla default, English switch beside theme controls, `t()` helper, persisted locale |
| Class selection | ✅ | Bands/levels from the server, persisted in localStorage |
| Home | ✅ | Hero, class picker, feature cards; grounded chat opens from the floating dock |
| Home visual lessons | ✅ | 29-slide `public/visual-lessons.html` iframe; robot-first + line art, play/pause/scrub, keyboard/swipe, mobile dots |
| Class → category → chapter | ✅ | Server-rendered lists, breadcrumbs, practice link |
| Topic | ✅ | Lesson blocks, KaTeX inline/block math, viz player shell, bookmarks/progress, chat drawer |
| Visualization player | ✅ | Stepper shell, play/pause, speed, scrub, keyboard shortcuts, EN/BN, placeholder renderer |
| Practice | ✅ | Config (time mode, answer mode, difficulty), MCQ + typed math input, timer, results, guest fallback |
| Chat shell | ✅ | Messages, grounding badge, sources, photo upload, free voice playback (OpenRouter EN + browser BN), loading/error states |
| Auth pages | ✅ | Login (+ optional Google), register/OTP, verify, forgot/reset, Google callback |
| Bookmarks | ✅ | List + remove |
| Profile | ✅ | Account, reading progress, recent attempts |
| Settings | ✅ | Language, palette, mode, class, companion/sound; syncs when signed in |
| Admin shell | ✅ | Overview, users table (role/delete), template list, placeholder tabs |
| Moderator shell | ✅ | Report queue with status filters and actions |
| 404 | ✅ | Themed not-found page |
| Search | ✅ | Header search bar + `/search` page, class filter, paginated topic results |
| Footer | ✅ | Brand, Explore/Company/Legal columns, copyright, responsive layout |
| Mobile navigation | ✅ | Hamburger menu replaces the nav below 1100px; Home link removed from nav |
| About / Contact / FAQs | ✅ | `/about`, `/contact` (posts to backend), `/faqs` accordion |
| Legal pages | ✅ | `/legal/terms`, `/legal/privacy`, `/legal/disclaimer` |
| Visitor tracking | ✅ | `VisitorTracker` posts one page view per route to `/analytics/visit` |
| Pagination | ✅ | Shared `Pagination` used by search and admin users; the forum now uses infinite scroll |
| Forum | ✅ | Top New-post toggle, infinite post feed, skeleton cards while loading, 135-sign maths toolbar, live KaTeX preview, comments with maths, Ask AI |
| Maths toolbar | ✅ | Shared `mathSymbols.js` + `MathSymbolBar`; used by forum composer, comments and AI chat |
| Route/API docs | ✅ | `docs/routes.md` |
| Backend docs | ✅ | `../backend/docs/api/*` |

## Latest update

### Visual lessons, themes and loading states

- **Home carousel:** `public/visual-lessons.html` now contains 29 animated lessons from Play to Class 12. `src/components/VisualLessons.jsx` embeds it in a height-reporting iframe on the home page.
- **Robot explanations:** 8 lessons open with `🤖 Robot explains` first and `✏️ Line art` second: triangle angles, Gauss sum, Pythagoras, `(a + b)²`, difference of squares, chain rule, particle motion, and the Fundamental Theorem. `rebuild()` puts every visual with a robot mode ahead of the rest, then sorts by rank.
- **Class 11–12 lessons:** added **Chain rule**, **Motion of a particle in a plane**, and **Fundamental Theorem: area and slope are inverses**, joining first principles, the power rule, antiderivatives and Riemann sums. The particle lesson shows a projectile path, position vector `r`, tangent velocity `v`, downward acceleration `a`, and constant `vx`.
- **Player controls:** play/pause, watch again, previous/next, speed, progress scrub, keyboard arrows, swipe navigation, mobile dots, and per-mode duration. Robot mode keeps the robot on the right with `minX` and avoids covering the graph or formula band.
- **Themes:** expanded to eight palettes (`indigo`, `emerald`, `sunset`, `rose`, `ocean`, `violet`, `amber`, `contrast`), each with light/dark; Settings shows a swatch gallery and persists the selection.
- **Forum loading:** `ForumPostSkeleton` renders three shimmer cards while the first page loads, one extra card while loading more, and the post count shows “Loading…” instead of `0`. No dummy post is left in the feed; the skeleton is removed as soon as real posts or an empty/error state is ready.

### Forum and maths input

- **Forum layout:** the composer is no longer rendered on page load. A **New post** button in the feed header opens it, the close button collapses it, and the feed fills the page below. The old forum hero block (kicker, title, subtitle and three feature chips) was removed for a cleaner page.
- **Infinite feed:** `useForumPosts` now uses `useInfiniteQuery`; the forum page flattens pages, observes a bottom sentinel with `IntersectionObserver`, and appends the next 10 posts automatically (with a manual “Load more posts” fallback).
- **Seed content:** the backend now seeds 10 starter forum posts with comments when the collection is empty (see `backend/progress.md`).
- **Maths toolbar:** `src/lib/mathSymbols.js` defines 135 signs in ten groups — calculator digits, basic calculator signs, powers/roots, fractions, algebra, geometry, calculus, trigonometry, sets/logic, and matrices/complex numbers.
- **Caret-aware insertion:** `insertMathSymbol()` wraps the selected text or the token before the caret. Typing `2` then tapping `x²` produces `$2^{2}$`; tapping `√` after `25` produces `$\sqrt{25}$`; fractions become `$\frac{25}{b}$` with the denominator selected. Templates such as matrices, integrals and sums select their first placeholder.
- **Live preview:** the composer and every comment box render a KaTeX preview as soon as the text contains `$`, so learners see the real maths sign instead of raw LaTeX.
- **AI chat toolbar:** the same toolbar sits above the companion composer, so chat questions can use calculator signs, powers, roots, fractions, integrals, matrices and Greek letters.
- **RichMathText:** now supports `\(...\)` and `\[...\]` as well as `$...$` and `$$...$$`.
- **Homepage:** removed the always-visible `<ChatPanel />` section. The companion chat now appears from the floating dock/robot button only.

### Earlier navigation work

- Removed the **Home** item from the primary navigation (the brand logo still links home) and added **About**, **Contact** and **FAQs**.
- Added a persistent search bar in the header and a `/search` page. Results support a class filter, bilingual topic titles/summaries, and pagination with `q` + `classLevelId` preserved.
- Added a full footer (`SiteFooter`) with Explore, Company and Legal columns; the old one-line footer is gone.
- Added About, Contact (posts to `POST /contact`), FAQs and three legal pages: Terms & Conditions, Privacy Policy, Disclaimer.
- Added a mobile hamburger menu (`nav-toggle`) with an accessible expanded state and automatic close on route change.
- Added `Pagination` and wired it into `/search`, `/forum` and the admin users table (forum + users now fetch 10/20 per page).
- Added `VisitorTracker`: a localStorage visitor id posts one page view per route to `POST /analytics/visit`, powering the backend’s six-hour visitor report.
- Added `serverGetWithMeta()` so server pages can render pagination envelopes.
- Added new bilingual strings for nav, search, footer, contact, FAQs and legal labels.
- Rebuilt the header into two rows: brand + account/tools on top, primary navigation + search below. This removes the clipped/overflowing nav (`ফোরাম` was rendering as only `ম`) and keeps every link visible on desktop and tablet.
- Made the brand logo and site name an explicit home link (`/`) that also closes the mobile menu.
- Added `useDebouncedValue()` and used it in two places: the header search shows bilingual topic suggestions after a 350 ms pause, and `/search` live-updates results/class filter after 450 ms without a submit.
- Centered the auth pages (`.auth-shell` uses flex `align-items: center; justify-content: center`) and centered the optional Google button inside the card; this covers login, register, forgot/reset and the Google callback.
- Tightened the mobile bar to brand + account + hamburger; the class picker and theme/language controls remain available on the home page and Settings.
- Hardened the AI chat integration: network failures now show an actionable “Could not reach the server” message instead of the raw “Failed to fetch”, the companion mutation retries once for genuine network drops, and the backend caps a full free-model fallback run at 75 s.
- Added a free `SpeakButton` (“Listen” / “শুনুন”) to every companion answer and the visualization companion card. English uses the backend’s OpenRouter free TTS route (`POST /chat/speech`, Fish Audio `:free`); Bangla uses the device’s built-in `bn-BD` voice. Closing the chat stops playback, and only one answer plays at a time.
- Added `src/lib/speech.js` (LaTeX/Markdown cleanup, browser voice, blob playback) and `src/components/SpeakButton.jsx`; added bilingual voice strings and compact `.chip-speak` styles.

## Verification

```bash
npm run build   # Next.js production build succeeds (19 routes)
```

- Chat UI: question → answer bubble → Listen → `/chat/speech` 200 → audio advances (`currentTime` > 0) and the button shows **Stop**.
- Bangla: Listen makes no network request, calls `speechSynthesis` with `bn-BD`, then resets the button after the utterance ends.
- Network failures show the friendly backend-unreachable message; the retry only applies to connection failures, never 4xx/5xx responses.
- Forum: opening `/forum` shows the feed + **New post** button (no composer); typing `2`, tapping `x²` and seeing `$2^{2}$` plus the rendered `2²` preview; scrolling the bottom sentinel appends the next page; the comment box and companion chat expose the same toolbar.
- Forum loading: the first render shows three shimmer cards and a “Loading…” count; after data arrives the skeletons are removed, and load-more adds one skeleton only while the next page is fetching.
- Visual lessons: `vc-test` registers **29 visuals / 37 modes**; a full 29-slide click-through reports 29 dots, the final slide active, and no console errors. Robot, art and 390 px mobile layouts were checked.
- `bun run build` (or `npm run build`) completes all 19 routes with the forum bundle at ~213 kB First Load JS.

## Skeleton / placeholder behaviour

- The catalog is seeded (4 users, 180 chapters, 238 topics, 1,533 visualizations), so class/topic pages have real content.
- `src/viz/renderers/PlaceholderRenderer.jsx` is the only renderer. `getRenderer()` returns it for unknown renderer ids.
- Admin taxonomy/topic/visualization/knowledge tabs are shells with the editor copy; content forms come in the content phase.
- Guest practice is checked locally with `src/lib/mathCheck.js`; signed-in attempts use the backend math engine.
- Auth pages rely on the global header from the root layout.
- The floating dock rotates between the companion card and page tools (page up/down + timer).

## Environment

`.env.local.example` documents:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
API_INTERNAL_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

`.env.local` is intentionally left with placeholder values for the operator to fill.

## Known follow-ups

1. Real chapter/topic seeding and visualization renderers.
2. Admin content forms (taxonomy, topics, specs, question templates, knowledge chunks).
3. Save the last visualization step automatically from `VizPlayer` (`PUT /user-state/progress/:topicId`).
4. Add automated component tests once content exists.
5. Consider moving `frontend/src` to the repository root if the project stops being a two-app workspace.
6. Revisit `katex` bundle splitting if the topic page First Load JS grows.
