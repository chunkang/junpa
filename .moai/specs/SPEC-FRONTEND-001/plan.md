---
id: SPEC-FRONTEND-001
version: "1.0.0"
status: "draft"
created: "2026-02-24"
updated: "2026-02-24"
author: "Chun Kang"
priority: "high"
---

# SPEC-FRONTEND-001: Implementation Plan

## 1. Overview

| Field       | Value                                              |
|-------------|----------------------------------------------------|
| SPEC ID     | SPEC-FRONTEND-001                                  |
| Feature     | Frontend Web Public Viewer Interface for Junpa      |
| Status      | Draft                                              |
| Priority    | High                                               |
| Author      | Chun Kang                                          |
| Created     | 2026-02-24                                         |

This plan defines the implementation strategy for the Junpa Frontend Web, the public-facing viewer interface that allows audiences to browse content, watch on-demand videos, tune into live playlist channels, follow series with auto-play, and interact through simple reactions. The Frontend Web consumes the Streamer Service API (SPEC-STREAM-001) and does not directly access Google Drive.

---

## 2. Technology Stack

| Category           | Technology              | Version   | Purpose                                      |
|--------------------|-------------------------|-----------|----------------------------------------------|
| Framework          | Next.js                 | 15.1.x    | App Router, SSR/ISR, Server Components       |
| UI Library         | React                   | 19.0.x    | Server Components, use hook, Suspense        |
| Language           | TypeScript              | 5.7.x     | Type safety, strict mode                     |
| Styling            | Tailwind CSS            | 4.0.x     | Utility-first, responsive, dark mode         |
| Component Library  | shadcn/ui               | latest    | Accessible, customizable UI primitives       |
| Icons              | Lucide React            | 0.468.x   | Consistent icon set                          |
| Data Fetching      | TanStack Query          | 5.x       | Server state caching, polling, mutations     |
| Client State       | Zustand                 | 5.x       | Player state, session state, UI state        |
| Video Player       | HLS.js                  | 1.5.x     | HLS adaptive streaming for non-Safari        |
| Validation         | Zod                     | 3.24.x    | API response validation                      |
| URL Management     | nuqs                    | 2.x       | Type-safe URL search params                  |
| Unit Testing       | Vitest                  | 2.x       | Unit and integration testing                 |
| Component Testing  | React Testing Library   | 16.x      | Component behavior testing                   |
| E2E Testing        | Playwright              | 1.49.x    | Cross-browser and mobile E2E                 |
| API Mocking        | MSW                     | 2.x       | Network-level API mocking for tests          |

### Key Technology Decisions

**Video Player Strategy: HTML5 + HLS.js (not Video.js or Plyr)**

Rationale: The Streamer Service provides HLS streams. Safari has native HLS support. For all other browsers, HLS.js is a lightweight (60KB gzipped) library that provides HLS playback without the overhead of full player frameworks like Video.js (200KB+). Custom controls built with Radix UI primitives give full design control and accessibility. This approach keeps the bundle small and avoids opinionated player UI that conflicts with the Junpa design system.

**State Management: Zustand (not Redux or Jotai)**

Rationale: Consistent with the Admin Web (SPEC-ADMIN-001) technology choice. Zustand provides lightweight client state for player controls, session tracking, and UI preferences. Server state (videos, playlists, series) is managed entirely through TanStack Query with automatic caching and background refetching.

**No Database Required**

Rationale: The Frontend Web is a pure consumer of the Streamer Service API. Reactions are tracked via the Streamer Service. Session-level reaction deduplication uses client-side storage (sessionStorage). Authenticated viewer preferences use localStorage. No server-side database is needed for the frontend service.

---

## 3. Implementation Phases

### Phase 1: Foundation (Project Setup + Core Layout + Video Player)

**Primary Goal** | Modules 1, 2, 8 (partial) | No dependencies

