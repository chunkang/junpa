---
id: SPEC-ADMIN-001
version: "1.0.0"
status: "draft"
created: "2026-02-03"
updated: "2026-02-03"
author: "Chun Kang"
priority: "high"
---

# SPEC-ADMIN-001: Acceptance Criteria

## Overview

This document defines the acceptance criteria for the Junpa Admin Web Content Management Interface using Gherkin format (Given/When/Then). Each scenario maps to requirements defined in `spec.md` and implementation tasks in `plan.md`.

---

## Feature 1: Google Account Authentication

**Requirements:** R1.1, R1.2, R1.3, R1.5, R1.6
**Tasks:** T1.1-T1.4

### Scenario 1.1: Successful Google Sign-In

```gherkin
Feature: Google Account Authentication

  Scenario: Successful sign-in with Google OAuth
    Given the user is on the login page
    And the connection is secured via HTTPS
    When the user clicks the "Sign in with Google" button
    Then the system shall redirect to Google OAuth consent screen
    And request Google Drive API scope authorization
    When the user grants authorization
    Then the system shall receive an access token and refresh token
    And store the session using httpOnly cookies (not localStorage)
    And redirect the user to the authenticated admin dashboard
```

### Scenario 1.2: Session Persistence Across Page Reloads

```gherkin
  Scenario: Session persistence across page reloads
    Given the user has successfully authenticated via Google OAuth
    And the session token is stored in an httpOnly cookie
    When the user refreshes the browser page
    Then the system shall validate the existing session
    And display the authenticated admin dashboard without re-authentication
    And the user shall retain access to all admin features
```

### Scenario 1.3: Session and Token Expiration Handling

```gherkin
  Scenario: Automatic token refresh before expiration
    Given the user is authenticated with a valid session
    And the access token expires within 5 minutes
    When the system detects the approaching expiration
    Then the system shall automatically refresh the access token using the refresh token
    And the user session shall continue without interruption

  Scenario: Logout clears all session data
    Given the user is authenticated with an active session
    When the user clicks the "Logout" button
    Then the system shall revoke the OAuth access and refresh tokens with Google
    And clear all session cookies and server-side session data
    And redirect the user to the login page
```

---

## Feature 2: Video Upload

**Requirements:** R3.1, R3.2, R3.3, R3.4, R3.5, R3.6
**Tasks:** T2.5-T2.8

### Scenario 2.1: Direct Video Upload with Progress

```gherkin
Feature: Video Upload

  Scenario: Successful direct video upload with progress indication
    Given the user is authenticated and on the upload page
    When the user selects a valid video file (mp4, webm, mov, or avi)
    Then the system shall begin uploading the file to /.junpa/videos/
    And display an upload progress bar with percentage completed
    And display the estimated time remaining
    When the upload reaches 100%
    Then the system shall generate video metadata (title, duration, file size, format)
    And create a thumbnail for the video
    And add a new entry to library.json
    And display a success confirmation to the user
```

### Scenario 2.2: Upload Validation Failure

```gherkin
  Scenario: Rejection of invalid file format
    Given the user is authenticated and on the upload page
    When the user selects a file with an unsupported format (e.g., .pdf, .doc, .png)
    Then the system shall reject the upload before transfer begins
    And display an error message: "Unsupported format. Please upload mp4, webm, mov, or avi files."
    And the upload shall not proceed

  Scenario: Rejection of oversized file
    Given the user is authenticated and on the upload page
    When the user selects a video file exceeding 10GB
    Then the system shall reject the upload before transfer begins
    And display an error message: "File exceeds the 10GB size limit."
    And the upload shall not proceed
```

### Scenario 2.3: Google Photos Import

```gherkin
  Scenario: Import video from Google Photos
    Given the user is authenticated with Google Drive API scope
    And the user is on the upload page
    When the user clicks "Import from Google Photos"
    Then the system shall open the Google Photos picker interface
    When the user selects one or more videos from Google Photos
    Then the system shall copy the selected videos to /.junpa/videos/
    And display import progress for each video
    And generate metadata for each imported video
    And update library.json with new entries for all imported videos
```

---

## Feature 3: Video Library Management

**Requirements:** R2.1, R2.2, R2.3, R2.4, R2.5, R2.6
**Tasks:** T2.1-T2.4

### Scenario 3.1: View Video Library Grid

