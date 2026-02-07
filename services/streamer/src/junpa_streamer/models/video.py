"""Video data models."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class Reactions(BaseModel):
    """Video reactions data."""

    likes: int = 0
    views: int = 0
    last_viewed_at: datetime | None = None


class Video(BaseModel):
    """Video metadata model matching library.json schema."""

    id: str
    title: str
    description: str | None = None
    filename: str
    thumbnail_path: str | None = None
    duration: float  # seconds
    file_size: int  # bytes
    format: Literal["mp4", "webm", "mov", "avi"]
    tags: list[str] = Field(default_factory=list)
    uploaded_at: datetime
    updated_at: datetime
    source: Literal["local", "google-photos"]
    google_drive_file_id: str | None = None
    reactions: Reactions | None = None
