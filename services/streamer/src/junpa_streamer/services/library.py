"""Library service for accessing video and playlist metadata."""

import logging
from datetime import UTC, datetime
from typing import Any

from junpa_streamer.config import settings
from junpa_streamer.models.playlist import Playlist, PlaylistItem
from junpa_streamer.models.responses import VideoStreamResponse
from junpa_streamer.models.stream import UserCredentials
from junpa_streamer.models.video import Video
from junpa_streamer.services.drive import GoogleDriveService

logger = logging.getLogger(__name__)

# In-memory cache for library data
_library_cache: dict[str, tuple[datetime, dict[str, Any]]] = {}

# Mock data for development when Google Drive is not configured
_MOCK_VIDEOS: dict[str, Video] = {
    "video-001": Video(
        id="video-001",
        title="Sample Video 1",
        description="A sample video for testing",
        filename="sample1.mp4",
        duration=300.0,
        file_size=100_000_000,
        format="mp4",
        tags=["sample", "test"],
        uploaded_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        source="local",
        google_drive_file_id="mock-drive-id-1",
    ),
    "video-002": Video(
        id="video-002",
        title="Sample Video 2",
        description="Another sample video",
        filename="sample2.mp4",
        duration=600.0,
        file_size=200_000_000,
        format="mp4",
        tags=["sample"],
        uploaded_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        source="local",
        google_drive_file_id="mock-drive-id-2",
    ),
}

_MOCK_PLAYLISTS: dict[str, Playlist] = {
    "playlist-001": Playlist(
        id="playlist-001",
        title="Sample Playlist",
        description="A sample live playlist",
        items=[
            PlaylistItem(video_id="video-001", order=0),
            PlaylistItem(video_id="video-002", order=1),
        ],
        loop=True,
        start_at=datetime(2026, 2, 4, 0, 0, 0, tzinfo=UTC),
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        total_duration=900.0,
    ),
}


def _is_mock_mode() -> bool:
    """Check if we're running in mock mode (no Google credentials)."""
    return not settings.google_client_id or not settings.google_client_secret


async def _get_library_data(user: UserCredentials) -> dict[str, Any]:
    """
    Get library.json data with caching.

    Args:
        user: User credentials for Drive access

    Returns:
        Parsed library.json contents
    """
    cache_key = user.user_id
    now = datetime.now(UTC)

    # Check cache
    if cache_key in _library_cache:
        cached_time, cached_data = _library_cache[cache_key]
        age = (now - cached_time).total_seconds()
        if age < settings.library_cache_ttl:
            return cached_data

    # Fetch from Google Drive
    drive = GoogleDriveService(user)
    data = await drive.get_library_json()

    # Update cache
    _library_cache[cache_key] = (now, data)

    return data


def _parse_video(video_data: dict[str, Any]) -> Video:
    """Parse video data from library.json format."""
    return Video(
        id=video_data["id"],
        title=video_data["title"],
        description=video_data.get("description"),
        filename=video_data["filename"],
        thumbnail_path=video_data.get("thumbnailPath"),
        duration=video_data["duration"],
        file_size=video_data["fileSize"],
        format=video_data["format"],
        tags=video_data.get("tags", []),
        uploaded_at=datetime.fromisoformat(video_data["uploadedAt"].replace("Z", "+00:00")),
        updated_at=datetime.fromisoformat(video_data["updatedAt"].replace("Z", "+00:00")),
        source=video_data["source"],
        google_drive_file_id=video_data.get("googleDriveFileId"),
    )


