# Frontend progress

_Last updated: skeleton phase._

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
| Chat shell | ✅ | Messages, grounding badge, sources, photo upload, loading/error states |
| Auth pages | ✅ | Login (+ optional Google), register/OTP, verify, forgot/reset, Google callback |
| Bookmarks | ✅ | List + remove |
| Profile | ✅ | Account, reading progress, recent attempts |
| Settings | ✅ | Language, palette, mode, class, companion/sound; syncs when signed in |
| Admin shell | ✅ | Overview, users table (role/delete), template list, placeholder tabs |
| Moderator shell | ✅ | Report queue with status filters and actions |
| 404 | ✅ | Themed not-found page |
| Route/API docs | ✅ | `docs/routes.md` |
| Backend docs | ✅ | `../backend/docs/api/*` |

## Latest update

- Added the interactive carousel from `../backend/public/index.html` to the top of the homepage using `public/visual-lessons.html`.
- Removed the right-triangle trigonometry card from the homepage.
- Preserved autoplay, pause/replay, lesson navigation, touch swiping and display modes in the embedded section.

## Verification

```bash
npm run build   # Next.js production build succeeds (15 routes)
```

## Skeleton / placeholder behaviour

- Chapters, topics and visualizations are not seeded, so class and topic pages show intentional empty states until content is authored.
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