| Task ID | Task Description                                          | Module    | Dependencies |
|---------|-----------------------------------------------------------|-----------|--------------|
| T1.1    | Initialize Next.js project with TypeScript, Tailwind, shadcn/ui | Core | None         |
| T1.2    | Configure ESLint, Prettier, Vitest, Playwright            | Core      | T1.1         |
| T1.3    | Create root layout with site header, footer, mobile nav   | Layout    | T1.1         |
| T1.4    | Build responsive video-card and video-grid components      | Discovery | T1.3         |
| T1.5    | Implement core video player with HLS.js integration        | Player    | T1.1         |
| T2.1    | Build custom player controls (play/pause, seek, volume, fullscreen, speed) | Player | T1.5 |
| T2.2    | Create video metadata display component (title, description, tags) | Player | T1.4 |
| T2.3    | Implement on-demand video playback page (/watch/[videoId]) | Player    | T2.1, T2.2   |
| T2.4    | Add error handling with retry for video stream failures    | Player    | T2.3         |
| T2.5    | Implement loading skeletons and Suspense boundaries        | Core      | T1.4         |

**Deliverables:**
- Next.js project skeleton with tooling configured
- Responsive layout shell with navigation
- Functional video player with HLS support and custom controls
- On-demand video playback page consuming Streamer API
- Loading states and error boundaries

**Requirements Covered:** R1.1, R2.1-R2.6, R8.1-R8.6 (foundations)

---

### Phase 2: Content Discovery + Channel Pages

**Secondary Goal** | Modules 1, 7 | Depends on Phase 1

| Task ID | Task Description                                          | Module    | Dependencies |
|---------|-----------------------------------------------------------|-----------|--------------|
| T1.5    | Build channel home page (/{username}) with featured content, live channels, recent videos | Channel | T1.4 |
| T7.1    | Implement personalized URL routing with channel layout     | Channel   | T1.5         |
| T7.2    | Build 404 page for non-existent channels                   | Channel   | T7.1         |
| T1.6    | Create video library browse page (/{username}/videos)      | Discovery | T1.4         |
| T1.7    | Implement search bar with real-time title/tag filtering    | Discovery | T1.6         |
| T1.8    | Add tag-based filtering and category grouping              | Discovery | T1.7         |
| T1.9    | Handle empty library state with friendly messaging         | Discovery | T1.6         |

**Deliverables:**
- Personalized channel pages with branding
- Full video library browsing with search and filtering
- Channel 404 handling
- Empty state messaging

**Requirements Covered:** R1.2-R1.6, R7.1-R7.3

---

### Phase 3: Live Playlist Channels + Series Playback

**Secondary Goal** | Modules 3, 4 | Depends on Phase 1

| Task ID | Task Description                                          | Module    | Dependencies |
|---------|-----------------------------------------------------------|-----------|--------------|
| T3.1    | Build live playlist player with synchronized playback     | Live      | T2.3         |
| T3.2    | Implement automatic video transition on track end         | Live      | T3.1         |
| T3.3    | Create "LIVE" badge component and coming-soon countdown   | Live      | T3.1         |
| T3.4    | Handle live playlist end state and loop continuation       | Live      | T3.2         |
| T3.5    | Build live channel card and channel listing page          | Live      | T3.3         |
| T4.1    | Create series detail page with episode list sidebar       | Series    | T2.3         |
| T4.2    | Implement episode navigation (next/previous)               | Series    | T4.1         |
| T4.3    | Build auto-play countdown overlay for series              | Series    | T4.2         |
| T4.4    | Add "resume where you left off" for series (localStorage) | Series    | T4.1         |

**Deliverables:**
- Live playlist viewer with real-time position sync
- Automatic video transitions and loop support
- Coming-soon countdown and ended states
- Series viewer with episode list and auto-play
- Series progress persistence

**Requirements Covered:** R3.1-R3.7, R4.1-R4.6

---

### Phase 4: Reactions + Shareable URLs + Polish

**Final Goal** | Modules 5, 6, 8 | Depends on Phases 2, 3

| Task ID | Task Description                                          | Module    | Dependencies |
|---------|-----------------------------------------------------------|-----------|--------------|
| T5.1    | Implement like button with optimistic update and dedup    | Reactions | T2.3         |
| T5.2    | Build view counter display component                       | Reactions | T2.3         |
| T5.3    | Add session-based like persistence (sessionStorage)        | Reactions | T5.1         |
| T6.1    | Implement shareable URL resolver page (/s/[token])        | Share     | T2.3, T3.1   |
| T6.2    | Build share button with clipboard copy functionality       | Share     | T6.1         |
| T8.1    | Implement dark mode with theme toggle (Tailwind dark)     | Theme     | T1.3         |
| T8.2    | Accessibility audit and remediation (axe-core, keyboard nav) | A11y   | All          |
| T8.3    | Performance optimization (lazy loading, code splitting, ISR) | Perf    | All          |
| T8.4    | SEO metadata with Open Graph tags for social sharing       | SEO       | T6.1         |

