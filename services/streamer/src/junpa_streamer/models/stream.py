"""Stream-related data models."""

from enum import StrEnum

from pydantic import BaseModel, Field


class StreamType(StrEnum):
    """Type of stream."""

    ON_DEMAND = "on_demand"
    LIVE_PLAYLIST = "live_playlist"


class UserCredentials(BaseModel):
    """User credentials extracted from OAuth token."""

    user_id: str
    email: str
    access_token: str


class StreamURLRequest(BaseModel):
    """Request to generate a shareable stream URL."""

    stream_type: StreamType
    content_id: str
    expires_in: int = Field(default=86400, ge=60, le=604800)  # 1 min to 7 days
