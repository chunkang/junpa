---
id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-02-07"
updated: "2026-02-07"
author: "Chun Kang"
priority: "high"
---

# SPEC-AUTH-001: Google OAuth Authentication Completion

## History

| Date       | Version | Author    | Description           |
|------------|---------|-----------|----------------------|
| 2026-02-07 | 1.0.0   | Chun Kang | Initial SPEC creation |

---

## 1. Environment

- **Platform:** Web application (Next.js 15 App Router)
- **Authentication:** Google OAuth 2.0 via next-auth v5 (Auth.js)
- **Existing Implementation:** Partial — basic OAuth flow, login page, session management
- **Parent SPEC:** SPEC-ADMIN-001 Module 1 (R1.1-R1.6)
- **Target Browsers:** Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Deployment:** Vercel or self-hosted Node.js environment

## 2. Assumptions

- Google OAuth 2.0 client credentials are properly configured in `.env.local`
- The existing NextAuth v5 configuration in `src/lib/auth.ts` is functional for basic sign-in
- Google token refresh endpoint (`https://oauth2.googleapis.com/token`) is available and stable
- Google token revocation endpoint (`https://oauth2.googleapis.com/revoke`) is available
- The existing `GoogleDriveClient` class will continue to be the primary Google Drive API interface
- Vitest will be added as the test framework (none currently configured)

## 3. Requirements

### Module 1: Token Lifecycle Management

**R-AUTH-1.1 State-Driven:** IF the access token `expiresAt` is within 5 minutes of the current time THEN the system shall use the stored `refreshToken` to obtain a new access token from Google's token endpoint and update the JWT with the new `accessToken`, `refreshToken` (if rotated), and `expiresAt`.

**R-AUTH-1.2 Event-Driven:** WHEN a token refresh request to Google's token endpoint returns an error THEN the system shall invalidate the session and redirect the user to the login page with an `error=RefreshTokenExpired` query parameter.

**R-AUTH-1.3 Unwanted:** The system shall NOT serve any Google Drive API request with an expired access token; all API calls must verify token freshness before execution.

**R-AUTH-1.4 Event-Driven:** WHEN user clicks logout THEN the system shall POST to `https://oauth2.googleapis.com/revoke?token={accessToken}` to revoke the Google OAuth token before clearing the session.

**R-AUTH-1.5 State-Driven:** IF token revocation fails during logout THEN the system shall log the failure and proceed with local session cleanup without blocking the user.

---

### Module 2: Route Protection Middleware

**R-AUTH-2.1 Ubiquitous:** The system shall always enforce authentication via Next.js middleware for all routes matching `/dashboard(.*)`, `/api/(.*)` (excluding `/api/auth/(.*)`).

**R-AUTH-2.2 State-Driven:** IF middleware detects an unauthenticated request to a protected route THEN the system shall redirect to `/login` with a `callbackUrl` parameter preserving the original destination.

**R-AUTH-2.3 State-Driven:** IF middleware detects an authenticated request to `/login` THEN the system shall redirect to `/dashboard`.

**R-AUTH-2.4 Ubiquitous:** The system shall always set secure response headers on all routes: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

### Module 3: Auth Error Handling

**R-AUTH-3.1 Event-Driven:** WHEN the NextAuth sign-in callback receives an error THEN the system shall render a dedicated error display on `/login?error={errorCode}` with a user-friendly message.

**R-AUTH-3.2 Event-Driven:** WHEN a Google Drive API call returns HTTP 401 from the GoogleDriveClient THEN the system shall trigger a session refresh attempt, and if refresh fails, redirect to `/login` with `error=SessionExpired`.

**R-AUTH-3.3 Ubiquitous:** The system shall always provide error messages for the following auth error codes: `OAuthSignin`, `OAuthCallback`, `OAuthAccountNotLinked`, `SessionRequired`, `RefreshTokenExpired`, `AccessDenied`.

---

### Module 4: Client-Side Session Monitoring

**R-AUTH-4.1 State-Driven:** IF the client-side session `expires` timestamp is within 2 minutes of the current time THEN the system shall trigger a silent session refresh via the `useSession` hook's `update()` method.

**R-AUTH-4.2 Event-Driven:** WHEN the browser tab regains focus (visibilitychange event) THEN the system shall verify session validity and trigger a refresh if the session has expired.

**R-AUTH-4.3 Unwanted:** The system shall NOT display stale session data; if session refresh fails, the UI must immediately redirect to login.

---

### Module 5: Auth Integration Tests

**R-AUTH-5.1 Ubiquitous:** The system shall always maintain test coverage of at least 85% for all auth-related modules (`auth.ts`, `middleware.ts`, auth error pages).

