# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Junpa is a video streaming platform that uses Google Drive as its storage backend. There is no traditional database — all metadata lives in `/.junpa/library.json` on the user's Google Drive, and videos stream directly from Drive without transcoding.

Three services live under `services/`:
- **admin-web** — Next.js 15 (App Router) content management interface for uploading/organizing videos and playlists
- **streamer** — FastAPI (Python) backend that serves video metadata, streaming URLs, and live playlist position calculations
- **frontend-web** — Public viewer interface (planned, not yet implemented)

## Development Environment

All development runs inside Docker. Use `run_dev.sh` at the repo root:

```bash
./run_dev.sh build    # Build the dev container (first time)
./run_dev.sh start    # Start container and open interactive shell
./run_dev.sh shell    # Attach to running container
./run_dev.sh stop     # Stop the container
./run_dev.sh clean    # Remove container and volumes
```

Ports: 8000 (Streamer), 3000 (Admin Web), 3001 (Frontend Web)

## Build & Test Commands

### Streamer (Python) — run from `services/streamer/`

```bash
uv sync                                         # Install dependencies
uv run pytest                                   # Run all tests
uv run pytest tests/unit/test_playlist.py       # Run a single test file
uv run pytest -k "test_position_at_start"       # Run a single test by name
uv run mypy src                                 # Type checking (strict mode)
uv run ruff check src                           # Lint
uv run ruff format src                          # Format
uv run pytest --cov=src --cov-report=term-missing  # Tests with coverage
```

### Admin Web (TypeScript) — run from `services/admin-web/`

```bash
npm install           # Install dependencies
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript type checking (tsc --noEmit)
```

## Architecture

### Data Flow

Admin Web writes video/playlist metadata to Google Drive (`/.junpa/library.json`, `/.junpa/videos/`, `/.junpa/thumbnails/`). The Streamer reads `library.json` (cached with 60s TTL) and serves API endpoints for on-demand videos and live playlists. Live playlists have a `start_at` time and loop — the Streamer calculates the current playback position so viewers join mid-stream.

### Streamer Service Layout (`services/streamer/src/junpa_streamer/`)

- `api/v1/` — Route modules: `auth.py`, `stream.py`, `live.py`, `share.py`, `health.py`, aggregated in `router.py`
- `core/` — Auth logic (`auth.py`), JWT signing (`signing.py`), custom exceptions
- `services/` — Business logic: `library.py` (metadata), `playlist.py` (position calculation), `drive.py` (Google Drive client)
- `models/` — Pydantic models for requests/responses
- `config.py` — Pydantic settings, env vars prefixed with `JUNPA_`

### Admin Web Layout (`services/admin-web/src/`)

- `app/` — Next.js App Router with `(auth)/` and `(dashboard)/` route groups, plus `api/` routes
- `components/` — Organized by domain: `layout/`, `ui/` (shadcn), `video/`, `playlist/`
- `lib/` — Auth config (NextAuth + Google OAuth), Google Drive client, Zod schemas
- `stores/` — Zustand state stores
- `hooks/` — Custom React hooks (e.g., `use-library.ts`)

## Key Conventions

- **Python**: Full strict mypy type annotations. Ruff for linting/formatting (line length 100). pytest with `asyncio_mode = "auto"`. FastAPI `Depends()` for dependency injection.
- **TypeScript**: Zod for runtime validation. Zustand for state. Tailwind + Radix UI + shadcn/ui for styling. React Query for server state.
- **Environment variables**: Python uses `JUNPA_` prefix (see `services/streamer/.env.example`). Admin Web uses standard Next.js env (see `services/admin-web/.env.example`).
- **API versioning**: All Streamer endpoints under `/api/v1`. Shareable URLs use JWT tokens at `/s/{token}`.
- **Tests**: `tests/unit/` and `tests/integration/` directories. Fixtures in `conftest.py`. Arrange/Act/Assert pattern.

## Specs

Feature specifications are in `.moai/specs/` (SPEC-STREAM-001 for Streamer, SPEC-ADMIN-001 for Admin Web). Each contains `spec.md`, `plan.md`, and `acceptance.md`.
