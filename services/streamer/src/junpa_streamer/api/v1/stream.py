"""On-demand video streaming endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from junpa_streamer.core.auth import get_current_user
from junpa_streamer.models.responses import VideoStreamResponse
from junpa_streamer.models.stream import UserCredentials
from junpa_streamer.services.library import get_video_with_stream_url

router = APIRouter()


@router.get("/{video_id}", response_model=VideoStreamResponse)
async def get_video_stream(
    video_id: str,
    user: UserCredentials = Depends(get_current_user),
) -> VideoStreamResponse:
    """
    Get video metadata with Google Drive streaming URL.

    The frontend should:
    1. Use stream_url as the video source
    2. Use duration for progress bar / seeking
    """
    video = await get_video_with_stream_url(video_id, user)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video not found: {video_id}",
        )
    return video
