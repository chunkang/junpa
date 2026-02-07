---
id: SPEC-STREAM-001
version: "1.0.0"
status: "draft"
created: "2026-02-04"
updated: "2026-02-04"
author: "Chun Kang"
priority: "high"
---

# SPEC-STREAM-001: Implementation Plan

## 1. Overview

| Field       | Value                                    |
|-------------|------------------------------------------|
| SPEC ID     | SPEC-STREAM-001                          |
| Feature     | Streamer Service for Junpa               |
| Status      | Draft                                    |
| Priority    | High                                     |
| Author      | Chun Kang                                |
| Created     | 2026-02-04                               |

This plan defines the implementation strategy for the Junpa Streamer service, a Python/FastAPI backend that provides HTTP-based adaptive streaming (HLS) for video content stored in Google Drive.

---

## 2. Technology Stack

| Category           | Technology              | Version   | Purpose                                      |
|--------------------|-------------------------|-----------|----------------------------------------------|
| Framework          | FastAPI                 | 0.115.x   | Async web framework, automatic OpenAPI docs  |
| Runtime            | Python                  | 3.12+     | Modern Python with performance improvements  |
| ASGI Server        | uvicorn                 | 0.34.x    | High-performance ASGI server                 |
| Validation         | Pydantic                | 2.10.x    | Data validation, settings management         |
| Google APIs        | google-api-python-client| 2.x       | Google Drive API integration                 |
| OAuth              | google-auth             | 2.x       | Google OAuth 2.0 handling                    |
| HLS Processing     | ffmpeg-python           | 0.2.x     | Video transmuxing to HLS                     |
| Caching            | aiocache                | 0.12.x    | Async caching for metadata                   |
| HTTP Client        | httpx                   | 0.28.x    | Async HTTP client for Drive streaming        |
| Cryptography       | PyJWT                   | 2.10.x    | Signed URL token generation                  |
| Unit Testing       | pytest                  | 8.x       | Test framework                               |
| Async Testing      | pytest-asyncio          | 0.24.x    | Async test support                           |
| Mocking            | pytest-mock             | 3.x       | Mock/patch support                           |
| Coverage           | pytest-cov              | 6.x       | Test coverage reporting                      |
| Type Checking      | mypy                    | 1.14.x    | Static type checking                         |
| Linting            | ruff                    | 0.9.x     | Fast linting and formatting                  |

---

## 3. Implementation Phases

### Phase 1: Foundation (Auth + Google Drive Integration)

**Primary Goal** | Modules 1 and 5 | No dependencies

| Task ID | Task Description                                         | Module  | Dependencies |
|---------|----------------------------------------------------------|---------|--------------|
| T1.1    | Set up FastAPI project structure with uv                 | Core    | None         |
| T1.2    | Configure Pydantic settings and environment variables    | Core    | T1.1         |
| T1.3    | Implement Google OAuth token verification endpoint       | Auth    | T1.2         |
| T5.1    | Create Google Drive API client wrapper                   | Drive   | T1.3         |
| T5.2    | Implement library.json fetching with caching             | Drive   | T5.1         |
| T5.3    | Implement video file streaming from Google Drive         | Drive   | T5.1         |

**Deliverables:**
- FastAPI project skeleton with proper structure
- OAuth token verification working
- Google Drive file access operational
- library.json metadata retrieval with caching

**Requirements Covered:** R1.1-R1.4, R5.1-R5.6

---

### Phase 2: On-Demand Streaming (Video + HLS)

**Secondary Goal** | Modules 2 and 6 | Depends on Phase 1

| Task ID | Task Description                                         | Module  | Dependencies |
|---------|----------------------------------------------------------|---------|--------------|
| T2.1    | Implement video metadata endpoint                        | Stream  | T5.2         |
| T2.2    | Implement HTTP Range request support for video streaming | Stream  | T5.3         |
| T6.1    | Set up ffmpeg integration for HLS transmuxing            | HLS     | T5.3         |
| T6.2    | Implement HLS master playlist generation                 | HLS     | T6.1         |
| T6.3    | Implement HLS segment serving                            | HLS     | T6.1         |
| T2.3    | Build video stream endpoint with HLS support             | Stream  | T6.2, T6.3   |
| T2.4    | Add segment caching for performance                      | Stream  | T2.3         |

**Deliverables:**
- On-demand video streaming functional
- HLS transmuxing working for mp4 files
- Master and variant playlist generation
- Segment-based delivery with caching

