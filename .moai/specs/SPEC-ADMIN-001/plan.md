---
id: SPEC-ADMIN-001
version: "1.0.0"
status: "draft"
created: "2026-02-03"
updated: "2026-02-03"
author: "Chun Kang"
priority: "high"
---

# SPEC-ADMIN-001: Implementation Plan

## 1. Overview

| Field       | Value                                           |
|-------------|-------------------------------------------------|
| SPEC ID     | SPEC-ADMIN-001                                  |
| Feature     | Admin Web Content Management Interface for Junpa |
| Status      | Draft                                           |
| Priority    | High                                            |
| Author      | Chun Kang                                       |
| Created     | 2026-02-03                                      |

This plan defines the implementation strategy for the Junpa admin interface, a web-based content management system for managing video libraries, playlists, series, and featured content backed by Google Drive storage.

---

## 2. Technology Stack

| Category           | Technology              | Version   | Purpose                                      |
|--------------------|-------------------------|-----------|----------------------------------------------|
| Framework          | Next.js                 | 15.1.x    | App Router, Server Actions, SSR/ISR          |
| UI Library         | React                   | 19.0.x    | Server Components, Actions, use hook         |
| Language           | TypeScript              | 5.7.x     | Type safety, interfaces, strict mode         |
| Styling            | Tailwind CSS            | 4.0.x     | Utility-first CSS, responsive design         |
| Component Library  | shadcn/ui               | latest    | Accessible, customizable UI components       |
| Data Fetching      | TanStack Query          | 5.x       | Server state management, caching, mutations  |
| Client State       | Zustand                 | 5.x       | Lightweight client-side state management     |
| Authentication     | next-auth (Auth.js)     | 5.x       | Google OAuth 2.0, session management         |
| Google APIs        | googleapis              | 144.x     | Drive API, Photos API integration            |
| Validation         | Zod                     | 3.24.x    | Runtime schema validation, form validation   |
| Unit Testing       | Vitest                  | 2.x       | Fast unit and integration testing            |
| E2E Testing        | Playwright              | 1.49.x    | Cross-browser end-to-end testing             |
| API Mocking        | MSW (Mock Service Worker)| 2.x      | Network-level API mocking for tests          |

---

## 3. Implementation Phases

### Phase 1: Foundation (Authentication + Storage Integration)

**Primary Goal** | Modules 1 and 7 | No dependencies

| Task ID | Task Description                                    | Module | Dependencies |
|---------|-----------------------------------------------------|--------|--------------|
| T1.1    | Configure next-auth with Google OAuth 2.0 provider  | Auth   | None         |
| T1.2    | Implement OAuth flow with Google Drive API scope     | Auth   | T1.1         |
| T1.3    | Build session management with httpOnly cookies       | Auth   | T1.1         |
| T1.4    | Create login/logout UI components and auth guards    | Auth   | T1.2, T1.3   |
| T1.5    | Implement Google Drive API client with sync logic    | Storage| T1.2         |
| T1.6    | Build local queue system for offline change tracking | Storage| T1.5         |

**Deliverables:**
- Authenticated admin dashboard shell
- Google Drive read/write integration
- Session persistence with token auto-refresh
- Offline change queue with sync-on-reconnect

**Requirements Covered:** R1.1-R1.6, R7.1-R7.4

---

### Phase 2: Core Content (Video Library + Video Upload)

**Secondary Goal** | Modules 2 and 3 | Depends on Phase 1

| Task ID | Task Description                                         | Module  | Dependencies |
|---------|----------------------------------------------------------|---------|--------------|
| T2.1    | Design and implement library.json schema with Zod        | Library | T1.5         |
| T2.2    | Build responsive video grid component with thumbnails     | Library | T2.1         |
| T2.3    | Implement video metadata edit form with validation        | Library | T2.1         |
| T2.4    | Build video deletion flow with confirmation dialog        | Library | T2.1, T1.5   |
| T2.5    | Create file upload component with drag-and-drop           | Upload  | T1.5         |
| T2.6    | Implement upload progress tracking with percentage display | Upload  | T2.5         |
| T2.7    | Integrate Google Photos picker for video import           | Upload  | T1.2, T2.5   |
| T2.8    | Build post-upload metadata generation and library update   | Upload  | T2.1, T2.5   |