```gherkin
Feature: Video Library Management

  Scenario: Display video library in responsive grid
    Given the user is authenticated and navigates to the video library
    When the page loads
    Then the system shall fetch all video entries from /.junpa/library.json
    And display videos in a responsive grid layout
    And each video card shall show the thumbnail, title, and duration
    And the grid shall adapt to the viewport width (mobile, tablet, desktop)

  Scenario: Empty library onboarding
    Given the user is authenticated and navigates to the video library
    And library.json contains no video entries
    When the page loads
    Then the system shall display an onboarding prompt
    And show an "Upload Your First Video" call-to-action button
```

### Scenario 3.2: Edit Video Metadata

```gherkin
  Scenario: Edit and save video metadata
    Given the user is viewing a video's detail page
    When the user modifies the title, description, or tags
    And clicks the "Save" button
    Then the system shall validate the updated metadata
    And update the corresponding entry in library.json within 3 seconds
    And sync the changes to Google Drive
    And display a success confirmation to the user
```

### Scenario 3.3: Delete Video with Confirmation

```gherkin
  Scenario: Delete a video with confirmation dialog
    Given the user is viewing the video library or a video's detail page
    When the user clicks the "Delete" button on a video
    Then the system shall display a confirmation dialog
    And ask whether to also delete the source file from storage
    When the user confirms deletion
    Then the system shall remove the video reference from library.json
    And remove the video from any playlists and series that reference it
    And optionally delete the source file from /.junpa/videos/
    And sync changes to Google Drive
    And display a success confirmation

  Scenario: Cancel video deletion
    Given the user has clicked the "Delete" button and sees the confirmation dialog
    When the user clicks "Cancel"
    Then the system shall close the dialog
    And make no changes to library.json or storage
```

---

## Feature 4: Playlist Management

**Requirements:** R4.1, R4.2, R4.3, R4.4, R4.5
**Tasks:** T3.1-T3.4

### Scenario 4.1: Create a Scheduled Playlist

```gherkin
Feature: Playlist Management

  Scenario: Create a new playlist with scheduled start times
    Given the user is authenticated and on the playlist creation page
    When the user enters a playlist title and description
    And adds videos from the library to the playlist
    And sets a start time (start_at) for one or more playlist items
    And clicks "Save"
    Then the system shall generate a unique ID for the playlist
    And store the playlist with video order and start times in ISO 8601 format
    And save the playlist to library.json
    And sync changes to Google Drive
```

### Scenario 4.2: Reorder Videos via Drag-and-Drop

```gherkin
  Scenario: Reorder videos within a playlist using drag-and-drop
    Given the user is editing an existing playlist with multiple videos
    When the user drags a video card from position 3 to position 1
    Then the system shall visually update the video order in real time
    And update the order field for all affected playlist items
    And persist the new order to library.json
    And sync changes to Google Drive
```

---

## Feature 5: Series Management

**Requirements:** R5.1, R5.2, R5.3, R5.4
**Tasks:** T3.5-T3.7

### Scenario 5.1: Create a Series with Episodes

```gherkin
Feature: Series Management

  Scenario: Create a new series and assign episodes
    Given the user is authenticated and on the series creation page
    When the user enters a series title and description
    And selects videos from the library to add as episodes
    And arranges the episode order
    And clicks "Save"
    Then the system shall generate a unique ID for the series
    And store the series with ordered episode list in library.json
    And assign sequential episode numbers to each video
    And sync changes to Google Drive
```

### Scenario 5.2: Auto-Play Configuration

```gherkin
  Scenario: Enable auto-play for a series
    Given the user is editing an existing series
    When the user toggles the "Auto-Play" switch to enabled
    And clicks "Save"
    Then the system shall set the autoPlay flag to true in the series configuration
    And persist the change to library.json
    And sync changes to Google Drive
    And display confirmation that auto-play is enabled
```

---

## Feature 6: Featured Content

**Requirements:** R6.1, R6.2, R6.3
**Tasks:** T4.1-T4.3

### Scenario 6.1: Mark Content as Featured

```gherkin
Feature: Featured Content

  Scenario: Add content to featured list
    Given the user is viewing a video, playlist, or series detail page
    And the featured list currently contains fewer than 10 items
    When the user clicks "Mark as Featured"
    Then the system shall add the content to the featured items list
    And assign a priority order number
    And persist the change to library.json
    And sync changes to Google Drive
```

### Scenario 6.2: Featured Content Limit Enforcement

```gherkin
  Scenario: Enforce maximum featured content limit
    Given the featured content list already contains 10 items
    When the user attempts to mark additional content as featured
    Then the system shall display a message: "Featured content limit reached (maximum 10 items)."
    And prevent the addition until an existing featured item is removed
    And the featured list shall not exceed 10 items under any circumstance

  Scenario: Reorder featured content
    Given the user is on the featured content management page
    And the featured list contains multiple items
    When the user drags a featured item to a new position
    Then the system shall update the priority order for all affected items
    And persist the new order to library.json
    And sync changes to Google Drive
```

