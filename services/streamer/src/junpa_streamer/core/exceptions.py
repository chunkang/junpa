"""Custom exceptions for the streamer service."""


class StreamerError(Exception):
    """Base exception for streamer errors."""

    pass


class VideoNotFoundError(StreamerError):
    """Raised when a video is not found."""

    def __init__(self, video_id: str) -> None:
        self.video_id = video_id
        super().__init__(f"Video not found: {video_id}")


class PlaylistNotFoundError(StreamerError):
    """Raised when a playlist is not found."""

    def __init__(self, playlist_id: str) -> None:
        self.playlist_id = playlist_id
        super().__init__(f"Playlist not found: {playlist_id}")


class DriveAccessError(StreamerError):
    """Raised when Google Drive access fails."""

    def __init__(self, message: str, original_error: Exception | None = None) -> None:
        self.original_error = original_error
        super().__init__(message)


class UnsupportedFormatError(StreamerError):
    """Raised when a video format is not supported."""

    def __init__(self, video_format: str) -> None:
        self.format = video_format
        super().__init__(f"Unsupported video format: {video_format}")