**Deliverables:**
- Complete video library grid with search and filtering
- Multi-source upload (local files + Google Photos)
- Real-time upload progress indication
- Metadata editing and deletion workflows
- Empty state onboarding experience

**Requirements Covered:** R2.1-R2.6, R3.1-R3.6

---

### Phase 3: Organization (Playlist Management + Series Management)

**Secondary Goal** | Modules 4 and 5 | Depends on Phase 2

| Task ID | Task Description                                          | Module   | Dependencies |
|---------|-----------------------------------------------------------|----------|--------------|
| T3.1    | Build playlist creation form with unique ID generation     | Playlist | T2.1         |
| T3.2    | Implement drag-and-drop video reordering within playlists  | Playlist | T3.1         |
| T3.3    | Add start time configuration with ISO 8601 duration picker | Playlist | T3.1         |
| T3.4    | Implement loop toggle and duration calculation             | Playlist | T3.1         |
| T3.5    | Build series creation form with episode list management    | Series   | T2.1         |
| T3.6    | Implement video-to-series assignment with order management | Series   | T3.5         |
| T3.7    | Add auto-play toggle and chronological auto-ordering       | Series   | T3.5         |

**Deliverables:**
- Full playlist CRUD with drag-and-drop ordering
- Start time and loop configuration
- Series management with episode ordering
- Auto-play and auto-ordering features

**Requirements Covered:** R4.1-R4.5, R5.1-R5.4

---

### Phase 4: Enhancement (Featured Content + Polish)

**Final Goal** | Module 6 + Cross-cutting | Depends on Phase 3

| Task ID | Task Description                                         | Module   | Dependencies     |
|---------|----------------------------------------------------------|----------|------------------|
| T4.1    | Build featured content selection interface                | Featured | T2.1, T3.1, T3.5 |
| T4.2    | Implement 10-item limit enforcement with priority ordering | Featured | T4.1             |
| T4.3    | Add featured content reordering with drag-and-drop        | Featured | T4.1             |
| T4.4    | Implement full-text search across video titles and tags   | Polish   | T2.2             |
| T4.5    | Add concurrent conflict detection and resolution UI       | Polish   | T1.5             |
| T4.6    | Performance optimization, accessibility audit, final QA   | Polish   | All              |

**Deliverables:**
- Featured content management with limit enforcement
- Full-text search functionality
- Conflict resolution interface
- Accessibility compliance and performance optimization

**Requirements Covered:** R6.1-R6.3, R2.4, R7.3

---

## 4. Module Dependencies

```
Phase 1 (Foundation)          Phase 2 (Core Content)
+-----------+                 +-----------+   +-----------+
|   Auth    |----requires---->|  Library   |   |  Upload   |
| (T1.1-T1.4)|               | (T2.1-T2.4)|  | (T2.5-T2.8)|
+-----------+                 +-----+-----+   +-----+-----+
      |                             |               |
+-----------+                       |               |
|  Storage  |<------uses------------+---------------+
| (T1.5-T1.6)|
+-----------+
                              Phase 3 (Organization)
                              +-----------+   +-----------+
                              | Playlist   |   |  Series   |
                              | (T3.1-T3.4)|  | (T3.5-T3.7)|
                              +-----+------+  +-----+-----+
                                    |               |
                              Phase 4 (Enhancement)
                              +-----------+
                              | Featured   |
                              | (T4.1-T4.3)|
                              +-----------+
                              |  Polish    |
                              | (T4.4-T4.6)|
                              +-----------+
```

**Critical Path:** T1.1 -> T1.2 -> T1.5 -> T2.1 -> T2.2 -> T3.1 -> T4.1 -> T4.6

---

## 5. Risk Assessment

