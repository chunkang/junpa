---
id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-02-07"
updated: "2026-02-07"
author: "Chun Kang"
priority: "high"
---

# SPEC-AUTH-001: Implementation Plan

## 1. Overview

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-AUTH-001 |
| Feature | Google OAuth Authentication Completion |
| Status | Draft |
| Priority | High |
| Author | Chun Kang |
| Created | 2026-02-07 |
| Parent SPEC | SPEC-ADMIN-001 (Module 1: Authentication) |

This plan defines the implementation strategy for completing and hardening the Google OAuth authentication layer in the Junpa Admin Web service. It addresses 7 specific gaps between the SPEC-ADMIN-001 requirements (R1.1-R1.6) and the current partial implementation.

---

## 2. Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | ^15.1.0 | App Router, Middleware, Server Actions |
| Auth Library | next-auth (Auth.js) | ^5.0.0-beta.25 | Google OAuth 2.0, JWT, session management |
| Auth Core | @auth/core | ^0.37.0 | Peer dependency of next-auth v5 |
| Language | TypeScript | ^5.7.0 | Type safety, strict mode |
| Test Framework | Vitest | ^2.0.0 | Unit and integration testing (to be added) |
| Test Utilities | @testing-library/react | ^16.0.0 | Component testing (to be added) |
| Google Token Endpoint | OAuth 2.0 | Standard | `https://oauth2.googleapis.com/token` |
| Google Revocation Endpoint | OAuth 2.0 | Standard | `https://oauth2.googleapis.com/revoke` |

**No new environment variables required** — all needed values already exist in `.env.example`.

---

## 3. Implementation Phases

### Phase 1: Token Lifecycle & Route Protection (Foundation)

**Primary Goal** | Modules 1 and 2 | No dependencies

| Task ID | Task Description | Module | Dependencies | Est. Complexity |
|---------|-----------------|--------|--------------|-----------------|
| T1 | Implement token auto-refresh in JWT callback | Token Lifecycle | None | High |
| T2 | Add Google token revocation on logout | Token Lifecycle | T1 | Medium |
| T3 | Create Next.js middleware for route protection | Route Protection | None | Medium |

**T1 Details — Token Auto-Refresh:**
- Modify `src/lib/auth.ts` JWT callback
- Add time check: if `expiresAt` is within 5 minutes, trigger refresh
- POST to `https://oauth2.googleapis.com/token` with `grant_type=refresh_token`
- Handle refresh token rotation (Google may return new refresh token)
- On failure: set `token.error = "RefreshTokenExpired"` to signal re-login
- Update `src/types/next-auth.d.ts` to include `error?: string` on JWT

**T2 Details — Token Revocation:**
- Create `src/app/api/auth/signout/route.ts` (server-side signout handler)
- POST to `https://oauth2.googleapis.com/revoke?token={accessToken}`
- Handle revocation failure gracefully (log, proceed with session cleanup)
- Update header signout button to call this API route before `signOut()`

**T3 Details — Middleware:**
- Create `services/admin-web/middleware.ts`
- Matcher config: `["/dashboard/:path*", "/videos/:path*", "/playlists/:path*", "/settings/:path*", "/api/((?!auth).*)"]`
- Unauthenticated → redirect to `/login?callbackUrl=...`
- Authenticated on `/login` → redirect to `/dashboard`
- Add security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

**Deliverables:**
- Automatic token refresh before expiry
- Google token revocation on logout
- Middleware-based route protection with security headers
- Requirements Covered: R-AUTH-1.1 to R-AUTH-1.5, R-AUTH-2.1 to R-AUTH-2.4

---

### Phase 2: Error Handling & Client Monitoring (Enhancement)

**Secondary Goal** | Modules 3 and 4 | Depends on Phase 1

| Task ID | Task Description | Module | Dependencies | Est. Complexity |
|---------|-----------------|--------|--------------|-----------------|
| T4 | Add auth error pages with user-friendly messages | Error Handling | T1, T2 | Low |
| T5 | Create client-side session monitoring hook | Client Monitoring | T1 | Medium |
| T6 | Add 401 retry logic to GoogleDriveClient | Error Handling | T1 | Medium |

**T4 Details — Error Pages:**
- Create `src/lib/auth-errors.ts` with error code → message mapping
- Update `src/app/(auth)/login/page.tsx` to read `searchParams.error`
- Display styled error message above sign-in button
- Support error codes: `OAuthSignin`, `OAuthCallback`, `OAuthAccountNotLinked`, `SessionRequired`, `RefreshTokenExpired`, `AccessDenied`

