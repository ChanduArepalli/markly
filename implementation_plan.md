# 🔖 Markly — Implementation Plan

Markly is a modern, minimal bookmarking application. This plan covers the full monorepo build: Python/FastAPI backend, Next.js 14 frontend, PostgreSQL database, Google OAuth 2.0, and Docker Compose orchestration.

---

## Open Questions

> [!IMPORTANT]
> **Please review these before I start building:**

1. **Google OAuth redirect URI** — Should I configure the redirect URI as `http://localhost:8000/auth/google/callback` (backend handles the token exchange)? Or do you want a frontend-only flow (NextAuth.js)?
2. **Auth strategy** — Simple JWT stored in `httpOnly` cookies (server-side), or do you prefer NextAuth.js on the frontend side?
3. **Auto-metadata fetching** — When saving a bookmark, should the backend automatically scrape Open Graph / page title / favicon in the background (async), or immediately on save?
4. **pnpm or npm** — Agent.md says pnpm preferred. Should I scaffold with `pnpm`?

> [!NOTE]
> I'll use sensible defaults (JWT cookies, backend OAuth flow, async metadata scraping, pnpm) and proceed unless you specify otherwise.

---

## Proposed Changes

### Phase 1 — Monorepo Scaffold & Docker

#### [NEW] `docker-compose.yml`
- Defines 3 services: `db` (Postgres 15), `api` (FastAPI), `web` (Next.js)
- Shared network `markly-net`
- Volume for Postgres data persistence
- Hot-reload mounts for both `api` and `web`

#### [NEW] `.env.example`
- Template for all environment variables

#### [NEW] `.gitignore`
- Ignores `client_secret_*.json`, `.env`, `__pycache__`, `.next`, `node_modules`

---

### Phase 2 — FastAPI Backend (`apps/api/`)

```
apps/api/
├── main.py                  # App entry, CORS, router registration
├── database.py              # SQLAlchemy engine + session
├── config.py                # Settings via pydantic-settings
├── models/
│   ├── user.py              # User ORM model
│   ├── bookmark.py          # Bookmark ORM model
│   ├── tag.py               # Tag ORM model
│   └── collection.py        # Collection ORM model
├── schemas/
│   ├── user.py              # Pydantic v2 user schemas
│   ├── bookmark.py          # Pydantic v2 bookmark schemas
│   ├── tag.py               # Tag schemas
│   └── collection.py        # Collection schemas
├── routers/
│   ├── auth.py              # Google OAuth flow + JWT issuance
│   ├── bookmarks.py         # CRUD + search endpoints
│   ├── tags.py              # Tag management
│   └── collections.py       # Collection management
├── services/
│   ├── metadata.py          # Async URL scraping (httpx + BeautifulSoup)
│   └── oauth.py             # Google OAuth token exchange
├── migrations/              # Alembic migrations
│   └── alembic.ini
├── requirements.txt
└── Dockerfile
```

