---
id: SPEC-STREAM-001
version: "1.1.0"
status: "draft"
created: "2026-02-04"
updated: "2026-02-04"
author: "Chun Kang"
priority: "high"
---

# SPEC-STREAM-001: Streamer Service for Junpa

## History

| Date       | Version | Author    | Description            |
|------------|---------|-----------|------------------------|
| 2026-02-04 | 1.0.0   | Chun Kang | Initial SPEC creation  |
| 2026-02-04 | 1.1.0   | Chun Kang | Simplified to direct Google Drive streaming |

---

## 1. Environment

- **Platform:** Python web service (FastAPI)
- **Runtime:** Python 3.12+
- **Authentication:** Google OAuth 2.0 token verification
- **Storage Backend:** Google Drive API for video file retrieval
- **Data Source:** `/.junpa/library.json` from user's Google Drive
- **Streaming Protocol:** Direct Google Drive streaming (no transcoding)
- **Deployment:** Railway, Docker container, or self-hosted

## 2. Assumptions

- Admin Web (SPEC-ADMIN-001) has already populated `/.junpa/library.json` with video metadata
- Video files are stored in `/.junpa/videos/` on the user's Google Drive
- Google Drive handles video streaming directly (no server-side transcoding)
- Video files are in web-compatible formats (mp4, webm) playable by HTML5 video
- Frontend handles playback using standard HTML5 video element with seek support
- Operational costs are minimized by leveraging Google Drive's infrastructure
- Single playlist can have multiple concurrent viewers

---

## 3. Requirements

### Module 1: Stream Authentication

**R1.1 Ubiquitous:** The system shall always verify Google OAuth tokens before serving protected streams.

**R1.2 Event-Driven:** WHEN a request includes a valid OAuth token THEN the system shall extract the user's Google Drive credentials.

**R1.3 Event-Driven:** WHEN a shareable stream URL is accessed THEN the system shall validate the stream token without requiring user login.

**R1.4 State-Driven:** IF a stream token is expired THEN the system shall return HTTP 401 with a refresh instruction.

**R1.5 Unwanted:** The system shall NOT expose raw Google Drive file IDs in public URLs.

---

### Module 2: On-Demand Streaming

**R2.1 Event-Driven:** WHEN a client requests a video by ID THEN the system shall return video metadata with a Google Drive streaming URL.

**R2.2 Event-Driven:** WHEN a client requests to play a video THEN the system shall redirect or proxy to the Google Drive file.

**R2.3 State-Driven:** IF the requested video does not exist in library.json THEN the system shall return HTTP 404.

**R2.4 Ubiquitous:** The system shall always return video duration and format for frontend seeking support.

---

### Module 3: Live Playlist Streaming

**R3.1 Event-Driven:** WHEN a client accesses a live playlist THEN the system shall calculate the current playback position based on `start_at` and current time.

**R3.2 Ubiquitous:** The system shall always return the current video URL with seek position for live playlists.

**R3.3 Event-Driven:** WHEN the frontend reports video ended THEN the system shall return the next video in the playlist.

**R3.4 State-Driven:** IF the playlist has loop enabled THEN the system shall calculate position using modulo of total duration.

**R3.5 State-Driven:** IF the playlist start_at is in the future THEN the system shall return a "coming_soon" response with countdown.

**R3.6 State-Driven:** IF a non-looping playlist has ended THEN the system shall return status "ended".

---

### Module 4: Stream URL Generation

**R4.1 Event-Driven:** WHEN the admin requests a shareable URL THEN the system shall generate a signed URL with expiration.

**R4.2 Ubiquitous:** The system shall always include a cryptographic signature in shareable URLs.

**R4.3 Event-Driven:** WHEN a signed URL is accessed THEN the system shall verify signature and expiration before serving.

**R4.4 State-Driven:** IF the URL signature is invalid THEN the system shall return HTTP 403 Forbidden.

**R4.5 Optional:** Where possible, the system shall support custom expiration durations for shareable URLs.

---

### Module 5: Google Drive Integration

**R5.1 Event-Driven:** WHEN streaming is initiated THEN the system shall authenticate with Google Drive using the user's OAuth credentials.

**R5.2 Ubiquitous:** The system shall always provide Google Drive streaming URLs directly to the frontend.

**R5.3 Event-Driven:** WHEN fetching library.json THEN the system shall read from `/.junpa/library.json` in the user's Drive.

**R5.4 State-Driven:** IF Google Drive API returns an error THEN the system shall return appropriate HTTP status with error details.