**Deliverables:**
- Like button with deduplication
- View count display
- Shareable URL resolution and share buttons
- Dark mode support
- WCAG 2.1 AA compliance
- Performance optimization for Core Web Vitals
- SEO-optimized pages with OG tags

**Requirements Covered:** R5.1-R5.5, R6.1-R6.4, R8.1-R8.7

---

## 4. Project Structure

```
services/frontend-web/
+-- package.json                   # Dependencies and scripts
+-- tsconfig.json                  # TypeScript configuration
+-- next.config.ts                 # Next.js configuration
+-- tailwind.config.ts             # Tailwind with dark mode
+-- postcss.config.mjs             # PostCSS configuration
+-- vitest.config.ts               # Vitest testing config
+-- playwright.config.ts           # E2E testing config
+-- .env.example                   # Environment variable template
+-- .env.local                     # Local environment (gitignored)
+-- .eslintrc.json                 # ESLint configuration
+-- .prettierrc                    # Prettier configuration
|
+-- src/
|   +-- app/
|   |   +-- layout.tsx             # Root layout (theme, fonts, providers)
|   |   +-- page.tsx               # Landing / default redirect
|   |   +-- not-found.tsx          # Global 404 page
|   |   +-- error.tsx              # Global error boundary
|   |   +-- globals.css            # Global styles, Tailwind imports
|   |   |
|   |   +-- [username]/            # Personalized channel routes
|   |   |   +-- layout.tsx         # Channel layout with branding
|   |   |   +-- page.tsx           # Channel home (featured, live, recent)
|   |   |   +-- videos/
|   |   |   |   +-- page.tsx       # Video library browse
|   |   |   +-- series/
|   |   |   |   +-- page.tsx       # Series listing
|   |   |   |   +-- [seriesId]/
|   |   |   |       +-- page.tsx   # Series detail with episodes
|   |   |   +-- live/
|   |   |       +-- [playlistId]/
|   |   |           +-- page.tsx   # Live playlist viewer
|   |   |
|   |   +-- watch/
|   |   |   +-- [videoId]/
|   |   |       +-- page.tsx       # On-demand video player
|   |   |
|   |   +-- s/
|   |       +-- [token]/
|   |           +-- page.tsx       # Shareable URL resolver
|   |
|   +-- components/
|   |   +-- ui/                    # shadcn/ui base components
|   |   +-- layout/
|   |   |   +-- site-header.tsx
|   |   |   +-- site-footer.tsx
|   |   |   +-- channel-header.tsx
|   |   |   +-- mobile-nav.tsx
|   |   +-- video/
|   |   |   +-- video-player.tsx
|   |   |   +-- video-controls.tsx
|   |   |   +-- video-card.tsx
|   |   |   +-- video-grid.tsx
|   |   |   +-- video-metadata.tsx
|   |   +-- live/
|   |   |   +-- live-badge.tsx
|   |   |   +-- live-countdown.tsx
|   |   |   +-- live-player.tsx
|   |   |   +-- channel-card.tsx
|   |   +-- series/
|   |   |   +-- series-card.tsx
|   |   |   +-- episode-list.tsx
|   |   |   +-- next-episode-overlay.tsx
|   |   +-- reactions/
|   |   |   +-- like-button.tsx
|   |   |   +-- view-counter.tsx
|   |   +-- search/
|   |   |   +-- search-bar.tsx
|   |   |   +-- search-results.tsx
|   |   |   +-- tag-filter.tsx
|   |   +-- shared/
|   |       +-- loading-skeleton.tsx
|   |       +-- error-fallback.tsx
|   |       +-- share-button.tsx
|   |       +-- theme-toggle.tsx
|   |
|   +-- lib/
|   |   +-- api/
|   |   |   +-- client.ts          # API client (fetch wrapper for Streamer)
|   |   |   +-- endpoints.ts       # Typed API endpoint functions
|   |   |   +-- types.ts           # API response type definitions
|   |   +-- hooks/
|   |   |   +-- use-video-player.ts  # Video player state hook
|   |   |   +-- use-live-playlist.ts # Live playlist polling hook
|   |   |   +-- use-series.ts        # Series navigation hook
|   |   |   +-- use-reactions.ts     # Reaction state hook
|   |   |   +-- use-search.ts        # Search and filter hook
|   |   +-- stores/
|   |   |   +-- player-store.ts    # Zustand player state
|   |   |   +-- session-store.ts   # Zustand session state
|   |   |   +-- theme-store.ts     # Zustand theme preference
|   |   +-- schemas/
|   |   |   +-- api-responses.ts   # Zod schemas for API validation
|   |   +-- utils/
|   |       +-- cn.ts              # Tailwind class merge utility
|   |       +-- format-duration.ts # Duration formatting (HH:MM:SS)
|   |       +-- format-count.ts    # Number formatting (1.2K, 3.4M)
|   |       +-- clipboard.ts       # Clipboard API wrapper
|   |
|   +-- types/
|       +-- video.ts               # Video, Playlist, Series types
|       +-- channel.ts             # Channel types
|       +-- player.ts              # Player state types
|
+-- tests/
|   +-- unit/
|   |   +-- components/
|   |   |   +-- video-player.test.tsx
|   |   |   +-- video-card.test.tsx
|   |   |   +-- like-button.test.tsx
|   |   |   +-- live-countdown.test.tsx
|   |   +-- hooks/
|   |   |   +-- use-video-player.test.ts
|   |   |   +-- use-live-playlist.test.ts
|   |   +-- lib/
|   |       +-- api-client.test.ts
|   |       +-- format-duration.test.ts
|   |
|   +-- integration/
|   |   +-- video-playback.test.tsx
|   |   +-- live-playlist.test.tsx
|   |   +-- series-playback.test.tsx
|   |   +-- search-filter.test.tsx
|   |
|   +-- e2e/
|       +-- watch-video.spec.ts
|       +-- live-channel.spec.ts
|       +-- series-autoplay.spec.ts
|       +-- share-url.spec.ts
|       +-- mobile-responsive.spec.ts
|
+-- public/
    +-- favicon.ico
    +-- og-default.png              # Default Open Graph image
```