**Key API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/google` | Redirect to Google OAuth |
| GET | `/api/v1/auth/google/callback` | Exchange code for JWT |
| GET | `/api/v1/auth/me` | Current user info |
| GET | `/api/v1/bookmarks` | List (paginated, filterable) |
| POST | `/api/v1/bookmarks` | Create bookmark |
| GET | `/api/v1/bookmarks/{id}` | Get single bookmark |
| PUT | `/api/v1/bookmarks/{id}` | Update bookmark |
| DELETE | `/api/v1/bookmarks/{id}` | Delete bookmark |
| GET | `/api/v1/bookmarks/search` | Full-text search |
| GET | `/api/v1/tags` | List all tags |
| POST | `/api/v1/tags` | Create tag |
| GET | `/api/v1/collections` | List collections |
| POST | `/api/v1/collections` | Create collection |
| POST | `/api/v1/bookmarks/import` | Import Netscape HTML |
| GET | `/api/v1/bookmarks/export` | Export Netscape HTML |

**Python Dependencies:**
```
fastapi, uvicorn, sqlalchemy, alembic, psycopg2-binary,
pydantic-settings, python-jose[cryptography], httpx,
beautifulsoup4, python-multipart, google-auth, google-auth-oauthlib
```

---

### Phase 3 — Next.js Frontend (`apps/web/`)

```
apps/web/
├── app/
│   ├── layout.tsx           # Root layout (font, theme provider)
│   ├── page.tsx             # Landing / login page
│   ├── (auth)/
│   │   └── callback/page.tsx  # OAuth callback handler
│   └── dashboard/
│       ├── layout.tsx       # Dashboard shell (sidebar + header)
│       ├── page.tsx         # All bookmarks view
│       ├── collections/
│       │   └── [id]/page.tsx
│       └── tags/
│           └── [tag]/page.tsx
├── components/
│   ├── BookmarkCard.tsx     # Card with favicon, title, tags
│   ├── BookmarkGrid.tsx     # Masonry/grid layout
│   ├── AddBookmarkModal.tsx # Add/edit form modal
│   ├── SearchBar.tsx        # Debounced search input
│   ├── Sidebar.tsx          # Collections + tags navigation
│   ├── TagBadge.tsx         # Pill-style tag badge
│   └── ThemeToggle.tsx      # Light/dark mode switcher
├── lib/
│   ├── api.ts               # Typed API client (fetch wrapper)
│   └── auth.ts              # Auth utilities (cookie read, redirect)
├── types/
│   └── index.ts             # All shared TypeScript interfaces
├── hooks/
│   ├── useBookmarks.ts      # SWR hook for bookmark data
│   └── useAuth.ts           # Auth state hook
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── Dockerfile
```

**Design Direction:**
- **Aesthetic**: Editorial/refined minimalism — think Raindrop.io meets Linear
- **Font**: `Fraunces` (display headings) + `DM Sans` (body) — distinctive, not generic
- **Color**: Near-black `#0a0a0a` background (dark mode default), `#f5f0eb` warm off-white (light), accent `#6366f1` indigo with `#a5b4fc` highlights
- **Layout**: Two-column — fixed sidebar (240px) + scrollable main content grid
- **Cards**: Glassmorphism bookmark cards with favicon + domain chip + tag pills
- **Animations**: Staggered card entrance, smooth modal transitions

---

### Phase 4 — Docker Infrastructure

#### [NEW] `docker/api.Dockerfile`
- Python 3.11 slim base
- Installs requirements, runs `uvicorn` with `--reload` in dev

#### [NEW] `docker/web.Dockerfile`
- Node 20 Alpine base
- `pnpm install` + `next dev` in dev mode

#### [NEW] `docker-compose.yml`
```yaml
services:
  db:     postgres:15-alpine  → port 5444:5432
  api:    ./docker/api.Dockerfile → port 8000:8000
  web:    ./docker/web.Dockerfile → port 3000:3000
```

---

## Verification Plan

### Automated
- `docker-compose up --build` — all 3 services start healthy
- `GET http://localhost:8000/health` → `{ "status": "ok" }`
- `GET http://localhost:8000/docs` → Swagger UI loads
- `GET http://localhost:3000` → Landing page renders

### Browser Testing
- Verify landing page renders with correct fonts and dark theme
- Verify Google OAuth redirect works
- Verify bookmark can be added, tagged, and deleted
- Verify search returns results

### Manual
- Confirm `.env` is gitignored
- Confirm `client_secret_*.json` is gitignored

---

## Build Order

1. `[ ]` Monorepo root scaffold (`.gitignore`, `.env.example`, `docker-compose.yml`)
2. `[ ]` FastAPI app skeleton + database + config
3. `[ ]` SQLAlchemy models + Alembic setup
4. `[ ]` Auth router (Google OAuth + JWT)
5. `[ ]` Bookmarks router (CRUD + search)
6. `[ ]` Tags + Collections routers
7. `[ ]` Metadata scraping service
8. `[ ]` API Dockerfile
9. `[ ]` Next.js app scaffold (layout, design system, fonts)
10. `[ ]` Landing page
11. `[ ]` Dashboard shell (sidebar + header)
12. `[ ]` BookmarkCard + BookmarkGrid components
13. `[ ]` AddBookmarkModal
14. `[ ]` SearchBar + tag filtering
15. `[ ]` Web Dockerfile
16. `[ ]` Full docker-compose wiring + health checks
17. `[ ]` End-to-end verification
