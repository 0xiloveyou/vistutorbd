# Frontend progress

_Last updated: navbar restructure, debounced search, centered auth pages, search, footer, mobile navigation, static/legal pages, visitor tracking and pagination._

## Status

| Area | State | Notes |
| --- | --- | --- |
| App shell | ✅ | Root layout, global header, footer, floating dock, providers |
| Theme system | ✅ | 4 palettes (`indigo`, `emerald`, `sunset`, `contrast`) × light/dark, persisted |
| i18n | ✅ | Bangla default, English switch beside theme controls, `t()` helper, persisted locale |
| Class selection | ✅ | Bands/levels from the server, persisted in localStorage |
| Home | ✅ | Hero, class picker, feature cards, grounded chat |
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
| Pagination | ✅ | Shared `Pagination` used by search, forum and admin users |
| Route/API docs | ✅ | `docs/routes.md` |
| Backend docs | ✅ | `../backend/docs/api/*` |

## Latest update

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
