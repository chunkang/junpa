---
id: SPEC-AUTH-001
version: "1.0.0"
status: "draft"
created: "2026-02-07"
updated: "2026-02-07"
author: "Chun Kang"
priority: "high"
---

# SPEC-AUTH-001: Acceptance Criteria

## 1. Overview

This document defines the acceptance criteria for SPEC-AUTH-001 (Google OAuth Authentication Completion). Each scenario uses Given/When/Then format and maps to specific requirements.

---

## 2. Acceptance Scenarios

### Feature 1: Token Auto-Refresh (Module 1)

**Scenario 1.1: Successful token refresh before expiry**

```
Given a user is authenticated with an access token expiring in 3 minutes
  And the JWT contains a valid refreshToken
When any server-side request triggers the JWT callback
Then the system shall POST to Google's token endpoint with grant_type=refresh_token
  And update the JWT with new accessToken and expiresAt
  And the user session shall continue without interruption
  And no redirect to login shall occur
```

Requirements: R-AUTH-1.1

**Scenario 1.2: Token refresh failure forces re-login**

```
Given a user is authenticated with an access token expiring in 2 minutes
  And the refreshToken has been revoked or is invalid
When the JWT callback attempts to refresh the token
  And Google's token endpoint returns an error response
Then the system shall set token.error to "RefreshTokenExpired"
  And redirect the user to /login?error=RefreshTokenExpired
  And clear all session data
```

Requirements: R-AUTH-1.2

**Scenario 1.3: Expired token blocked from API calls**

```
Given a user has an expired access token
  And token refresh has failed
When the GoogleDriveClient attempts any API request
Then the system shall NOT send the request with the expired token
  And shall throw a SessionExpiredError
  And shall redirect the user to /login
```

Requirements: R-AUTH-1.3

---

### Feature 2: Token Revocation on Logout (Module 1)

**Scenario 2.1: Successful token revocation on logout**

```
Given a user is authenticated with a valid session
  And the session contains a valid accessToken
When the user clicks the sign-out button
Then the system shall POST to https://oauth2.googleapis.com/revoke with the accessToken
  And clear the local session (cookies, server-side state)
  And redirect the user to /login
```

Requirements: R-AUTH-1.4

**Scenario 2.2: Graceful handling of revocation failure**

```
Given a user is authenticated with a valid session
When the user clicks the sign-out button
  And the revocation POST to Google fails (network error or 400 response)
Then the system shall log the revocation failure
  And proceed with local session cleanup
  And redirect the user to /login without error display
```

Requirements: R-AUTH-1.5

---

### Feature 3: Route Protection Middleware (Module 2)

**Scenario 3.1: Unauthenticated user blocked from dashboard**

```
Given a user is not authenticated (no valid session cookie)
When the user navigates to /dashboard/videos
Then the middleware shall redirect to /login?callbackUrl=%2Fdashboard%2Fvideos
  And the response shall include header X-Frame-Options: DENY
  And the response shall include header X-Content-Type-Options: nosniff
  And the response shall include header Referrer-Policy: strict-origin-when-cross-origin
```

Requirements: R-AUTH-2.1, R-AUTH-2.2, R-AUTH-2.4

**Scenario 3.2: Authenticated user redirected from login**

```
Given a user is authenticated with a valid session
When the user navigates to /login
Then the middleware shall redirect to /dashboard
```

Requirements: R-AUTH-2.3

**Scenario 3.3: Auth API routes remain accessible**

```
Given a user is not authenticated
When a request is made to /api/auth/callback/google
Then the middleware shall NOT block the request
  And the NextAuth handler shall process the callback normally
```

Requirements: R-AUTH-2.1

---

### Feature 4: Auth Error Handling (Module 3)

**Scenario 4.1: OAuth error displays user-friendly message**

```
Given the Google OAuth callback returns an OAuthCallback error
When the user is redirected to /login?error=OAuthCallback
Then the login page shall display "Authentication failed. Please try signing in again."
  And the Google sign-in button shall remain available for retry
  And the error message shall be styled as a warning alert
```

Requirements: R-AUTH-3.1, R-AUTH-3.3

**Scenario 4.2: Google Drive 401 triggers session refresh**

```
Given a user is authenticated but their access token has expired
When the GoogleDriveClient.fetch() receives an HTTP 401 response
Then the system shall attempt a session refresh
  And retry the original request with the new token
  And if the retry succeeds, return the response normally
  And if the retry fails, redirect to /login?error=SessionExpired
```