**R-AUTH-5.2 Event-Driven:** WHEN the test suite executes THEN it shall validate: successful Google OAuth sign-in flow, token refresh on expiry, token revocation on logout, middleware route protection, and auth error page rendering.

**R-AUTH-5.3 Ubiquitous:** The system shall always mock external Google OAuth endpoints in tests to ensure deterministic, offline-capable test execution.

---

## 4. Specifications

### 4.1 Token Refresh Flow

```
JWT Callback Execution (on every authenticated request):

1. Check: Is account object present? (first-time sign-in)
   YES → Store initial tokens → Return token
   NO  → Continue to step 2

2. Check: Is expiresAt within 5 minutes of current time?
   NO  → Return token as-is (still valid)
   YES → Continue to step 3

3. POST to https://oauth2.googleapis.com/token
   Body: {
     client_id: GOOGLE_CLIENT_ID,
     client_secret: GOOGLE_CLIENT_SECRET,
     grant_type: "refresh_token",
     refresh_token: token.refreshToken
   }

4. Check: Was refresh successful?
   YES → Update token with new accessToken, expiresAt, and refreshToken (if rotated)
   NO  → Return { ...token, error: "RefreshTokenExpired" }
```

### 4.2 Middleware Route Matrix

| Route Pattern | Auth Required | Action |
|--------------|---------------|--------|
| `/login` | No (public) | If authenticated → redirect to `/dashboard` |
| `/dashboard/**` | Yes | If unauthenticated → redirect to `/login?callbackUrl=...` |
| `/videos/**` | Yes | If unauthenticated → redirect to `/login?callbackUrl=...` |
| `/playlists/**` | Yes | If unauthenticated → redirect to `/login?callbackUrl=...` |
| `/settings/**` | Yes | If unauthenticated → redirect to `/login?callbackUrl=...` |
| `/api/auth/**` | No (NextAuth) | Pass through |
| `/api/**` | Yes | If unauthenticated → return 401 JSON |
| Static assets | No | Pass through |

### 4.3 Auth Error Code Mapping

| Error Code | User-Friendly Message |
|-----------|----------------------|
| `OAuthSignin` | Unable to start sign-in. Please try again. |
| `OAuthCallback` | Authentication failed. Please try signing in again. |
| `OAuthAccountNotLinked` | This account is already linked to another sign-in method. |
| `SessionRequired` | Please sign in to access this page. |
| `RefreshTokenExpired` | Your session has expired. Please sign in again. |
| `AccessDenied` | Access denied. You do not have permission to access this resource. |
| `Default` | An unexpected error occurred. Please try again. |

### 4.4 Files Affected

**Modified Files (5):**
| File | Change Description |
|------|-------------------|
| `src/lib/auth.ts` | Add token refresh logic to JWT callback, add signOut event handler |
| `src/lib/google-drive.ts` | Add 401 retry-once pattern in `fetch()` method |
| `src/app/(auth)/login/page.tsx` | Add error message display based on URL `error` param |
| `src/components/providers.tsx` | Configure SessionProvider with refetchInterval |
| `src/types/next-auth.d.ts` | Extend JWT type with `error` field |

**New Files (6):**
| File | Purpose |
|------|---------|
| `middleware.ts` | Next.js route protection middleware |
| `src/lib/auth-errors.ts` | Error code to user message mapping |
| `src/hooks/use-auth-session.ts` | Client-side session monitoring hook |
| `src/app/api/auth/signout/route.ts` | Server-side signout with Google token revocation |
| `vitest.config.ts` | Vitest test framework configuration |
| `src/__tests__/auth.test.ts` | Auth flow integration tests |

---

## 5. Traceability

| Requirement | Module | SPEC-ADMIN-001 Ref | Implementation Task |
|-------------|--------|-------------------|---------------------|
| R-AUTH-1.1 to R-AUTH-1.3 | Token Lifecycle | R1.4 | T1 (Token Refresh) |
| R-AUTH-1.4, R-AUTH-1.5 | Token Lifecycle | R1.6 | T2 (Revocation) |
| R-AUTH-2.1 to R-AUTH-2.4 | Route Protection | R1.1, R1.3 | T3 (Middleware) |
| R-AUTH-3.1 to R-AUTH-3.3 | Error Handling | R1.3 | T4 (Error Pages), T6 (Drive 401) |
| R-AUTH-4.1 to R-AUTH-4.3 | Client Monitoring | R1.4 | T5 (Session Hook) |
| R-AUTH-5.1 to R-AUTH-5.3 | Tests | TRUST 5 | T7 (Test Suite) |
