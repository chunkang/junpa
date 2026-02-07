"""Google Drive API client for fetching library.json and generating stream URLs."""

from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from junpa_streamer.config import settings
from junpa_streamer.core.exceptions import DriveAccessError
from junpa_streamer.models.stream import UserCredentials


class GoogleDriveService:
    """Service for interacting with Google Drive API."""

    JUNPA_FOLDER_NAME = ".junpa"
    LIBRARY_FILE_NAME = "library.json"

    def __init__(self, user: UserCredentials) -> None:
        """Initialize with user credentials."""
        self.user = user
        self._service = None
        self._junpa_folder_id: str | None = None

    def _get_credentials(self) -> Credentials:
        """Build Google credentials from user's access token."""
        return Credentials(
            token=self.user.access_token,
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
        )

    def _get_service(self):
        """Get or create the Drive API service."""
        if self._service is None:
            credentials = self._get_credentials()
            self._service = build("drive", "v3", credentials=credentials)
        return self._service

    async def find_junpa_folder(self) -> str | None:
        """
        Find the .junpa folder in the user's Drive root.

        Returns:
            Folder ID if found, None otherwise
        """
        if self._junpa_folder_id:
            return self._junpa_folder_id

        try:
            service = self._get_service()
            results = (
                service.files()
                .list(
                    q=f"name='{self.JUNPA_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
                    fields="files(id, name)",
                    pageSize=1,
                )
                .execute()
            )
            files = results.get("files", [])
            if files:
                self._junpa_folder_id = files[0]["id"]
                return self._junpa_folder_id
            return None
        except Exception as e:
            raise DriveAccessError(f"Failed to find .junpa folder: {e}") from e

    async def get_library_json(self) -> dict[str, Any]:
        """
        Fetch and parse library.json from the .junpa folder.

        Returns:
            Parsed library.json contents

        Raises:
            DriveAccessError: If the file cannot be found or read
        """
        folder_id = await self.find_junpa_folder()
        if not folder_id:
            raise DriveAccessError(".junpa folder not found in Drive root")

        try:
            service = self._get_service()

            # Find library.json in the .junpa folder
            results = (
                service.files()
                .list(
                    q=f"name='{self.LIBRARY_FILE_NAME}' and '{folder_id}' in parents and trashed=false",
                    fields="files(id, name)",
                    pageSize=1,
                )
                .execute()
            )
            files = results.get("files", [])
            if not files:
                raise DriveAccessError("library.json not found in .junpa folder")

            file_id = files[0]["id"]

            # Download the file content
            content = service.files().get_media(fileId=file_id).execute()

            # Parse JSON
            import json

            return json.loads(content.decode("utf-8"))

        except DriveAccessError:
            raise
        except Exception as e:
            raise DriveAccessError(f"Failed to read library.json: {e}") from e

    async def get_file_metadata(self, file_id: str) -> dict[str, Any]:
        """
        Get metadata for a file by ID.

        Args:
            file_id: Google Drive file ID

        Returns:
            File metadata dictionary
        """
        try:
            service = self._get_service()
            return (
                service.files()
                .get(fileId=file_id, fields="id,name,mimeType,size,webContentLink")
                .execute()
            )
        except Exception as e:
            raise DriveAccessError(f"Failed to get file metadata: {e}") from e

    def get_stream_url(self, file_id: str) -> str:
        """
        Generate a streaming URL for a Google Drive file.

        For files shared with "Anyone with the link can view":
            https://drive.google.com/uc?id={file_id}&export=download

        For authenticated access, we can use webContentLink from file metadata
        or construct the URL with the access token.

        Args:
            file_id: Google Drive file ID

        Returns:
            Streaming URL
        """
        # Direct download URL format
        # This works for files that are:
        # 1. Owned by the user
        # 2. Shared with the user
        # 3. Public files
        return f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"

    def get_stream_url_with_token(self, file_id: str) -> str:
        """
        Generate a streaming URL with embedded access token.

        This allows the frontend to stream directly without additional auth.

        Args:
            file_id: Google Drive file ID

        Returns:
            Streaming URL with access token
        """
        base_url = f"https://www.googleapis.com/drive/v3/files/{file_id}"
        return f"{base_url}?alt=media&access_token={self.user.access_token}"


async def check_drive_connectivity(user: UserCredentials) -> bool:
    """
    Check if we can connect to Google Drive with the user's credentials.

    Args:
        user: User credentials

    Returns:
        True if connected, False otherwise
    """
    try:
        service = GoogleDriveService(user)
        # Try to list files (limited to 1) to verify connectivity
        svc = service._get_service()
        svc.files().list(pageSize=1, fields="files(id)").execute()
        return True
    except Exception:
        return False
