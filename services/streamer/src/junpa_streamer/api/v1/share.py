"""Shareable URL endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status

from junpa_streamer.core.signing import verify_stream_token
from junpa_streamer.models.responses import LivePlaylistResponse, VideoStreamResponse
from junpa_streamer.models.stream import StreamType, UserCredentials
from junpa_streamer.services.library import get_playlist_metadata, get_video_with_stream_url
from junpa_streamer.services.playlist import calculate_live_position

router = APIRouter()


def _get_mock_user_from_token(user_id: str) -> UserCredentials:
    """Create a mock user from token data for Drive access."""
    # In production, this would retrieve stored credentials
    return UserCredentials(
        user_id=user_id,
        email=f"{user_id}@example.com",
        access_token="token-from-storage",
    )


@router.get("/{token}", response_model=VideoStreamResponse)
async def get_shared_video(token: str) -> VideoStreamResponse:
    """Get video stream via shareable URL token."""
    token_data = verify_stream_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired stream token",
        )

    if token_data.stream_type != StreamType.ON_DEMAND:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use /s/{token}/live for playlist tokens",
        )

    user = _get_mock_user_from_token(token_data.user_id)
    video = await get_video_with_stream_url(token_data.content_id, user)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    return video


@router.get("/{token}/live", response_model=LivePlaylistResponse)
async def get_shared_live_playlist(token: str) -> LivePlaylistResponse:
    """Get live playlist state via shareable URL token."""
    token_data = verify_stream_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired stream token",
        )

    if token_data.stream_type != StreamType.LIVE_PLAYLIST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use /s/{token} for video tokens",
        )

    user = _get_mock_user_from_token(token_data.user_id)
    playlist = await get_playlist_metadata(token_data.content_id, user)

    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found",
        )

    now = datetime.now(UTC)

    if playlist.start_at > now:
        countdown = (playlist.start_at - now).total_seconds()
        return LivePlaylistResponse(
            playlist_id=playlist.id,
            title=playlist.title,
            status="coming_soon",
            countdown_seconds=countdown,
            total_videos=len(playlist.items),
            is_looping=playlist.loop,
        )

    state = calculate_live_position(playlist, now)

    if state.ended:
        return LivePlaylistResponse(
            playlist_id=playlist.id,
            title=playlist.title,
            status="ended",
            total_videos=len(playlist.items),
            is_looping=playlist.loop,
        )

    current_video = await get_video_with_stream_url(state.video_id, user)
    if not current_video:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Video in playlist not found",
        )

    return LivePlaylistResponse(
        playlist_id=playlist.id,
        title=playlist.title,
        status="live",
        current_video=current_video,
        seek_position=state.position,
        time_until_next=state.time_until_next,
        total_videos=len(playlist.items),
        current_index=state.video_index,
        is_looping=playlist.loop,
    )
