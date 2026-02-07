"""Authentication and authorization logic."""

from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from junpa_streamer.models.stream import UserCredentials

security = HTTPBearer(auto_error=False)

# Google's token info endpoint
GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


async def verify_google_token(token: str) -> UserCredentials | None:
    """
    Verify a Google OAuth token and extract user credentials.

    Args:
        token: Google OAuth access token

    Returns:
        UserCredentials if valid, None if invalid
    """
    # For development/testing, accept test tokens
    if token == "test-token":
        return UserCredentials(
            user_id="test-user-123",
            email="test@example.com",
            access_token=token,
        )

    try:
        async with httpx.AsyncClient() as client:
            # Verify the token and get user info
            response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0,
            )

            if response.status_code != 200:
                return None

            user_info = response.json()

            # Extract user ID and email
            user_id = user_info.get("sub")
            email = user_info.get("email")

            if not user_id:
                return None

            return UserCredentials(
                user_id=user_id,
                email=email or "",
                access_token=token,
            )

    except httpx.HTTPError:
        return None
    except Exception:
        return None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> UserCredentials:
    """
    Dependency to get the current authenticated user.

    Args:
        credentials: HTTP Bearer token credentials

    Returns:
        UserCredentials for the authenticated user

    Raises:
        HTTPException: If authentication fails
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await verify_google_token(credentials.credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
