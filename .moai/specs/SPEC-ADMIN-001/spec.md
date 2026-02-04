---
id: SPEC-ADMIN-001
version: "1.1.0"
status: "completed"
created: "2026-02-03"
updated: "2026-02-03"
author: "Chun Kang"
priority: "high"
---

# SPEC-ADMIN-001: Admin Web Content Management Interface for Junpa

## History

| Date       | Version | Author    | Description            |
|------------|---------|-----------|------------------------|
| 2026-02-03 | 1.0.0   | Chun Kang | Initial SPEC creation  |
| 2026-02-03 | 1.1.0   | Chun Kang | Implementation completed - all 4 phases, 210 tests |

---

## 1. Environment

- **Platform:** Web application (Next.js App Router)
- **Authentication:** Google OAuth 2.0 with Google Drive API scope
- **Storage Backend:** Google Drive API for persistent storage
- **Local Structure:** `/.junpa/` directory containing `library.json`, `videos/`, and `thumbnails/`
- **Target Browsers:** Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Deployment:** Vercel or self-hosted Node.js environment

## 2. Assumptions

- Users have a valid Google account with Google Drive access
- The `/.junpa/` directory structure is maintained as the single source of truth for content metadata
- `library.json` serves as the central manifest for all videos, playlists, series, and featured content
- Google Drive API quota is sufficient for typical admin usage patterns (read/write operations)
- Video files are stored in standard web-compatible formats (mp4, webm, mov, avi)
- Network connectivity is generally available, with graceful degradation for temporary disconnections
- A single admin user operates the interface at any given time (concurrent editing is an edge case, not primary flow)

## 3. Requirements

### Module 1: Authentication

**R1.1 Ubiquitous:** The system shall always enforce HTTPS for all authentication communications.

**R1.2 Event-Driven:** WHEN user clicks "Sign in with Google" THEN the system shall initiate OAuth 2.0 flow with Google Drive API scope.

**R1.3 State-Driven:** IF user session is valid THEN the system shall display the authenticated dashboard.

**R1.4 State-Driven:** IF access token expires within 5 minutes THEN the system shall auto-refresh using the refresh token.

**R1.5 Unwanted:** The system shall NOT store access tokens in localStorage; use httpOnly cookies or server-side session.

**R1.6 Event-Driven:** WHEN user clicks logout THEN the system shall revoke OAuth tokens and clear all session data.

---

### Module 2: Video Library

**R2.1 Ubiquitous:** The system shall always display videos in a responsive grid layout with thumbnail, title, and duration.

**R2.2 Event-Driven:** WHEN user accesses the video library THEN the system shall fetch all videos from `/.junpa/library.json`.

**R2.3 Event-Driven:** WHEN user edits video metadata and saves THEN the system shall update `library.json` within 3 seconds.

**R2.4 Optional:** Where possible, the system shall provide full-text search across video titles and tags.

**R2.5 Event-Driven:** WHEN user confirms deletion THEN the system shall remove the video reference from `library.json` and optionally delete the source file.

**R2.6 State-Driven:** IF the video library is empty THEN the system shall display an onboarding prompt with an upload call-to-action.

---

### Module 3: Video Upload

**R3.1 Event-Driven:** WHEN user selects files THEN the system shall upload them to `/.junpa/videos/` with progress indication.

**R3.2 Event-Driven:** WHEN user selects videos from Google Photos picker THEN the system shall copy them to `/.junpa/videos/`.

**R3.3 Ubiquitous:** The system shall always validate that uploaded files are in accepted video formats (mp4, webm, mov, avi).

**R3.4 State-Driven:** IF upload is in progress THEN the system shall display upload percentage and estimated time remaining.

**R3.5 Unwanted:** The system shall NOT accept uploads exceeding 10GB per file.

**R3.6 Event-Driven:** WHEN upload completes THEN the system shall generate metadata and update `library.json`.

---

### Module 4: Playlist Management

**R4.1 Event-Driven:** WHEN user creates a playlist THEN the system shall generate a unique ID and save the playlist to `library.json`.

**R4.2 Event-Driven:** WHEN user drags and drops videos within a playlist THEN the system shall update the order and persist changes.

**R4.3 Event-Driven:** WHEN user sets a start time for a playlist item THEN the system shall store `start_at` in ISO 8601 format.

**R4.4 State-Driven:** IF loop mode is enabled THEN the system shall set the loop flag to true in the playlist configuration.

**R4.5 Optional:** Where possible, the system shall provide total duration calculation and playlist preview playback.

---

### Module 5: Series Management

**R5.1 Event-Driven:** WHEN user creates a series THEN the system shall generate a unique ID with an ordered episode list.

**R5.2 Event-Driven:** WHEN user assigns a video to a series THEN the system shall update series membership and episode order.

**R5.3 Optional:** Where possible, the system shall offer chronological auto-ordering of episodes by upload date.

**R5.4 State-Driven:** IF auto-play is enabled for a series THEN the system shall set the auto-play flag to true.

---

### Module 6: Featured Content

**R6.1 Event-Driven:** WHEN user marks content as featured THEN the system shall add it to the featured content list.

**R6.2 Ubiquitous:** The system shall always limit featured content to a maximum of 10 items.