---

## 5. Environment Configuration

```typescript
// Environment variables (.env.example)

// Streamer Service
NEXT_PUBLIC_STREAMER_API_URL=http://localhost:8000/api/v1

// Application
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_DEFAULT_CHANNEL=johnny

// Optional: Google OAuth (for authenticated reactions)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=your-nextauth-secret

// Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 6. Key Design Patterns

### 6.1 API Client Pattern

```typescript
// lib/api/client.ts
const streamerApi = {
  baseUrl: process.env.NEXT_PUBLIC_STREAMER_API_URL,

  async getVideo(videoId: string): Promise<VideoMetadata> {
    const res = await fetch(`${this.baseUrl}/stream/${videoId}`);
    if (!res.ok) throw new StreamerApiError(res);
    return VideoMetadataSchema.parse(await res.json());
  },

  async getLiveState(playlistId: string): Promise<LivePlaylistState> {
    const res = await fetch(`${this.baseUrl}/live/${playlistId}`);
    if (!res.ok) throw new StreamerApiError(res);
    return LivePlaylistStateSchema.parse(await res.json());
  },
};
```

### 6.2 Live Playlist Polling Pattern

```typescript
// lib/hooks/use-live-playlist.ts
function useLivePlaylist(playlistId: string) {
  return useQuery({
    queryKey: ['live', playlistId],
    queryFn: () => streamerApi.getLiveState(playlistId),
    refetchInterval: (query) => {
      const state = query.state.data;
      if (!state) return 5000;
      if (state.status === 'coming_soon') return 1000;  // Fast poll near start
      if (state.status === 'ended') return false;        // Stop polling
      if (state.time_until_next && state.time_until_next < 10) return 1000;
      return 5000;  // Default 5s poll
    },
  });
}
```

### 6.3 Video Player HLS Integration

```typescript
// components/video/video-player.tsx
// Server Components are not used here - this is a client component
// Strategy:
//   1. Check if native HLS is supported (Safari)
//   2. If not, load HLS.js dynamically
//   3. Attach to HTML5 video element
//   4. Handle quality level switching and error recovery
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

| Area                | Coverage Target | Focus                                    |
|---------------------|-----------------|------------------------------------------|
| Video player hook   | 100%            | State transitions, error handling        |
| Live playlist hook  | 100%            | Polling logic, state transitions         |
| API client          | 100%            | Request/response, error mapping          |
| Format utilities    | 100%            | Duration, count, edge cases              |
| Reaction logic      | 100%            | Deduplication, optimistic updates        |