| Risk                          | Likelihood | Impact | Mitigation Strategy                                                    |
|-------------------------------|------------|--------|------------------------------------------------------------------------|
| Google API rate limits         | Medium     | High   | Implement request batching, exponential backoff, and local caching     |
| Large upload failures          | Medium     | Medium | Use resumable uploads via Google Drive API; implement retry with state |
| Concurrent edit conflicts      | Low        | High   | Implement optimistic locking with version field in library.json        |
| OAuth token expiration         | Medium     | Medium | Auto-refresh tokens before expiry (R1.4); graceful re-auth prompt     |
| Google Photos API limitations  | Medium     | Medium | Fallback to manual file upload; clearly communicate API constraints    |
| Library.json corruption        | Low        | High   | Maintain backup copies on Google Drive; validate schema before write   |
| Offline data loss              | Low        | Medium | Persist local queue to IndexedDB; sync confirmation on reconnect      |

---

## 6. Quality Gates (TRUST 5 Compliance)

| Pillar      | Target                                        | Validation Method                        |
|-------------|-----------------------------------------------|------------------------------------------|
| Test-first  | 85%+ code coverage                            | Vitest coverage report                   |
| Readable    | Zero ESLint errors, consistent naming          | ESLint + Prettier CI checks              |
| Unified     | Consistent component patterns, shared utilities | Code review checklist, shadcn/ui usage   |
| Secured     | OWASP Top 10 compliance, no token leaks        | Security audit, dependency scanning      |
| Trackable   | Conventional commits, SPEC traceability         | Commit lint, requirement-to-test mapping |

**Additional Quality Targets:**
- Lighthouse Performance Score: 90+
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility: WCAG 2.1 AA compliance
- Bundle Size: Initial JS < 200KB gzipped

---

## 7. Expert Consultation Recommendations

| Domain     | Agent             | Consultation Focus                                                |
|------------|-------------------|-------------------------------------------------------------------|
| Backend    | expert-backend    | Google Drive API integration patterns, OAuth token management, server-side session architecture, resumable upload strategy |
| Frontend   | expert-frontend   | Responsive grid layout, drag-and-drop implementation, upload progress UX, optimistic UI updates |
| Security   | expert-security   | OAuth 2.0 token storage best practices, CSRF protection, Content Security Policy, OWASP compliance review |
| DevOps     | expert-devops     | Vercel deployment configuration, environment variable management, CI/CD pipeline with quality gates |

---

## 8. Architecture Design Direction

### Application Structure (Next.js App Router)

```
app/
  (auth)/
    login/page.tsx              # Google OAuth login page
  (admin)/
    layout.tsx                  # Authenticated admin layout with sidebar
    dashboard/page.tsx          # Admin dashboard overview
    library/
      page.tsx                  # Video library grid
      [id]/page.tsx             # Video detail/edit page
    upload/page.tsx             # Video upload interface
    playlists/
      page.tsx                  # Playlist list
      [id]/page.tsx             # Playlist editor
      new/page.tsx              # Create playlist
    series/
      page.tsx                  # Series list
      [id]/page.tsx             # Series editor
      new/page.tsx              # Create series
    featured/page.tsx           # Featured content manager
  api/
    auth/[...nextauth]/route.ts # Auth.js API routes
    drive/route.ts              # Google Drive sync API
    upload/route.ts             # File upload handler
lib/
  auth.ts                       # Auth configuration
  drive.ts                      # Google Drive client
  schemas.ts                    # Zod schemas for library.json
  hooks/                        # Custom React hooks
  utils/                        # Utility functions
components/
  ui/                           # shadcn/ui components
  admin/                        # Admin-specific components
  video/                        # Video-related components
  playlist/                     # Playlist-related components
  series/                       # Series-related components
```

### Key Design Decisions

1. **Server Components by default** - Use client components only for interactive elements (forms, drag-and-drop, modals)
2. **Server Actions for mutations** - All write operations through Next.js Server Actions with Zod validation
3. **TanStack Query for server state** - Cache library.json data, invalidate on mutations
4. **Zustand for UI state only** - Sidebar state, modal state, upload queue state
5. **Optimistic updates** - Update UI immediately, revert on sync failure
6. **Progressive enhancement** - Core functionality works without JavaScript where possible
