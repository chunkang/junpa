"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status

from junpa_streamer.core.auth import get_current_user, verify_google_token
from junpa_streamer.core.signing import create_stream_token
from junpa_streamer.models.responses import StreamURLResponse, TokenVerifyResponse
from junpa_streamer.models.stream import StreamType, StreamURLRequest, UserCredentials

router = APIRouter()


@router.post("/token/verify", response_model=TokenVerifyResponse)
async def verify_token(token: str) -> TokenVerifyResponse:
    """Verify a Google OAuth token and return user info."""
    credentials = await verify_google_token(token)
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return TokenVerifyResponse(
        valid=True,
        user_id=credentials.user_id,
        email=credentials.email,
    )


@router.post("/stream-url", response_model=StreamURLResponse)
async def generate_stream_url(
    request: StreamURLRequest,
    user: UserCredentials = Depends(get_current_user),
) -> StreamURLResponse:
    """Generate a shareable stream URL."""
    token_data = create_stream_token(
        stream_type=request.stream_type,
        content_id=request.content_id,
        user_id=user.user_id,
        expires_in=request.expires_in,
    )

    base_path = "/api/v1/s"
    if request.stream_type == StreamType.ON_DEMAND:
        url = f"{base_path}/{token_data.token}/master.m3u8"
    else:
        url = f"{base_path}/{token_data.token}/live.m3u8"

    return StreamURLResponse(
        url=url,
        expires_at=token_data.expires_at,
        stream_type=request.stream_type,
        content_id=request.content_id,
    )