### 7.2 Component Tests

| Area                | Coverage Target | Focus                                    |
|---------------------|-----------------|------------------------------------------|
| VideoPlayer         | 90%             | Render, controls, error states           |
| VideoCard           | 95%             | Display, responsive, click handling      |
| LikeButton          | 100%            | Click, dedup, active state               |
| LiveCountdown       | 100%            | Timer accuracy, state transitions        |
| EpisodeList         | 90%             | Navigation, highlighting, auto-play      |

### 7.3 Integration Tests

| Area                | Coverage Target | Focus                                    |
|---------------------|-----------------|------------------------------------------|
| Video playback flow | 90%             | Fetch metadata, load player, controls    |
| Live playlist flow  | 90%             | Join, sync, transition, loop             |
| Series auto-play    | 85%             | Episode end, countdown, next episode     |
| Search and filter   | 85%             | Query, filter, results display           |

### 7.4 E2E Tests

| Area                | Coverage Target | Focus                                    |
|---------------------|-----------------|------------------------------------------|
| Watch video         | 100%            | Navigate, play, seek, fullscreen         |
| Live channel        | 100%            | Join, live badge, countdown              |
| Series auto-play    | 100%            | Play, next episode overlay, continue     |
| Share URL           | 100%            | Copy, resolve, play                      |
| Mobile responsive   | 100%            | Layout, controls, navigation             |

### 7.5 Test Commands

```bash
# Run all unit/integration tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npx playwright test

# Run specific test file
npx vitest run tests/unit/components/video-player.test.tsx

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 8. Module Dependencies

```
Phase 1 (Foundation)               Phase 2 (Discovery)
+-----------+                      +-----------+
|  Project  |----requires--------->|  Channel  |
|  Setup    |                      |  Pages    |
| (T1.1-T1.3)|                    | (T1.5-T1.9)|
+-----------+                      |  (T7.1-T7.2)|
      |                            +-----------+
+-----------+
|  Video    |
|  Player   |                     Phase 3 (Playback)
| (T1.4-T2.5)|                   +-----------+   +-----------+
+-----+-----+                    |   Live    |   |  Series   |
      |                          |  Playlist |   | Playback  |
      +---requires----+--------->| (T3.1-T3.5)|  | (T4.1-T4.4)|
                      |          +-----------+   +-----------+
                      |
                      |          Phase 4 (Polish)
                      +--------->+-----------+   +-----------+
                                 | Reactions |   | Share +   |
                                 | (T5.1-T5.3)| | Polish    |
                                 +-----------+   | (T6.1-T8.4)|
                                                 +-----------+
