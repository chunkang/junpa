"""Application configuration using Pydantic settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="JUNPA_",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Junpa Streamer"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""

    # Security
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    stream_url_expiry_seconds: int = 86400  # 24 hours

    # HLS Settings
    hls_segment_duration: int = 6  # seconds
    hls_playlist_size: int = 5  # segments in live playlist

    # Caching
    library_cache_ttl: int = 60  # seconds
    segment_cache_ttl: int = 300  # seconds

    # Logging
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
