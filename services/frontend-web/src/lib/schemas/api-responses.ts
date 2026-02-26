import { z } from "zod";

/**
 * Zod schema for the Streamer API VideoStreamResponse.
 * Matches the Python Pydantic model with snake_case fields.
 */
export const VideoStreamResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().default(null),
  duration: z.number(),
  format: z.string(),
  stream_url: z.string(),
  thumbnail_url: z.string().nullable().default(null),
});

export type VideoStreamResponse = z.infer<typeof VideoStreamResponseSchema>;

/**
 * Zod schema for the Streamer API LivePlaylistResponse.
 * Matches the Python Pydantic model with snake_case fields.
 */
export const LivePlaylistResponseSchema = z.object({
  playlist_id: z.string(),
  title: z.string(),
  status: z.enum(["coming_soon", "live", "ended"]),
  countdown_seconds: z.number().nullable().default(null),
  current_video: VideoStreamResponseSchema.nullable().default(null),
  seek_position: z.number().nullable().default(null),
  time_until_next: z.number().nullable().default(null),
  total_videos: z.number().default(0),
  current_index: z.number().nullable().default(null),
  is_looping: z.boolean().default(false),
});

export type LivePlaylistResponse = z.infer<typeof LivePlaylistResponseSchema>;

/**
 * Zod schema for the Streamer API Reactions model.
 */
export const ReactionsSchema = z.object({
  likes: z.number().default(0),
  views: z.number().default(0),
});

export type Reactions = z.infer<typeof ReactionsSchema>;
