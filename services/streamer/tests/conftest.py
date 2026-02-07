"""Pytest configuration and fixtures."""

from datetime import UTC, datetime
from typing import AsyncGenerator

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

from junpa_streamer.main import app
from junpa_streamer.models.playlist import Playlist, PlaylistItem
from junpa_streamer.models.stream import UserCredentials


@pytest.fixture
def client() -> TestClient:
    """Synchronous test client."""
    return TestClient(app)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Asynchronous test client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client


@pytest.fixture
def mock_user() -> UserCredentials:
    """Mock authenticated user."""
    return UserCredentials(
        user_id="test-user-123",
        email="test@example.com",
        access_token="test-token",
    )


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Authorization headers for authenticated requests."""
    return {"Authorization": "Bearer test-token"}


@pytest.fixture
def sample_playlist() -> Playlist:
    """Sample playlist for testing."""
    return Playlist(
        id="test-playlist",
        title="Test Playlist",
        items=[
            PlaylistItem(video_id="video-001", order=0),
            PlaylistItem(video_id="video-002", order=1),
        ],
        loop=True,
        start_at=datetime(2026, 2, 4, 10, 0, 0, tzinfo=UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        total_duration=900.0,  # 15 minutes
    )


@pytest.fixture
def non_looping_playlist() -> Playlist:
    """Non-looping playlist for testing."""
    return Playlist(
        id="test-playlist-no-loop",
        title="Test Playlist (No Loop)",
        items=[
            PlaylistItem(video_id="video-001", order=0),
            PlaylistItem(video_id="video-002", order=1),
        ],
        loop=False,
        start_at=datetime(2026, 2, 4, 10, 0, 0, tzinfo=UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        total_duration=900.0,
    )
