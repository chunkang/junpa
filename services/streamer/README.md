# Junpa Streamer

Lightweight streaming service for Junpa that provides video metadata and Google Drive streaming URLs. No transcoding - videos stream directly from Google Drive.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Frontend   │────▶│  Streamer   │────▶│ Google Drive │
│  (Player)   │     │   (API)     │     │  (Storage)   │
└─────────────┘     └─────────────┘     └──────────────┘
       │                   │
       │    1. Request     │
       │   video/playlist  │
       │──────────────────▶│
       │                   │
       │  2. Return URL +  │
       │   seek position   │
       │◀──────────────────│
       │                   │
       │  3. Play directly │
       │   from Drive      │
       │──────────────────────────────────────────────▶│
```

**Key Benefits:**
- Zero video processing on server
- Minimal operational costs
- Google Drive handles bandwidth
- Simple HTML5 video playback

## Quick Start

```bash
cd services/streamer

# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Run development server
uv run uvicorn junpa_streamer.main:app --reload

# API docs at http://localhost:8000/api/v1/docs
```

## API Endpoints

### Health
```
GET /api/v1/health
```

### On-Demand Streaming
```
GET /api/v1/stream/{video_id}
```
Returns video metadata with `stream_url` pointing to Google Drive.

**Response:**
```json
{
  "id": "video-001",
  "title": "My Video",
  "duration": 300.0,
  "format": "mp4",
  "stream_url": "https://drive.google.com/...",
  "thumbnail_url": "/thumbnails/video-001.jpg"
}
```

### Live Playlist
```
GET /api/v1/live/{playlist_id}
GET /api/v1/live/{playlist_id}/next
```
Returns current video with seek position for "live TV" experience.

**Response:**
```json
{
  "playlist_id": "playlist-001",
  "title": "24/7 Channel",
  "status": "live",
  "current_video": { ... },
  "seek_position": 125.5,
  "time_until_next": 174.5,
  "current_index": 2,
  "total_videos": 10,
  "is_looping": true
}
```

**Frontend Usage:**
```javascript
const response = await fetch('/api/v1/live/playlist-001');
const data = await response.json();

video.src = data.current_video.stream_url;
video.currentTime = data.seek_position;
video.play();

video.onended = () => {
  // Fetch next video
  fetch('/api/v1/live/playlist-001/next');
};
```

### Shareable URLs
```
POST /api/v1/auth/stream-url  // Generate signed URL
GET  /api/v1/s/{token}        // Access video via token
GET  /api/v1/s/{token}/live   // Access playlist via token
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `JUNPA_GOOGLE_CLIENT_ID` | required | Google OAuth client ID |
| `JUNPA_GOOGLE_CLIENT_SECRET` | required | Google OAuth secret |
| `JUNPA_JWT_SECRET_KEY` | required | Secret for signing URLs |
| `JUNPA_LIBRARY_CACHE_TTL` | 60 | Library.json cache (seconds) |

## Development

```bash
# Run tests
uv run pytest -v

# Run with coverage
uv run pytest --cov=src

# Lint
uv run ruff check src

# Type check
uv run mypy src
```

## Project Structure

```
src/junpa_streamer/
├── main.py              # FastAPI app
├── config.py            # Settings
├── api/v1/
│   ├── auth.py          # Token verification
│   ├── stream.py        # On-demand video
│   ├── live.py          # Live playlists
│   ├── share.py         # Shareable URLs
│   └── health.py        # Health check
├── core/
│   ├── auth.py          # OAuth logic
│   └── signing.py       # JWT signing
├── services/
│   ├── library.py       # Video/playlist data
│   ├── playlist.py      # Position calculation
│   └── drive.py         # Google Drive client
└── models/              # Pydantic models
```