def _parse_playlist(playlist_data: dict[str, Any], videos: dict[str, Video]) -> Playlist:
    """Parse playlist data from library.json format."""
    items = [
        PlaylistItem(
            video_id=item["videoId"],
            order=item["order"],
            start_at=item.get("startAt"),
        )
        for item in playlist_data["items"]
    ]

    # Calculate total duration from videos
    total_duration = sum(
        videos[item.video_id].duration
        for item in items
        if item.video_id in videos
    )

    return Playlist(
        id=playlist_data["id"],
        title=playlist_data["title"],
        description=playlist_data.get("description"),
        items=items,
        loop=playlist_data.get("loop", False),
        start_at=datetime.fromisoformat(playlist_data.get("startAt", datetime.now(UTC).isoformat()).replace("Z", "+00:00")),
        created_at=datetime.fromisoformat(playlist_data["createdAt"].replace("Z", "+00:00")),
        updated_at=datetime.fromisoformat(playlist_data["updatedAt"].replace("Z", "+00:00")),
        total_duration=total_duration,
    )


async def get_video_with_stream_url(
    video_id: str,
    user: UserCredentials,
) -> VideoStreamResponse | None:
    """
    Get video metadata with Google Drive streaming URL.

    Args:
        video_id: The video ID to look up
        user: User credentials for Google Drive access

    Returns:
        VideoStreamResponse with stream_url if found, None otherwise
    """
    if _is_mock_mode():
        # Use mock data
        video = _MOCK_VIDEOS.get(video_id)
        if not video:
            return None
        stream_url = f"https://drive.google.com/uc?id={video.google_drive_file_id}&export=download"
    else:
        # Use real Google Drive
        try:
            library = await _get_library_data(user)
            videos = library.get("videos", [])
            video_data = next((v for v in videos if v["id"] == video_id), None)
            if not video_data:
                return None
            video = _parse_video(video_data)

            # Generate authenticated stream URL
            drive = GoogleDriveService(user)
            file_id = video.google_drive_file_id or video_id
            stream_url = drive.get_stream_url_with_token(file_id)
        except Exception as e:
            logger.error(f"Failed to get video {video_id}: {e}")
            return None

    return VideoStreamResponse(
        id=video.id,
        title=video.title,
        description=video.description,
        duration=video.duration,
        format=video.format,
        stream_url=stream_url,
        thumbnail_url=f"/thumbnails/{video.id}.jpg" if video.thumbnail_path else None,
    )


async def get_video(video_id: str, user: UserCredentials) -> Video | None:
    """
    Get full video object from library.json.

    Args:
        video_id: The video ID to look up
        user: User credentials for Google Drive access

    Returns:
        Video if found, None otherwise
    """
    if _is_mock_mode():
        return _MOCK_VIDEOS.get(video_id)

    try:
        library = await _get_library_data(user)
        videos = library.get("videos", [])
        video_data = next((v for v in videos if v["id"] == video_id), None)
        if not video_data:
            return None
        return _parse_video(video_data)
    except Exception as e:
        logger.error(f"Failed to get video {video_id}: {e}")
        return None


async def get_playlist_metadata(
    playlist_id: str,
    user: UserCredentials,
) -> Playlist | None:
    """
    Get playlist metadata from library.json.

    Args:
        playlist_id: The playlist ID to look up
        user: User credentials for Google Drive access

    Returns:
        Playlist if found, None otherwise
    """
    if _is_mock_mode():
        return _MOCK_PLAYLISTS.get(playlist_id)

    try:
        library = await _get_library_data(user)

        # Build video lookup
        videos = {v["id"]: _parse_video(v) for v in library.get("videos", [])}

        # Find playlist
        playlists = library.get("playlists", [])
        playlist_data = next((p for p in playlists if p["id"] == playlist_id), None)
        if not playlist_data:
            return None

        return _parse_playlist(playlist_data, videos)
    except Exception as e:
        logger.error(f"Failed to get playlist {playlist_id}: {e}")
        return None


async def get_video_duration(video_id: str, user: UserCredentials) -> float:
    """
    Get the duration of a video in seconds.

    Args:
        video_id: The video ID
        user: User credentials for Google Drive access

    Returns:
        Duration in seconds, or 0 if not found
    """
    video = await get_video(video_id, user)
    return video.duration if video else 0.0
