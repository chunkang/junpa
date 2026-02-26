import { describe, it, expect, beforeEach } from "vitest";
import { getVideo, StreamerApiError } from "@/lib/api/client";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:8000/api/v1";

describe("API Client", () => {
  describe("getVideo", () => {
    it("should fetch and validate a video response", async () => {
      const video = await getVideo("video-001");
      expect(video.id).toBe("video-001");
      expect(video.title).toBe("Test Video");
      expect(video.stream_url).toBeDefined();
    });

    it("should throw StreamerApiError on 404", async () => {
      await expect(getVideo("not-found")).rejects.toThrow(StreamerApiError);
      await expect(getVideo("not-found")).rejects.toThrow(/not found/i);
    });

    it("should throw StreamerApiError on 500", async () => {
      await expect(getVideo("server-error")).rejects.toThrow(StreamerApiError);
    });

    it("should throw on network error", async () => {
      server.use(
        http.get(`${BASE_URL}/stream/:videoId`, () => {
          return HttpResponse.error();
        }),
      );

      await expect(getVideo("video-001")).rejects.toThrow();
    });

    it("should throw on invalid response data", async () => {
      server.use(
        http.get(`${BASE_URL}/stream/:videoId`, () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(getVideo("video-001")).rejects.toThrow();
    });
  });

  describe("StreamerApiError", () => {
    it("should contain status code and message", () => {
      const error = new StreamerApiError(404, "Video not found");
      expect(error.status).toBe(404);
      expect(error.message).toBe("Video not found");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
