"""URL signing and verification for shareable streams."""

from datetime import UTC, datetime, timedelta

import jwt
from pydantic import BaseModel

from junpa_streamer.config import settings
from junpa_streamer.models.stream import StreamType


class StreamTokenData(BaseModel):
    """Data contained in a stream token."""

    token: str
    stream_type: StreamType
    content_id: str
    user_id: str
    expires_at: datetime


class VerifiedToken(BaseModel):
    """Verified token payload."""

    stream_type: StreamType
    content_id: str
    user_id: str
    expires_at: datetime


def create_stream_token(
    stream_type: StreamType,
    content_id: str,
    user_id: str,
    expires_in: int = 86400,
) -> StreamTokenData:
    """
    Create a signed stream token for shareable URLs.

    Args:
        stream_type: Type of stream (on_demand or live_playlist)
        content_id: ID of the video or playlist
        user_id: ID of the user creating the token
        expires_in: Expiration time in seconds (default 24 hours)

    Returns:
        StreamTokenData containing the token and metadata
    """
    expires_at = datetime.now(UTC) + timedelta(seconds=expires_in)

    payload = {
        "stream_type": stream_type.value,
        "content_id": content_id,
        "user_id": user_id,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return StreamTokenData(
        token=token,
        stream_type=stream_type,
        content_id=content_id,
        user_id=user_id,
        expires_at=expires_at,
    )


def verify_stream_token(token: str) -> VerifiedToken | None:
    """
    Verify a stream token and extract its payload.

    Args:
        token: The JWT token to verify

    Returns:
        VerifiedToken if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        return VerifiedToken(
            stream_type=StreamType(payload["stream_type"]),
            content_id=payload["content_id"],
            user_id=payload["user_id"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=UTC),
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
