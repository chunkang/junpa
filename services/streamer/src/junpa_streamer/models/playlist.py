"""Playlist data models."""

from datetime import datetime

from pydantic import BaseModel, Field


class PlaylistItem(BaseModel):
    """Item in a playlist."""

    video_id: str
    order: int
    start_at: str | None = None  # ISO 8601 duration


class Playlist(BaseModel):
    """Playlist metadata model matching library.json schema."""

    id: str
    title: str
    description: str | None = None
    items: list[PlaylistItem] = Field(default_factory=list)
    loop: bool = False
    start_at: datetime  # When the live playlist starts
    created_at: datetime
    updated_at: datetime
    total_duration: float = 0.0  # Calculated from video durations


class LivePlaylistState(BaseModel):
    """Current state of a live playlist playback."""

    video_index: int = 0
    video_id: str = ""
    position: float = 0.0  # Position in current video (seconds)
    time_until_next: float = 0.0  # Time until next video (seconds)
    ended: bool = False
