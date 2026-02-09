import { Library, librarySchema, emptyLibrary } from "./schemas/library";

const JUNPA_FOLDER = ".junpa";
const LIBRARY_FILE = "library.json";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  videoMediaMetadata?: {
    durationMillis?: string;
    width?: number;
    height?: number;
  };
}

export class SessionExpiredError extends Error {
  constructor(message: string = "Session has expired. Please sign in again.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

export class GoogleDriveClient {
  private accessToken: string;
  private junpaFolderId: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch(
    url: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401 && !isRetry) {
      // Attempt to get a fresh session token
      try {
        const sessionResponse = await fetch("/api/auth/session");
        const sessionData = await sessionResponse.json();
        if (sessionData?.accessToken) {
          this.accessToken = sessionData.accessToken;
          return this.fetch(url, options, true);
        }
      } catch {
        // Fall through to throw SessionExpiredError
      }
      throw new SessionExpiredError();
    }

    if (response.status === 401 && isRetry) {
      throw new SessionExpiredError();
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API error: ${response.status} - ${error}`);
    }

    return response;
  }

  /**
   * Find or create the .junpa folder in the user's Drive root
   */
  async getOrCreateJunpaFolder(): Promise<string> {
    if (this.junpaFolderId) {
      return this.junpaFolderId;
    }

    // Search for existing folder
    const query = `name='${JUNPA_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive`;

    const searchResponse = await this.fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      const folderId = searchData.files[0].id;
      this.junpaFolderId = folderId;
      return folderId;
    }

    // Create the folder
    const createResponse = await this.fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: JUNPA_FOLDER,
        mimeType: "application/vnd.google-apps.folder",
      }),
    });

    const folder = await createResponse.json();
    const folderId = folder.id as string;
    this.junpaFolderId = folderId;
    return folderId;
  }

  /**
   * Get or create the library.json file
   */
  async getLibrary(): Promise<Library> {
    const folderId = await this.getOrCreateJunpaFolder();

    // Search for library.json
    const query = `name='${LIBRARY_FILE}' and '${folderId}' in parents and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;

    const searchResponse = await this.fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.files && searchData.files.length > 0) {
      // Read existing library
      const fileId = searchData.files[0].id;
      const contentResponse = await this.fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      );
      const content = await contentResponse.json();
      return librarySchema.parse(content);
    }

    // Create new library file
    await this.saveLibrary(emptyLibrary);
    return emptyLibrary;
  }

  /**
   * Save the library.json file
   */
  async saveLibrary(library: Library): Promise<void> {
    const folderId = await this.getOrCreateJunpaFolder();

    // Search for existing library.json
    const query = `name='${LIBRARY_FILE}' and '${folderId}' in parents and trashed=false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;

    const searchResponse = await this.fetch(searchUrl);
    const searchData = await searchResponse.json();

    const metadata = {
      name: LIBRARY_FILE,
      mimeType: "application/json",
      parents: [folderId],
    };

    const content = JSON.stringify(library, null, 2);
    const boundary = "-------junpa_boundary";
    const body = [
      `--${boundary}`,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      `--${boundary}`,
      "Content-Type: application/json",
      "",
      content,
      `--${boundary}--`,
    ].join("\r\n");

    if (searchData.files && searchData.files.length > 0) {
      // Update existing file
      const fileId = searchData.files[0].id;
      await this.fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: content,
        }
      );
    } else {
      // Create new file
      await this.fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
    }
  }

  /**
   * List video files from Google Drive
   */
  async listVideos(): Promise<DriveFile[]> {
    const query = "mimeType contains 'video/' and trashed=false";
    const fields = "files(id,name,mimeType,size,videoMediaMetadata)";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100`;

    const response = await this.fetch(url);
    const data = await response.json();

    return data.files || [];
  }

  /**
   * Get video file metadata
   */
  async getVideoMetadata(fileId: string): Promise<DriveFile> {
    const fields = "id,name,mimeType,size,videoMediaMetadata";
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=${encodeURIComponent(fields)}`;

    const response = await this.fetch(url);
    return response.json();
  }

  /**
   * Upload a video file to Google Drive
   */
  async uploadVideo(
    file: File,
    _onProgress?: (progress: number) => void
  ): Promise<DriveFile> {
    // Get upload URI using resumable upload
    const initResponse = await this.fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Upload-Content-Type": file.type,
          "X-Upload-Content-Length": String(file.size),
        },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type,
        }),
      }
    );

    const uploadUri = initResponse.headers.get("Location");
    if (!uploadUri) {
      throw new Error("Failed to get upload URI");
    }

    // Upload the file content
    const uploadResponse = await fetch(uploadUri, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        "Content-Length": String(file.size),
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    // Get the uploaded file metadata with video info
    const uploadedFile = await uploadResponse.json();
    return this.getVideoMetadata(uploadedFile.id);
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
    });
  }
}
