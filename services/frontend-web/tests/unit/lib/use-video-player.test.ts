import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Do NOT mock useVideoPlayer here -- test the real implementation
// But DO mock the getVideo function
vi.mock("@/lib/api/client", () => ({
  getVideo: vi.fn(),
  StreamerApiError: class StreamerApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { useVideoPlayer } from "@/lib/hooks/use-video-player";
import { getVideo } from "@/lib/api/client";

const mockGetVideo = vi.mocked(getVideo);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useVideoPlayer", () => {
  beforeEach(() => {
    mockGetVideo.mockClear();
  });

  it("should fetch video data successfully", async () => {
    const mockVideo = {
      id: "video-001",
      title: "Test Video",
      description: "desc",
      duration: 120,
      format: "mp4",
      stream_url: "https://example.com/stream",
      thumbnail_url: null,
    };
    mockGetVideo.mockResolvedValue(mockVideo);

    const { result } = renderHook(() => useVideoPlayer("video-001"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockVideo);
    expect(mockGetVideo).toHaveBeenCalledWith("video-001");
  });

  it("should handle fetch error after retries", async () => {
    mockGetVideo.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useVideoPlayer("bad-id"), {
      wrapper: createWrapper(),
    });

    // The hook has retry: 2, so it will retry before entering error state.
    // With mocked instant rejections, this completes within a few seconds.
    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 },
    );

    expect(result.current.error).toBeInstanceOf(Error);
    // Should have been called 3 times (1 initial + 2 retries)
    expect(mockGetVideo).toHaveBeenCalledTimes(3);
  });
});