Requirements: R-AUTH-3.2

---

### Feature 5: Client-Side Session Monitoring (Module 4)

**Scenario 5.1: Proactive session refresh before expiry**

```
Given a user is authenticated
  And the session expires timestamp is within 2 minutes of current time
When the useAuthSession hook checks session status
Then the hook shall call useSession's update() method
  And the session shall be silently refreshed
  And no visible interruption shall occur
```

Requirements: R-AUTH-4.1

**Scenario 5.2: Tab refocus triggers session validation**

```
Given a user is authenticated
  And the browser tab has been in the background for 10 minutes
When the user refocuses the browser tab (visibilitychange event fires)
Then the useAuthSession hook shall verify session validity
  And trigger a silent refresh if the session has expired
  And redirect to /login if refresh fails
```

Requirements: R-AUTH-4.2

**Scenario 5.3: Stale session immediately redirects**

```
Given a user's session has expired
  And a silent refresh attempt fails
When the useAuthSession hook detects the failed refresh
Then the UI shall immediately redirect to /login
  And shall NOT display any stale user data or dashboard content
```

Requirements: R-AUTH-4.3

---

### Feature 6: Auth Test Coverage (Module 5)

**Scenario 6.1: Test suite validates all auth flows**

```
Given the test suite is configured with Vitest and mocked Google endpoints
When the test suite executes via `npm test`
Then it shall validate:
  - Successful Google OAuth sign-in stores tokens in JWT
  - Token refresh triggers when expiresAt is within 5 minutes
  - Token refresh failure sets error flag on JWT
  - Token revocation is called on logout
  - Middleware redirects unauthenticated requests
  - Middleware passes through auth API routes
  - Error page displays correct messages for each error code
  - Client session hook refreshes on tab refocus
And coverage shall be at least 85% for auth modules
```

Requirements: R-AUTH-5.1, R-AUTH-5.2, R-AUTH-5.3

---

## 3. Edge Cases

### Edge Case 1: Concurrent token refresh requests

```
Given multiple browser tabs are open with the same session
When token refresh is triggered simultaneously in multiple tabs
Then only one refresh request shall be sent to Google's endpoint
  And all tabs shall receive the updated token
  And no "duplicate refresh token usage" error shall occur
```

### Edge Case 2: Network failure during token refresh

```
Given a user is authenticated with a token nearing expiry
When the network is temporarily unavailable during refresh
Then the system shall retry refresh on the next request
  And shall not immediately invalidate the session
  And shall redirect to login only after confirmed refresh failure
```

### Edge Case 3: Session cookie tampering

```
Given a malicious actor modifies the session cookie
When a request is made with the tampered cookie
Then NextAuth shall detect the invalid signature
  And reject the session
  And redirect to /login
```

---

## 4. Performance Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Token refresh latency | < 500ms | Google token endpoint response time |
| Middleware execution time | < 10ms | Next.js middleware duration |
| Auth error page render | < 100ms | Time to display error message |
| Session validation (client) | < 50ms | useAuthSession hook check duration |

---

## 5. Security Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| No tokens in localStorage | Browser DevTools audit |
| httpOnly cookies for session | Response header inspection |
| HTTPS-only cookies in production | Cookie attribute verification |
| Security headers on all responses | Middleware header check |
| Token revocation on logout | Network request verification |
| No token exposure in client-side code | Source code audit |

---

## 6. Traceability Matrix

| Scenario | Requirements | Implementation Task | Module |
|----------|-------------|---------------------|--------|
| 1.1, 1.2, 1.3 | R-AUTH-1.1, R-AUTH-1.2, R-AUTH-1.3 | T1 | Token Lifecycle |
| 2.1, 2.2 | R-AUTH-1.4, R-AUTH-1.5 | T2 | Token Lifecycle |
| 3.1, 3.2, 3.3 | R-AUTH-2.1 to R-AUTH-2.4 | T3 | Route Protection |
| 4.1 | R-AUTH-3.1, R-AUTH-3.3 | T4 | Error Handling |
| 4.2 | R-AUTH-3.2 | T6 | Error Handling |
| 5.1, 5.2, 5.3 | R-AUTH-4.1 to R-AUTH-4.3 | T5 | Client Monitoring |
| 6.1 | R-AUTH-5.1 to R-AUTH-5.3 | T7 | Tests |
