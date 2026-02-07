"""FastAPI application entry point for Junpa Streamer."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from junpa_streamer.api.v1.router import api_router
from junpa_streamer.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="HTTP-based adaptive streaming service for Junpa",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    docs_url=f"{settings.api_v1_prefix}/docs",
    redoc_url=f"{settings.api_v1_prefix}/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"service": "junpa-streamer", "status": "running"}