**Requirements Covered:** R2.1-R2.6, R6.1-R6.5

---

### Phase 3: Live Playlist Streaming

**Tertiary Goal** | Module 3 | Depends on Phase 2

| Task ID | Task Description                                         | Module  | Dependencies |
|---------|----------------------------------------------------------|---------|--------------|
| T3.1    | Implement playlist metadata endpoint                     | Live    | T5.2         |
| T3.2    | Build live position calculation algorithm                | Live    | T3.1         |
| T3.3    | Implement sliding window HLS manifest for live           | Live    | T3.2, T6.2   |
| T3.4    | Add playlist looping logic                               | Live    | T3.2         |
| T3.5    | Build live segment mapping to video segments             | Live    | T3.3, T6.3   |
| T3.6    | Handle "coming soon" state for future playlists          | Live    | T3.1         |

**Deliverables:**
- Live playlist streaming at current position
- Automatic looping when playlist ends
- Sliding window manifest for live experience
- Coming soon response for future playlists

**Requirements Covered:** R3.1-R3.6

---

### Phase 4: Shareable URLs + Monitoring

**Final Goal** | Modules 4 and 7 | Depends on Phase 3

| Task ID | Task Description                                         | Module  | Dependencies |
|---------|----------------------------------------------------------|---------|--------------|
| T4.1    | Implement signed URL generation with JWT                 | URL     | T1.2         |
| T4.2    | Build signed URL verification and stream routing         | URL     | T4.1, T2.3   |
| T7.1    | Implement health check endpoint                          | Health  | T5.1         |
| T7.2    | Add structured logging with correlation IDs              | Health  | T1.1         |
| T7.3    | Implement Prometheus metrics endpoint (optional)         | Health  | T7.1         |

**Deliverables:**
- Shareable stream URLs with expiration
- Cryptographic signature verification
- Health check with Drive API status
- Structured logging throughout

**Requirements Covered:** R1.5, R4.1-R4.5, R7.1-R7.4

---

## 4. Project Structure

```
services/streamer/
+-- pyproject.toml              # Project metadata and dependencies (uv)
+-- README.md                   # Service documentation
+-- Dockerfile                  # Container definition
+-- .env.example                # Environment variable template
|
+-- src/
|   +-- junpa_streamer/
|       +-- __init__.py
|       +-- main.py             # FastAPI application entry point
|       +-- config.py           # Pydantic settings
|       |
|       +-- api/
|       |   +-- __init__.py
|       |   +-- v1/
|       |       +-- __init__.py
|       |       +-- router.py   # API router aggregation
|       |       +-- auth.py     # Authentication endpoints
|       |       +-- stream.py   # On-demand streaming endpoints
|       |       +-- live.py     # Live playlist endpoints
|       |       +-- share.py    # Shareable URL endpoints
|       |       +-- health.py   # Health/metrics endpoints
|       |
|       +-- core/
|       |   +-- __init__.py
|       |   +-- auth.py         # OAuth token verification
|       |   +-- signing.py      # URL signing/verification
|       |   +-- exceptions.py   # Custom exceptions
|       |
|       +-- services/
|       |   +-- __init__.py
|       |   +-- drive.py        # Google Drive API client
|       |   +-- library.py      # Library.json operations
|       |   +-- hls.py          # HLS transmuxing service
|       |   +-- playlist.py     # Live playlist position calculation
|       |
|       +-- models/
|       |   +-- __init__.py
|       |   +-- video.py        # Video metadata models
|       |   +-- playlist.py     # Playlist models
|       |   +-- stream.py       # Stream token models
|       |   +-- responses.py    # API response models
|       |
|       +-- utils/
|           +-- __init__.py
|           +-- cache.py        # Caching utilities
|           +-- logging.py      # Structured logging setup
|
+-- tests/
    +-- __init__.py
    +-- conftest.py             # Pytest fixtures
    +-- unit/
    |   +-- __init__.py
    |   +-- test_auth.py
    |   +-- test_drive.py
    |   +-- test_hls.py
    |   +-- test_playlist.py
    |   +-- test_signing.py
    |
    +-- integration/
        +-- __init__.py
        +-- test_stream_api.py
        +-- test_live_api.py
        +-- test_share_api.py
```

---

## 5. Environment Configuration