**R5.5 Unwanted:** The system shall NOT store or transcode video files on the streaming server.

**R5.6 Optional:** Where possible, the system shall cache library.json metadata with a 60-second TTL.

---

### Module 6: Health and Monitoring

**R6.1 Ubiquitous:** The system shall always expose a `/health` endpoint returning service status.

**R6.2 Event-Driven:** WHEN `/health` is called THEN the system shall verify Google Drive API connectivity.

**R6.3 Event-Driven:** WHEN an error occurs THEN the system shall log structured error details with correlation ID.

---

## 4. Specifications

### 4.1 API Endpoints

```
Base URL: /api/v1

Authentication:
  POST   /auth/token/verify     - Verify OAuth token
  POST   /auth/stream-url       - Generate shareable stream URL

On-Demand Streaming:
  GET    /stream/{video_id}     - Get video metadata with streaming URL

Live Playlist Streaming:
  GET    /live/{playlist_id}    - Get current playback state (video URL + seek position)
  GET    /live/{playlist_id}/next - Get next video after current ends

Shareable URLs:
  GET    /s/{token}             - Get stream info via signed token
  GET    /s/{token}/live        - Get live playlist state via signed token

Health:
  GET    /health                - Health check
```

### 4.2 Data Models

```python
from pydantic import BaseModel
from datetime import datetime
from enum import StrEnum

class StreamType(StrEnum):
    ON_DEMAND = "on_demand"
    LIVE_PLAYLIST = "live_playlist"

class VideoStreamResponse(BaseModel):
    id: str
    title: str
    duration: float           # seconds
    format: str               # mp4, webm
    stream_url: str           # Google Drive streaming URL
    thumbnail_url: str | None

class LivePlaylistResponse(BaseModel):
    playlist_id: str
    title: str
    status: str               # "coming_soon", "live", "ended"
    # If coming_soon:
    countdown_seconds: float | None
    # If live:
    current_video: VideoStreamResponse | None
    seek_position: float | None    # seconds to seek to
    time_until_next: float | None  # seconds until next video
    # Playlist info:
    total_videos: int
    current_index: int | None
    is_looping: bool

class StreamURLRequest(BaseModel):
    stream_type: StreamType
    content_id: str
    expires_in: int = 86400   # seconds, default 24 hours

class StreamURLResponse(BaseModel):
    url: str
    expires_at: datetime
    stream_type: StreamType
    content_id: str
```

### 4.3 Live Playlist Position Calculation

```python
def calculate_live_position(playlist, current_time) -> LivePlaylistState:
    """
    Calculate current playback position in a live playlist.

    Returns:
        - current_video_id: which video to play
        - seek_position: where to seek in that video
        - time_until_next: when the video ends

    Frontend behavior:
        1. Fetch /live/{playlist_id}
        2. Set video.src = response.current_video.stream_url
        3. Set video.currentTime = response.seek_position
        4. On video ended, fetch /live/{playlist_id}/next or re-fetch /live/{playlist_id}
    """
```

### 4.4 Module Dependency Diagram

```
                    +-------------------+
                    | Stream Auth       |
                    |   (Module 1)      |
                    +--------+----------+
                             |
                    authenticates
                             |
              +--------------+--------------+
              |              |              |
    +---------v----+  +------v------+  +---v-----------+
    | On-Demand    |  | Live        |  | URL Generation|
    | Streaming    |  | Playlist    |  |   (Module 4)  |
    | (Module 2)   |  | (Module 3)  |  +---------------+
    +-------+------+  +------+------+
            |                |
            +-------+--------+
                    |
          +---------v----------+
          | Google Drive       |
          | Integration        |
          | (Module 5)         |
          +---------+----------+
                    |
          +---------v----------+
          | Health/Monitoring  |
          | (Module 6)         |
          +--------------------+
```

---

## 5. Traceability

| Requirement | Module              | Acceptance Criteria | Implementation Task |
|-------------|---------------------|---------------------|---------------------|
| R1.1-R1.5   | Stream Auth         | Feature 1           | T1.1-T1.3           |
| R2.1-R2.4   | On-Demand Streaming | Feature 2           | T2.1-T2.2           |
| R3.1-R3.6   | Live Playlist       | Feature 3           | T3.1-T3.3           |
| R4.1-R4.5   | URL Generation      | Feature 4           | T4.1-T4.2           |
| R5.1-R5.6   | Google Drive        | Feature 5           | T5.1-T5.3           |
| R6.1-R6.3   | Health/Monitoring   | Feature 6           | T6.1-T6.2           |
