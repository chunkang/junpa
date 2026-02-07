"""API response models."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from junpa_streamer.models.stream import StreamType


class HealthResponse(BaseModel):
    """Health check response."""

    status: Literal["healthy", "degraded", "unhealthy"]
    timestamp: datetime
    version: str
    drive_status: Literal["connected", "disconnected", "unknown"]


class TokenVerifyResponse(BaseModel):
    """Token verification response."""

    valid: bool
    user_id: str | None = None
    email: str | None = None


class StreamURLResponse(BaseModel):
    """Generated stream URL response."""

    url: str
    expires_at: datetime
    stream_type: StreamType
    content_id: str


class VideoStreamResponse(BaseModel):
    """Video metadata with streaming URL."""

    id: str
    title: str
    description: str | None = None
    duration: float  # seconds
    format: str  # mp4, webm
    stream_url: str  # Google Drive streaming URL
    thumbnail_url: str | None = None


class LivePlaylistResponse(BaseModel):
    """Live playlist current state response."""

    playlist_id: str
    title: str
    status: Literal["coming_soon", "live", "ended"]
    # If coming_soon:
    countdown_seconds: float | None = None
    # If live:
    current_video: VideoStreamResponse | None = None
    seek_position: float | None = None  # seconds to seek to
    time_until_next: float | None = None  # seconds until next video
    # Playlist info:
    total_videos: int = 0
    current_index: int | None = None
    is_looping: bool = False
