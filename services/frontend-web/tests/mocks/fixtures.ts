/**
 * Mock data factories for Streamer API responses.
 * Fields use snake_case to match the Python/Pydantic models.
 */

export function createVideoStreamResponse(
  overrides: Partial<{
    id: string;
    title: string;
    description: string | null;
    duration: number;
    format: string;
    stream_url: string;
    thumbnail_url: string | null;
  }> = {},
) {
  return {
    id: "video-001",
    title: "Test Video",
    description: "A test video description",
    duration: 3661.5,
    format: "mp4",
    stream_url: "https://drive.google.com/stream/test-video-001",
    thumbnail_url: "https://drive.google.com/thumbnail/test-video-001",
    ...overrides,
  };
}

export function createLivePlaylistResponse(
  overrides: Partial<{
    playlist_id: string;
    title: string;
    status: "coming_soon" | "live" | "ended";
    countdown_seconds: number | null;
    current_video: ReturnType<typeof createVideoStreamResponse> | null;
    seek_position: number | null;
    time_until_next: number | null;
    total_videos: number;
    current_index: number | null;
    is_looping: boolean;
  }> = {},
) {
  return {
    playlist_id: "playlist-001",
    title: "Test Playlist",
    status: "live" as const,
    countdown_seconds: null,
    current_video: createVideoStreamResponse(),
    seek_position: 120.5,
    time_until_next: 3541.0,
    total_videos: 5,
    current_index: 0,
    is_looping: false,
    ...overrides,
  };
}
