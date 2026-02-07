"""Tests for URL signing and verification."""

from datetime import UTC, datetime, timedelta

import pytest

from junpa_streamer.core.signing import create_stream_token, verify_stream_token
from junpa_streamer.models.stream import StreamType


class TestStreamTokenSigning:
    """Tests for stream token creation and verification."""

    def test_create_token_on_demand(self) -> None:
        """Test creating a token for on-demand stream."""
        token_data = create_stream_token(
            stream_type=StreamType.ON_DEMAND,
            content_id="video-123",
            user_id="user-456",
        )

        assert token_data.token is not None
        assert len(token_data.token) > 0
        assert token_data.stream_type == StreamType.ON_DEMAND
        assert token_data.content_id == "video-123"
        assert token_data.user_id == "user-456"
        assert token_data.expires_at > datetime.now(UTC)

    def test_create_token_live_playlist(self) -> None:
        """Test creating a token for live playlist."""
        token_data = create_stream_token(
            stream_type=StreamType.LIVE_PLAYLIST,
            content_id="playlist-789",
            user_id="user-456",
        )

        assert token_data.stream_type == StreamType.LIVE_PLAYLIST
        assert token_data.content_id == "playlist-789"

    def test_create_token_custom_expiry(self) -> None:
        """Test creating a token with custom expiration."""
        expires_in = 3600  # 1 hour
        before = datetime.now(UTC)
        token_data = create_stream_token(
            stream_type=StreamType.ON_DEMAND,
            content_id="video-123",
            user_id="user-456",
            expires_in=expires_in,
        )
        after = datetime.now(UTC)

        expected_min = before + timedelta(seconds=expires_in)
        expected_max = after + timedelta(seconds=expires_in)

        assert expected_min <= token_data.expires_at <= expected_max

    def test_verify_valid_token(self) -> None:
        """Test verifying a valid token."""
        token_data = create_stream_token(
            stream_type=StreamType.ON_DEMAND,
            content_id="video-123",
            user_id="user-456",
        )

        verified = verify_stream_token(token_data.token)

        assert verified is not None
        assert verified.stream_type == StreamType.ON_DEMAND
        assert verified.content_id == "video-123"
        assert verified.user_id == "user-456"

    def test_verify_invalid_token(self) -> None:
        """Test verifying an invalid token."""
        verified = verify_stream_token("invalid-token")
        assert verified is None

    def test_verify_tampered_token(self) -> None:
        """Test verifying a tampered token."""
        token_data = create_stream_token(
            stream_type=StreamType.ON_DEMAND,
            content_id="video-123",
            user_id="user-456",
        )

        # Tamper with the token
        tampered = token_data.token[:-5] + "XXXXX"

        verified = verify_stream_token(tampered)
        assert verified is None

    def test_verify_expired_token(self) -> None:
        """Test verifying an expired token."""
        # Create a token that expires immediately
        token_data = create_stream_token(
            stream_type=StreamType.ON_DEMAND,
            content_id="video-123",
            user_id="user-456",
            expires_in=-1,  # Already expired
        )

        verified = verify_stream_token(token_data.token)
        assert verified is None
