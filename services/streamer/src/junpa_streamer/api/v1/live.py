"""Live playlist streaming endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status

from junpa_streamer.core.auth import get_current_user
from junpa_streamer.models.responses import LivePlaylistResponse
from junpa_streamer.models.stream import UserCredentials
from junpa_streamer.services.library import get_playlist_metadata, get_video_with_stream_url
from junpa_streamer.services.playlist import calculate_live_position

router = APIRouter()


@router.get("/{playlist_id}", response_model=LivePlaylistResponse)
async def get_live_playlist(
    playlist_id: str,
    user: UserCredentials = Depends(get_current_user),
) -> LivePlaylistResponse:
    """
    Get live playlist current state with video URL and seek position.

    The frontend should:
    1. Set video.src = response.current_video.stream_url
    2. Set video.currentTime = response.seek_position
    3. On video ended, call /live/{playlist_id}/next or re-fetch this endpoint
    """
    playlist = await get_playlist_metadata(playlist_id, user)
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Playlist not found: {playlist_id}",
        )

    now = datetime.now(UTC)

    # Check if playlist hasn't started yet
    if playlist.start_at > now:
        countdown = (playlist.start_at - now).total_seconds()
        return LivePlaylistResponse(
            playlist_id=playlist_id,
            title=playlist.title,
            status="coming_soon",
            countdown_seconds=countdown,
            total_videos=len(playlist.items),
            is_looping=playlist.loop,
        )

    state = calculate_live_position(playlist, now)

    if state.ended:
        return LivePlaylistResponse(
            playlist_id=playlist_id,
            title=playlist.title,
            status="ended",
            total_videos=len(playlist.items),
            is_looping=playlist.loop,
        )

    # Get the current video with stream URL
    current_video = await get_video_with_stream_url(state.video_id, user)
    if not current_video:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video in playlist not found: {state.video_id}",
        )

    return LivePlaylistResponse(
        playlist_id=playlist_id,
        title=playlist.title,
        status="live",
        current_video=current_video,
        seek_position=state.position,
        time_until_next=state.time_until_next,
        total_videos=len(playlist.items),
        current_index=state.video_index,
        is_looping=playlist.loop,
    )


@router.get("/{playlist_id}/next", response_model=LivePlaylistResponse)
async def get_next_video(
    playlist_id: str,
    user: UserCredentials = Depends(get_current_user),
) -> LivePlaylistResponse:
    """
    Get the next video in the playlist.

    This is called when the current video ends. It re-calculates
    the current position which will naturally advance to the next video.
    """
    # Simply re-fetch the current state - the position calculation
    # will return the next video since time has advanced
    return await get_live_playlist(playlist_id, user)