```python
# src/junpa_streamer/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    app_name: str = "Junpa Streamer"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Google OAuth
    google_client_id: str
    google_client_secret: str

    # Security
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    stream_url_expiry_seconds: int = 86400  # 24 hours

    # HLS Settings
    hls_segment_duration: int = 6  # seconds
    hls_playlist_size: int = 5     # segments in live playlist

    # Caching
    library_cache_ttl: int = 60    # seconds
    segment_cache_ttl: int = 300   # seconds

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_prefix = "JUNPA_"
```

---

## 6. Key Algorithms

### 6.1 Live Playlist Position Calculation

```python
def calculate_live_position(playlist: Playlist, now: datetime) -> LiveState:
    """
    Given a playlist with start_at and video durations,
    calculate where playback should be right now.

    Time complexity: O(n) where n = number of videos in playlist
    """
    elapsed = (now - playlist.start_at).total_seconds()

    # Handle looping
    if playlist.loop and elapsed >= playlist.total_duration:
        elapsed = elapsed % playlist.total_duration

    # Handle ended non-looping playlist
    if not playlist.loop and elapsed >= playlist.total_duration:
        return LiveState(ended=True)

    # Find current video
    cumulative = 0.0
    for i, video in enumerate(playlist.videos):
        if cumulative + video.duration > elapsed:
            return LiveState(
                video_index=i,
                video_id=video.id,
                position=elapsed - cumulative,
                ended=False
            )
        cumulative += video.duration
```

### 6.2 Sliding Window HLS Manifest

```python
def generate_live_manifest(state: LiveState, playlist: Playlist) -> str:
    """
    Generate an HLS manifest showing a sliding window of segments
    around the current playback position.
    """
    current_segment = int(state.position // SEGMENT_DURATION)
    total_segments = int(state.video.duration // SEGMENT_DURATION)

    # Show 3 segments before and 2 after current
    start = max(0, current_segment - 3)
    end = min(total_segments, current_segment + 3)

    manifest = [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        f"#EXT-X-TARGETDURATION:{SEGMENT_DURATION}",
        f"#EXT-X-MEDIA-SEQUENCE:{start}",
    ]

    for i in range(start, end):
        manifest.append(f"#EXTINF:{SEGMENT_DURATION},")
        manifest.append(f"segment_{i}.ts")

    return "\n".join(manifest)
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

| Area              | Coverage Target | Focus                                    |
|-------------------|-----------------|------------------------------------------|
| Auth verification | 100%            | Token validation, expiry, error cases    |
| Position calc     | 100%            | Loop/no-loop, edge cases, future start   |
| URL signing       | 100%            | Generation, verification, expiry         |
| HLS generation    | 100%            | Manifest format, segment URLs            |

### 7.2 Integration Tests

| Area              | Coverage Target | Focus                                    |
|-------------------|-----------------|------------------------------------------|
| Stream endpoints  | 90%             | Full request/response cycle              |
| Drive integration | 80%             | Mocked Drive API responses               |
| Live streaming    | 90%             | Position accuracy, manifest correctness  |

### 7.3 Test Commands

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=term-missing

# Run specific module
uv run pytest tests/unit/test_playlist.py

# Run type checking
uv run mypy src

# Run linting
uv run ruff check src
```

---

## 8. Deployment

### 8.1 Docker Configuration

```dockerfile
FROM python:3.12-slim

# Install ffmpeg for HLS transmuxing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project files
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src ./src

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "junpa_streamer.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 8.2 Environment Variables

```bash
# Required
JUNPA_GOOGLE_CLIENT_ID=your-client-id
JUNPA_GOOGLE_CLIENT_SECRET=your-client-secret
JUNPA_JWT_SECRET_KEY=your-secret-key

# Optional
JUNPA_DEBUG=false
JUNPA_LOG_LEVEL=INFO
JUNPA_HLS_SEGMENT_DURATION=6
```

---

## 9. Dependencies on Other SPECs

| SPEC           | Dependency Type | Description                              |
|----------------|-----------------|------------------------------------------|
| SPEC-ADMIN-001 | Data Provider   | library.json schema and video metadata   |

---

## 10. Risk Assessment

| Risk                         | Mitigation                                    |
|------------------------------|-----------------------------------------------|
| Google Drive API rate limits | Implement caching, backoff retry              |
| Large video transmuxing time | Pre-generate HLS for popular content          |
| Live position drift          | Use server time, add client sync mechanism    |
| OAuth token expiration       | Implement refresh flow, clear error messages  |
