"""Playlist service for live position calculation."""

from datetime import UTC, datetime

from junpa_streamer.models.playlist import LivePlaylistState, Playlist

# Video durations cache - in production, this would be fetched from library service
_VIDEO_DURATIONS: dict[str, float] = {
    "video-001": 300.0,  # 5 minutes
    "video-002": 600.0,  # 10 minutes
}


def get_video_duration(video_id: str) -> float:
    """
    Get video duration from cache.

    Args:
        video_id: The video ID

    Returns:
        Duration in seconds
    """
    return _VIDEO_DURATIONS.get(video_id, 0.0)


def calculate_live_position(
    playlist: Playlist,
    now: datetime | None = None,
) -> LivePlaylistState:
    """
    Calculate the current playback position in a live playlist.

    This implements the algorithm from SPEC-STREAM-001:
    1. Calculate elapsed time since start_at
    2. If loop enabled, use modulo of total_duration
    3. Walk through playlist items to find current video
    4. Calculate position within current video

    Args:
        playlist: The playlist to calculate position for
        now: Current time (defaults to now)

    Returns:
        LivePlaylistState with current position information
    """
    if now is None:
        now = datetime.now(UTC)

    # Calculate elapsed time since playlist start
    elapsed = (now - playlist.start_at).total_seconds()

    # Handle negative elapsed (playlist hasn't started)
    if elapsed < 0:
        return LivePlaylistState(
            video_index=0,
            video_id=playlist.items[0].video_id if playlist.items else "",
            position=0.0,
            time_until_next=get_video_duration(playlist.items[0].video_id) if playlist.items else 0.0,
            ended=False,
        )

    # Calculate total duration if not set
    total_duration = playlist.total_duration
    if total_duration <= 0:
        total_duration = sum(
            get_video_duration(item.video_id) for item in playlist.items
        )

    # Handle looping
    if playlist.loop and total_duration > 0:
        elapsed = elapsed % total_duration
    elif elapsed >= total_duration:
        # Playlist has ended (non-looping)
        if playlist.items:
            last_video_id = playlist.items[-1].video_id
            last_duration = get_video_duration(last_video_id)
            return LivePlaylistState(
                video_index=len(playlist.items) - 1,
                video_id=last_video_id,
                position=last_duration,
                time_until_next=0.0,
                ended=True,
            )
        return LivePlaylistState(ended=True)

    # Walk through videos to find current position
    cumulative = 0.0
    for i, item in enumerate(playlist.items):
        video_duration = get_video_duration(item.video_id)

        if cumulative + video_duration > elapsed:
            position_in_video = elapsed - cumulative
            time_until_next = video_duration - position_in_video

            return LivePlaylistState(
                video_index=i,
                video_id=item.video_id,
                position=position_in_video,
                time_until_next=time_until_next,
                ended=False,
            )

        cumulative += video_duration

    # Should not reach here if calculations are correct
    # Return ended state as fallback
    return LivePlaylistState(ended=True)