**R6.3 Event-Driven:** WHEN user reorders featured content THEN the system shall update the priority order and persist changes.

---

### Module 7: Storage Integration

**R7.1 Ubiquitous:** The system shall always maintain the `/.junpa/` directory structure including `library.json`, `videos/`, and `thumbnails/`.

**R7.2 Event-Driven:** WHEN any content modification occurs THEN the system shall sync changes to Google Drive within 5 seconds.

**R7.3 Unwanted:** IF a concurrent conflict is detected THEN the system shall NOT overwrite without explicit user confirmation.

**R7.4 State-Driven:** IF Google Drive API is unavailable THEN the system shall queue changes locally and sync when connectivity is restored.

---

## 4. Specifications

### 4.1 Data Model

The following TypeScript interfaces define the `library.json` schema:

```typescript
interface JunpaLibrary {
  version: string;                // Schema version (e.g., "1.0.0")
  lastModified: string;           // ISO 8601 timestamp
  videos: Video[];
  playlists: Playlist[];
  series: Series[];
  featured: FeaturedConfig;
}

interface Video {
  id: string;                     // UUID v4
  title: string;
  description?: string;
  filename: string;               // Relative path within /.junpa/videos/
  thumbnailPath?: string;         // Relative path within /.junpa/thumbnails/
  duration: number;               // Duration in seconds
  fileSize: number;               // File size in bytes
  format: "mp4" | "webm" | "mov" | "avi";
  tags: string[];
  uploadedAt: string;             // ISO 8601
  updatedAt: string;              // ISO 8601
  source: "local" | "google-photos";
  googleDriveFileId?: string;
  reactions?: Reactions;
}

interface Playlist {
  id: string;                     // UUID v4
  title: string;
  description?: string;
  items: PlaylistItem[];
  loop: boolean;
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
}

interface PlaylistItem {
  videoId: string;                // Reference to Video.id
  order: number;
  startAt?: string;              // ISO 8601 duration (e.g., "PT1M30S")
}

interface Series {
  id: string;                     // UUID v4
  title: string;
  description?: string;
  episodes: SeriesEpisode[];
  autoPlay: boolean;
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
}

interface SeriesEpisode {
  videoId: string;                // Reference to Video.id
  episodeNumber: number;
  title?: string;                 // Optional episode-specific title
}

interface FeaturedConfig {
  maxItems: 10;                   // Hard limit
  items: FeaturedItem[];
  updatedAt: string;              // ISO 8601
}

interface FeaturedItem {
  contentType: "video" | "playlist" | "series";
  contentId: string;              // Reference to Video.id, Playlist.id, or Series.id
  priority: number;               // Lower number = higher priority
  featuredAt: string;             // ISO 8601
}

interface Reactions {
  likes: number;
  views: number;
  lastViewedAt?: string;          // ISO 8601
}
```

### 4.2 Module Dependency Diagram

```
                    +-------------------+
                    |  Authentication   |
                    |    (Module 1)     |
                    +--------+----------+
                             |
                    authenticates
                             |
              +--------------+--------------+
              |                             |
    +---------v----------+       +----------v---------+
    |   Video Library    |       | Storage Integration |
    |    (Module 2)      |       |     (Module 7)      |
    +---------+----------+       +----------+----------+
              |                             ^
         manages                     syncs all changes
              |                             |
    +---------v----------+                  |
    |   Video Upload     +------------------+
    |    (Module 3)      |
    +---------+----------+
              |
         provides videos to
              |
    +---------v-------------------------------------------+
    |                                                     |
    |  +------------------+  +------------------+         |
    |  |    Playlist      |  |     Series       |         |
    |  |   Management     |  |   Management     |         |
    |  |   (Module 4)     |  |   (Module 5)     |         |
    |  +--------+---------+  +--------+---------+         |
    |           |                     |                   |
    |           +----------+----------+                   |
    |                      |                              |
    |           +----------v----------+                   |
    |           |  Featured Content   |                   |
    |           |    (Module 6)       |                   |
    |           +---------------------+                   |
    +---------------------------------------------------------+
```

**Dependency Summary:**
- Module 1 (Authentication) is required by all other modules
- Module 7 (Storage Integration) is used by Modules 2, 3, 4, 5, and 6
- Module 2 (Video Library) depends on Module 3 (Video Upload) for content
- Modules 4 and 5 depend on Module 2 for video references
- Module 6 (Featured Content) can reference content from Modules 2, 4, and 5

---

## 5. Traceability

| Requirement | Module              | Acceptance Criteria | Implementation Task |
|-------------|---------------------|---------------------|---------------------|
| R1.1-R1.6   | Authentication      | Feature 1           | T1.1-T1.4           |
| R2.1-R2.6   | Video Library       | Feature 3           | T2.1-T2.4           |
| R3.1-R3.6   | Video Upload        | Feature 2           | T2.5-T2.8           |
| R4.1-R4.5   | Playlist Management | Feature 4           | T3.1-T3.4           |
| R5.1-R5.4   | Series Management   | Feature 5           | T3.5-T3.7           |
| R6.1-R6.3   | Featured Content    | Feature 6           | T4.1-T4.3           |
| R7.1-R7.4   | Storage Integration | Feature 7           | T1.5-T1.6           |
