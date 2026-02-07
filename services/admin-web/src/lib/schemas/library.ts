import { z } from "zod";

// Video schema matching the Streamer service models
export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number().positive(),
  format: z.string().default("video/mp4"),
  drive_file_id: z.string(),
  thumbnail_url: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Video = z.infer<typeof videoSchema>;

// Playlist item with optional custom duration
export const playlistItemSchema = z.object({
  video_id: z.string(),
  order: z.number().int().nonnegative(),
  custom_duration: z.number().positive().nullable().optional(),
});

export type PlaylistItem = z.infer<typeof playlistItemSchema>;

// Playlist schema
export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  items: z.array(playlistItemSchema),
  loop: z.boolean().default(false),
  start_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Playlist = z.infer<typeof playlistSchema>;

// The main library.json structure stored in Google Drive
export const librarySchema = z.object({
  version: z.literal("1.0"),
  videos: z.array(videoSchema),
  playlists: z.array(playlistSchema),
});

export type Library = z.infer<typeof librarySchema>;

// Empty library for initialization
export const emptyLibrary: Library = {
  version: "1.0",
  videos: [],
  playlists: [],
};
