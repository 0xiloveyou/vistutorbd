# Frontend route → API map

All browser requests go to `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:5000/api/v1`) with `credentials: "include"`. Server components use `src/lib/serverApi.js` and `API_INTERNAL_URL` (falling back to the public URL).

The root layout fetches `GET /taxonomy/bands` on the server and passes the result to the class provider. The header calls `GET /auth/me` through React Query (`useGetMe`), which is also the source of truth used by the guards.

## Public pages

| Route | File | Rendering | APIs |
| --- | --- | --- | --- |
| `/` | `app/page.jsx` | client | Header `GET /auth/me`; chat `POST /chat/messages`, `POST /chat/image-problem` |
| `/class/[level]` | `app/class/[level]/page.jsx` | server | `GET /taxonomy/levels/:id`, `GET /taxonomy/categories?classLevelId=`, `GET /taxonomy/chapters?categoryId=` per category |
| `/class/[level]/[category]/[chapter]` | `app/class/[level]/[category]/[chapter]/page.jsx` | server | `GET /taxonomy/levels/:id`, `GET /taxonomy/categories?classLevelId=`, `GET /taxonomy/chapters?categoryId=`, `GET /topics?chapterId=&limit=50` |
| `/topic/[slug]` | `app/topic/[slug]/page.jsx` | server + client islands | `GET /topics/:slug`; `GET /visualizations/:vizId`; `POST/DELETE /user-state/bookmarks`; `PUT /user-state/progress/:topicId`; `POST /chat/messages`, `POST /chat/image-problem` |
| `/practice/[chapter]` | `app/practice/[chapter]/page.jsx` | server + client island | `GET /taxonomy/chapters/:id`; `GET/PUT /quiz/config`; `POST /quiz/generate`; `POST /quiz/attempts` |

Notes:

- `/class/[level]` resolves categories to chapters with `Promise.all`; if the backend is down the page shows the empty state instead of crashing (`serverGet` returns `null`).
- The chapter route reads `category` and `chapter` as **slugs** and resolves them against the category/chapter lists.
- `POST /quiz/generate` is guest-accessible. Guest answers are checked locally in `src/lib/mathCheck.js`; signed-in attempts are re-checked and stored by the backend.

## Auth pages

| Route | File | APIs |
| --- | --- | --- |
| `/login` | `app/login/page.jsx` → `auth/LoginForm` | `POST /auth/login`; optional `POST /auth/google` (Google Identity Services) |
| `/register` | `app/register/page.jsx` → `auth/RegisterForm` | `POST /auth/register` |
| `/verify-account` | `app/verify-account/page.jsx` → `auth/VerifyForm` | `POST /auth/verify-email` |
| `/forgot-password` | `app/forgot-password/page.jsx` → `auth/ForgotPasswordForm` | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| `/auth/google/callback` | `app/auth/google/callback/page.jsx` | `POST /auth/google/callback` (reads `?code=`) |

The auth pages rely on the global header from the root layout; they do not render a second `SiteHeader`.

## Signed-in pages

All four pages are wrapped in `AuthGuard` (`useGetMe`, redirect to `/login` on failure).

| Route | File | APIs |
| --- | --- | --- |
| `/bookmarks` | `app/bookmarks/page.jsx` | `GET /auth/me` (guard), `GET /user-state/bookmarks`, `DELETE /user-state/bookmarks/:topicId` |
| `/profile` | `app/profile/page.jsx` | `GET /auth/me`, `GET /user-state/progress`, `GET /quiz/attempts` |
| `/settings` | `app/settings/page.jsx` | `GET /auth/me`, `PATCH /user-state/preferences` |
| `/admin` | `app/admin/page.jsx` | `GET /auth/me`, `GET /user?limit=50`, `PATCH /user/:id`, `DELETE /user/:id`, `GET /quiz/templates` |
| `/moderator` | `app/moderator/page.jsx` | `GET /auth/me`, `GET /moderation/reports?status=`, `PATCH /moderation/reports/:id` |

`/admin` requires `ADMIN`; `/moderator` accepts `ADMIN` or `MODERATOR`.

## Client state and persistence

| Concern | Storage / provider | Backend sync |
| --- | --- | --- |
| Theme palette | `localStorage["mathplay-theme"]` + `html[data-theme]` | `PATCH /user-state/preferences { preferredTheme }` |
| Light/dark | `localStorage["mathplay-mode"]` + `html[data-mode]` | not stored server-side |
| Language | `localStorage["mathplay-locale"]` + `html[lang]` | `PATCH /user-state/preferences { preferredLang }` |
| Class selection | `localStorage["mathplay-band"]`, `["mathplay-level"]` | `PATCH /user-state/preferences { classBandId, classLevelId }` |
| Companion / sound | settings form state | `PATCH /user-state/preferences` |
| Session | httpOnly cookies | `GET /auth/me` |

## Error handling

- `apiClient` (`ofetch`) throws on non-2xx. `apiErrorMessage(error, fallback)` uses `data.message`, then `data.error`, then `error.message`.
- Server components never throw on a failed fetch; they render empty states.
- `AuthGuard` redirects to `/login`; `RoleGuard` also renders `AccessDenied` for the wrong role.
- Quiz generation returns `503` when a chapter has no templates; the practice page surfaces the message.