---

## Feature 7: Offline Handling and Conflict Resolution

**Requirements:** R7.2, R7.3, R7.4
**Tasks:** T1.5, T1.6, T4.5

### Scenario 7.1: Temporary Disconnection with Local Queue

```gherkin
Feature: Offline Handling and Conflict Resolution

  Scenario: Continue operations during temporary disconnection
    Given the user is authenticated and performing admin tasks
    And the Google Drive API becomes temporarily unavailable
    When the user makes changes (edit metadata, create playlist, etc.)
    Then the system shall save changes to library.json locally
    And queue all pending sync operations
    And display an indicator that the system is operating in offline mode
    When the Google Drive API connection is restored
    Then the system shall process the queued changes in order
    And sync all pending changes to Google Drive
    And remove the offline mode indicator
    And display confirmation that all changes have been synced
```

### Scenario 7.2: Concurrent Modification Detection

```gherkin
  Scenario: Detect and resolve concurrent modification conflict
    Given the user is editing content in the admin interface
    And another process has modified library.json on Google Drive
    When the system attempts to sync local changes
    Then the system shall detect the version conflict
    And display a conflict resolution dialog to the user
    And present both the local version and the remote version
    And the system shall NOT overwrite the remote version automatically
    When the user selects a resolution strategy (keep local, keep remote, or merge)
    Then the system shall apply the chosen resolution
    And sync the resolved version to Google Drive
    And update the local library.json to match
```

---

## Quality Gate Criteria

### Test Coverage

| Metric                  | Target   | Validation Tool       |
|-------------------------|----------|-----------------------|
| Unit test coverage      | 85%+     | Vitest coverage       |
| Integration test coverage| 80%+    | Vitest + MSW          |
| E2E critical paths      | 100%     | Playwright            |
| Mutation test score     | 70%+     | Stryker (optional)    |

### Code Quality

| Metric                  | Target          | Validation Tool       |
|-------------------------|------------------|-----------------------|
| ESLint errors           | Zero             | ESLint CI check       |
| TypeScript strict mode  | Enabled          | tsc --noEmit          |
| Unused exports          | Zero             | ts-prune              |
| Code duplication        | < 3%             | jscpd                 |

### Security (OWASP Compliance)

| Check                              | Target              | Validation Method              |
|------------------------------------|----------------------|--------------------------------|
| No tokens in localStorage          | Enforced             | Code review + static analysis  |
| HTTPS enforcement                  | All auth endpoints   | Integration test               |
| CSRF protection                    | All mutation routes  | next-auth built-in + audit     |
| Content Security Policy            | Strict CSP headers   | Header inspection test         |
| Dependency vulnerabilities         | Zero critical/high   | npm audit + Snyk               |

### Performance

| Metric                        | Target      | Validation Tool          |
|-------------------------------|-------------|--------------------------|
| Lighthouse Performance Score  | 90+         | Lighthouse CI            |
| Largest Contentful Paint (LCP)| < 2.5s      | Core Web Vitals report   |
| First Input Delay (FID)       | < 100ms     | Core Web Vitals report   |
| Cumulative Layout Shift (CLS) | < 0.1       | Core Web Vitals report   |
| Initial JS bundle size        | < 200KB gz  | Bundle analyzer          |
| library.json sync latency     | < 5 seconds | Integration test         |

### Accessibility

| Metric                  | Target          | Validation Tool            |
|-------------------------|-----------------|----------------------------|
| WCAG compliance level   | 2.1 AA          | axe-core + manual audit    |
| Keyboard navigation     | Full support     | Manual + Playwright test   |
| Screen reader support   | ARIA labels      | axe-core + manual audit    |
| Color contrast ratio    | 4.5:1 minimum    | Lighthouse accessibility   |

---

## Definition of Done

A feature is considered complete when all of the following criteria are met:

- [ ] All Gherkin scenarios for the feature pass as automated tests
- [ ] Unit test coverage meets or exceeds 85% for the feature module
- [ ] E2E tests cover all critical user paths for the feature
- [ ] Zero ESLint errors and zero TypeScript compilation errors
- [ ] No critical or high severity security vulnerabilities in dependencies
- [ ] Lighthouse performance score of 90 or above
- [ ] Core Web Vitals metrics within target thresholds
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] Code reviewed and approved by at least one reviewer
- [ ] Changes synced to Google Drive without data loss
- [ ] library.json schema validation passes after all mutations
- [ ] Offline queue and conflict resolution tested for applicable features
