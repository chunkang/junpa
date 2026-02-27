import { describe, it, expect } from "vitest";
import {
  VideoStreamResponseSchema,
  LivePlaylistResponseSchema,
} from "@/lib/schemas/api-responses";
import {
  createVideoStreamResponse,
  createLivePlaylistResponse,
} from "../../../tests/mocks/fixtures";

describe("VideoStreamResponseSchema", () => {
  it("should validate a valid video stream response", () => {
    const data = createVideoStreamResponse();
    const result = VideoStreamResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject missing required fields", () => {
    const result = VideoStreamResponseSchema.safeParse({
      id: "video-001",
      // missing title, duration, format, stream_url
    });
    expect(result.success).toBe(false);
  });

  it("should allow null description and thumbnail_url", () => {
    const data = createVideoStreamResponse({
      description: null,
      thumbnail_url: null,
    });
    const result = VideoStreamResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.thumbnail_url).toBeNull();
    }
  });

  it("should reject invalid duration type", () => {
    const data = createVideoStreamResponse();
    const result = VideoStreamResponseSchema.safeParse({
      ...data,
      duration: "not-a-number",
    });
    expect(result.success).toBe(false);
  });
});

describe("LivePlaylistResponseSchema", () => {
  it("should validate a valid live playlist response", () => {
    const data = createLivePlaylistResponse();
    const result = LivePlaylistResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should validate status enum values", () => {
    for (const status of ["coming_soon", "live", "ended"] as const) {
      const data = createLivePlaylistResponse({ status });
      const result = LivePlaylistResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid status value", () => {
    const data = createLivePlaylistResponse();
    const result = LivePlaylistResponseSchema.safeParse({
      ...data,
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("should allow null optional fields", () => {
    const data = createLivePlaylistResponse({
      countdown_seconds: null,
      current_video: null,
      seek_position: null,
      time_until_next: null,
      current_index: null,
    });
    const result = LivePlaylistResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should default total_videos to 0 and is_looping to false", () => {
    const data = createLivePlaylistResponse();
    const { total_videos: _tv, is_looping: _il, ...rest } = data;
    const withoutDefaults = { ...rest, total_videos: 0, is_looping: false };
    const result = LivePlaylistResponseSchema.safeParse(withoutDefaults);
    expect(result.success).toBe(true);
  });
});