**T5 Details — Client Session Monitor:**
- Create `src/hooks/use-auth-session.ts`
- Wrap `useSession()` with visibility change listener
- On tab refocus: call `update()` to trigger session refresh
- Configure `SessionProvider` with `refetchInterval` (4 minutes)
- On session expiry with failed refresh: redirect to `/login`

**T6 Details — Drive Client 401 Retry:**
- Modify `src/lib/google-drive.ts` `fetch()` method
- On HTTP 401: attempt session refresh (call `/api/auth/session`)
- Retry the original request once with new token
- On second 401: throw `SessionExpiredError`

**Deliverables:**
- User-friendly auth error messages
- Automatic client-side session refresh
- GoogleDriveClient resilience to token expiry
- Requirements Covered: R-AUTH-3.1 to R-AUTH-3.3, R-AUTH-4.1 to R-AUTH-4.3

---

### Phase 3: Test Coverage (Validation)

**Final Goal** | Module 5 | Depends on Phases 1-2

| Task ID | Task Description | Module | Dependencies | Est. Complexity |
|---------|-----------------|--------|--------------|-----------------|
| T7 | Set up Vitest and write auth integration tests | Tests | T1-T6 | High |

**T7 Details — Test Suite:**
- Create `vitest.config.ts` with Next.js + React support
- Add Vitest and @testing-library/react to devDependencies
- Create test files:
  - `src/__tests__/auth.test.ts` — JWT callback, token refresh, revocation
  - `src/__tests__/middleware.test.ts` — Route protection, redirects, headers
  - `src/__tests__/auth-errors.test.ts` — Error code mapping
  - `src/__tests__/use-auth-session.test.ts` — Client hook behavior
- Mock Google OAuth endpoints with `vi.fn()` / `vi.mock()`
- Target: 85%+ coverage on auth modules

**Deliverables:**
- Vitest configuration
- Comprehensive auth test suite
- 85%+ coverage on auth modules
- Requirements Covered: R-AUTH-5.1 to R-AUTH-5.3

---

## 4. Task Dependency Graph

```
Phase 1 (Foundation):
T1 (Token Refresh) ─────┬──→ T2 (Revocation)
                         │
T3 (Middleware) ─────────┤   [T1 and T3 can run in parallel]
                         │
Phase 2 (Enhancement):   │
                         ├──→ T4 (Error Pages)    [depends on T1, T2]
                         ├──→ T5 (Client Monitor)  [depends on T1]
                         └──→ T6 (Drive 401 Retry) [depends on T1]

Phase 3 (Validation):
T7 (Tests) ──────────────────→ [depends on T1-T6]
```

**Critical Path:** T1 → T2 → T4 → T7

**Parallel Opportunities:**
- T1 and T3 can be developed simultaneously
- T4, T5, T6 can be developed simultaneously (all depend only on T1)

---

## 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| next-auth v5 beta instability | Medium | High | Pin exact version; test thoroughly; monitor Auth.js changelog |
| Google refresh token rotation | Low | High | Always persist new refresh token if returned; handle gracefully |
| Middleware performance overhead | Low | Medium | Use specific `matcher`; keep logic minimal |
| Token revocation network failure | Medium | Low | Fire-and-forget with logging; don't block logout |
| Race conditions in client refresh | Medium | Medium | Use lock pattern in useAuthSession hook |
| Google OAuth rate limiting | Low | Medium | Exponential backoff for refresh requests |

---

## 6. Quality Gates (TRUST 5 Compliance)

| Pillar | Target | Validation Method |
|--------|--------|-------------------|
| Test-first | 85%+ auth module coverage | Vitest coverage report |
| Readable | Zero ESLint errors | ESLint CI checks |
| Unified | Consistent auth patterns | Code review checklist |
| Secured | OWASP compliance, no token leaks | Security header validation, token storage audit |
| Trackable | Conventional commits, SPEC traceability | Commit lint, requirement mapping |

---

## 7. Expert Consultation Recommendations

| Domain | Agent | Focus |
|--------|-------|-------|
| Security | expert-security | Token refresh flow, middleware headers, OWASP compliance |
| Frontend | expert-frontend | useAuthSession hook design, SessionProvider integration |
