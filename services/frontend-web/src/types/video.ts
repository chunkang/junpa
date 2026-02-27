/**
 * Frontend video types derived from the Streamer API schemas.
 * These use camelCase for frontend consumption while the API schemas
 * use snake_case to match the Python backend.
 */

export interface Video {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  format: string;
  streamUrl: string;
  thumbnailUrl: string | null;
}

export interface LivePlaylist {
  playlistId: string;
  title: string;
  status: "coming_soon" | "live" | "ended";
  countdownSeconds: number | null;
  currentVideo: Video | null;
  seekPosition: number | null;
  timeUntilNext: number | null;
  totalVideos: number;
  currentIndex: number | null;
  isLooping: boolean;
}

export interface Reactions {
  likes: number;
  views: number;
}
