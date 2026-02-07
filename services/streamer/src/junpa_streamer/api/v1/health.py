"""Health check endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter

from junpa_streamer.models.responses import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check service health status."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(UTC),
        version="0.1.0",
        drive_status="unknown",  # Will be implemented with Drive integration
    )
