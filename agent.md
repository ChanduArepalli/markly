# 🔖 Markly — Agent Instructions

**Markly** is a modern, minimal bookmarking application. Users can save, organize, tag, and search URLs with a clean, distraction-free interface.

---

## 📂 Repository Structure

```
chan-bookmarks/
├── apps/
│   ├── web/              # Next.js Frontend (TypeScript)
│   └── api/              # FastAPI Backend (Python)
├── packages/             # Shared configs (Tailwind, ESLint, TypeScript)
├── docker/               # Environment-specific Dockerfiles
├── docker-compose.yml    # Orchestrates all services
└── AGENT.md              # Project context & agent instructions (this file)
```

---

## 🛠 Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | Next.js 14+ (App Router), TypeScript   |
| Styling     | Tailwind CSS                           |
| Backend     | FastAPI (Python 3.11+)                 |
| Database    | PostgreSQL 15 (via Docker)             |
| Auth        | Google OAuth 2.0 (OAuth2 client JSON)  |
| ORM         | SQLAlchemy + Alembic (migrations)      |
| Containers  | Docker + Docker Compose                |

---

## 🐳 Docker Services

| Service | Internal Port | External Port | Description        |
|---------|---------------|---------------|--------------------|
| `web`   | 3000          | 3000          | Next.js frontend   |
| `api`   | 8000          | 8000          | FastAPI REST API   |
| `db`    | 5432          | 5444          | PostgreSQL         |

### Common Commands

```bash
# Start all services (with rebuild)
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Enter API container
docker exec -it markly-api bash

# Run DB migrations
docker exec markly-api alembic upgrade head

# Stop all services
docker-compose down
```

---

## 🔐 Authentication

- Uses **Google OAuth 2.0** — credentials stored in `client_secret_*.json` (never committed to git).
- The `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be set as environment variables.
- Auth tokens are managed server-side via FastAPI OAuth2 flow.

---

## 🤖 Agent Instructions

### 1. Code Style & Conventions

**TypeScript / Next.js (Frontend)**
- `camelCase` for variables, hooks, and utility functions.
- `PascalCase` for React components and TypeScript interfaces/types.
- Use the **App Router** (`app/` directory) — do NOT use the `pages/` router.
- All data fetching via **React Server Components** unless client-side state is required.
- Co-locate component styles with the component (Tailwind utility classes only).
- Use `"use client"` directive only when necessary (interactivity, browser APIs).

**Python / FastAPI (Backend)**
- `snake_case` for functions, variables, and module names.
- `PascalCase` for Pydantic models and SQLAlchemy ORM classes.
- Organize routes in `routers/` with one file per resource (e.g., `routers/bookmarks.py`).
- Use **Pydantic v2** for request/response schemas.
- All DB access through SQLAlchemy sessions — no raw SQL unless necessary.
- Add type hints to all function signatures.

### 2. Dependency Management

- **Frontend:** Use `pnpm` (preferred) or `npm` inside `apps/web/`.
- **Backend:** Use `pip` with `requirements.txt` or `poetry` inside `apps/api/`.
- **Rule:** Always update `Dockerfile`, `requirements.txt`, or `package.json` when adding new dependencies.

### 3. API Design

- Base URL: `http://localhost:8000/api/v1`
- RESTful resource naming: `/bookmarks`, `/tags`, `/collections`
- Always return structured JSON — no plain text responses.
- Use proper HTTP status codes (201 for created, 204 for deleted, 422 for validation errors).
- Wrap list responses: `{ "data": [...], "total": N, "page": N, "limit": N }`

### 4. Environment Variables

- Use `.env` files for all secrets — never hardcode credentials.
- Frontend env vars must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.
- Maintain `.env.example` with all required keys (values omitted).

```
# .env.example
DATABASE_URL=postgresql://user:password@db:5432/markly
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=
```

### 5. UI/UX Design Philosophy

- **Minimal & Modern:** High whitespace, clean typography, purposeful color use.
- **Font:** Use Inter or Geist (Next.js default) from Google Fonts.
- **Color Palette:** Neutral grays as base, a single accent color (e.g., indigo or violet).
- **Dark mode:** Support both light and dark themes via Tailwind's `dark:` variant.
- **No placeholder UI:** Every component should be functional and polished.
- **Animations:** Subtle micro-interactions (Framer Motion or Tailwind transitions).

### 6. Core Features (Domain Context)

| Feature           | Description                                       |
|-------------------|---------------------------------------------------|
| Bookmark CRUD     | Save, edit, delete bookmarks with URL + metadata  |
| Auto-metadata     | Fetch page title, favicon, and OG description     |
| Tags              | Assign multiple tags; filter bookmarks by tag     |
| Collections       | Group bookmarks into named collections/folders    |
| Search            | Full-text search across title, URL, description   |
| Import/Export     | Support Netscape HTML bookmark format             |
| Google Auth       | Login with Google OAuth 2.0                       |

---

## ✅ Checklist for New Features

- [ ] Add/update Pydantic schema in `apps/api/schemas/`
- [ ] Add/update SQLAlchemy model in `apps/api/models/`
- [ ] Create/update Alembic migration: `alembic revision --autogenerate -m "description"`
- [ ] Add FastAPI router endpoint in `apps/api/routers/`
- [ ] Add TypeScript types in `apps/web/types/`
- [ ] Build/update React component in `apps/web/components/`
- [ ] Wire API call in `apps/web/lib/api.ts`
- [ ] Verify Docker container builds cleanly
- [ ] Ensure UI follows the Minimal/Modern design spec

---

## 🚫 Do NOT

- Commit `client_secret_*.json`, `.env`, or any files containing credentials.
- Use the Next.js `pages/` router — always use the App Router.
- Write raw SQL — use SQLAlchemy ORM or Alembic migrations.
- Return plain text from API endpoints — always use structured JSON.
- Hardcode any URLs, ports, or secrets in source code.