```

**Critical Path:** T1.1 -> T1.3 -> T1.5 -> T2.1 -> T2.3 -> T3.1 -> T3.2 -> T8.3

---

## 9. Risk Assessment

| Risk                               | Likelihood | Impact | Mitigation Strategy                                                    |
|------------------------------------|------------|--------|------------------------------------------------------------------------|
| Streamer API not ready             | Medium     | High   | Use MSW to mock all Streamer endpoints; define API contract upfront    |
| HLS.js compatibility issues        | Low        | Medium | Fallback to direct mp4 URL for non-HLS content; test across browsers  |
| Mobile video autoplay restrictions | High       | Medium | Respect browser policies; require user gesture for play; muted autoplay for live |
| Live playlist sync drift           | Medium     | Medium | Periodic re-sync via polling; client-side time correction              |
| Large content library performance  | Low        | Medium | Virtual scrolling for lists >100 items; pagination for API requests   |
| Dark mode inconsistencies          | Low        | Low    | Use Tailwind dark: prefix consistently; design review pass             |
| Missing Streamer browse endpoints  | High       | High   | Coordinate with SPEC-STREAM-001 to add channel/browse endpoints; or implement BFF layer in Next.js API routes |
| SEO for dynamic content            | Medium     | Medium | ISR for channel pages; dynamic OG tags via generateMetadata            |

---

## 10. Quality Gates (TRUST 5 Compliance)

| Pillar      | Target                                        | Validation Method                        |
|-------------|-----------------------------------------------|------------------------------------------|
| Test-first  | 85%+ code coverage                            | Vitest coverage report                   |
| Readable    | Zero ESLint errors, consistent naming          | ESLint + Prettier CI checks              |
| Unified     | Consistent component patterns, shared utilities | shadcn/ui usage, component review        |
| Secured     | No XSS vectors, safe external URL handling     | Security audit, CSP headers              |
| Trackable   | Conventional commits, SPEC traceability         | Commit lint, requirement-to-test mapping |

**Additional Quality Targets:**

| Metric                        | Target      | Validation Tool          |
|-------------------------------|-------------|--------------------------|
| Lighthouse Performance Score  | 90+         | Lighthouse CI            |
| Largest Contentful Paint (LCP)| < 2.5s      | Core Web Vitals report   |
| First Input Delay (FID)       | < 100ms     | Core Web Vitals report   |
| Cumulative Layout Shift (CLS) | < 0.1       | Core Web Vitals report   |
| Initial JS bundle size        | < 150KB gz  | Bundle analyzer          |
| Time to Interactive           | < 3.5s      | Lighthouse               |
| WCAG compliance level         | 2.1 AA      | axe-core + manual audit  |
| Keyboard navigation           | Full support | Playwright E2E           |

---

## 11. Expert Consultation Recommendations

| Domain     | Agent             | Consultation Focus                                                |
|------------|-------------------|-------------------------------------------------------------------|
| Frontend   | expert-frontend   | HLS.js integration patterns, video player accessibility, responsive video grid, live playlist UX, series auto-play flow |
| Backend    | expert-backend    | Streamer API contract coordination, missing browse endpoints, BFF layer design if needed |
| Security   | expert-security   | Content Security Policy for video sources, shareable URL token validation, XSS prevention in user-generated content |
| DevOps     | expert-devops     | Vercel deployment with ISR, environment configuration, CDN caching strategy for static assets |
| UI/UX      | design-uiux       | Mobile-first viewer experience, video player controls UX, live channel discovery flow, dark mode design tokens |

---

## 12. Architecture Design Direction

### Key Design Decisions

1. **Server Components by default** - Content listing pages use React Server Components for fast initial render. Client Components only for interactive elements (video player, reactions, search).

2. **ISR for channel pages** - Channel home pages use Incremental Static Regeneration (revalidate every 60 seconds) for SEO and performance. Dynamic segments (live state) hydrate client-side.

3. **TanStack Query for server state** - All Streamer API data fetched and cached via TanStack Query. Live playlists use polling with adaptive intervals. Video metadata cached for 5 minutes.

4. **Zustand for client-only state** - Player state (volume, playback rate, PiP), theme preference, and session-level reaction tracking. No server persistence needed.

5. **HLS.js with native Safari fallback** - Dynamic import of HLS.js only when native HLS is not supported. Keeps Safari bundle lean.

6. **Mobile-first responsive design** - All layouts designed for mobile first, enhanced for tablet and desktop. Video player adapts to viewport with proper aspect ratio containers.

7. **Progressive enhancement** - Core video list and metadata viewable without JavaScript (SSR). Player and interactivity enhance progressively.

---

## 13. Dependencies on Other SPECs

| SPEC           | Dependency Type    | Description                                              |
|----------------|--------------------|----------------------------------------------------------|
| SPEC-STREAM-001| API Provider       | All video metadata, streaming URLs, live playlist state, shareable URL resolution |
| SPEC-ADMIN-001 | Data Provider      | Content created via Admin Web populates the library consumed through Streamer    |

### API Gap Analysis

The current Streamer Service API (SPEC-STREAM-001) may need the following additional endpoints for the Frontend Web:

| Endpoint                          | Purpose                              | Status    |
|-----------------------------------|--------------------------------------|-----------|
| GET /channel/{username}           | Channel info with featured/live/recent | Needed   |
| GET /channel/{username}/videos    | Paginated video listing for channel  | Needed    |
| GET /channel/{username}/series    | Series listing for channel           | Needed    |
| GET /series/{series_id}           | Series detail with episode list      | Needed    |
| POST /reactions/{video_id}/like   | Record a like reaction               | Needed    |
| POST /reactions/{video_id}/view   | Record a view                        | Needed    |

**Recommendation:** Coordinate with SPEC-STREAM-001 to add these browse and reaction endpoints, or implement a lightweight BFF (Backend for Frontend) layer using Next.js API routes that directly reads library.json via the existing Streamer Drive integration endpoints.
