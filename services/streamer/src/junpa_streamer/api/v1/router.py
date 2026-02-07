"""API v1 router aggregation."""

from fastapi import APIRouter

from junpa_streamer.api.v1 import auth, health, live, share, stream

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(stream.router, prefix="/stream", tags=["stream"])
api_router.include_router(live.router, prefix="/live", tags=["live"])
api_router.include_router(share.router, prefix="/s", tags=["share"])
