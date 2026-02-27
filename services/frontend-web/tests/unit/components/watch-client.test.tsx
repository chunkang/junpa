import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WatchClient } from "@/app/watch/[videoId]/watch-client";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

vi.mock("hls.js", () => {
  const HlsMock = vi.fn().mockImplementation(() => ({
    loadSource: vi.fn(),
    attachMedia: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }));
  return {
    default: Object.assign(HlsMock, {
      isSupported: vi.fn().mockReturnValue(true),
      Events: {
        MANIFEST_PARSED: "hlsManifestParsed",
        ERROR: "hlsError",
      },
      ErrorTypes: {
        NETWORK_ERROR: "networkError",
        MEDIA_ERROR: "mediaError",
      },
    }),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Mock the useVideoPlayer hook so we can control retry behavior in tests
vi.mock("@/lib/hooks/use-video-player", () => ({
  useVideoPlayer: vi.fn(),
}));

import { useVideoPlayer } from "@/lib/hooks/use-video-player";
import { StreamerApiError } from "@/lib/api/client";

const mockUseVideoPlayer = vi.mocked(useVideoPlayer);

describe("WatchClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading skeleton initially", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render video player after loading", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: {
        id: "video-001",
        title: "Test Video",
        description: "A test video",
        duration: 120,
        format: "mp4",
        stream_url: "https://example.com/stream",
        thumbnail_url: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByTestId("video-player")).toBeInTheDocument();
  });

  it("should show video title after loading", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: {
        id: "video-001",
        title: "Test Video",
        description: "A test video",
        duration: 120,
        format: "mp4",
        stream_url: "https://example.com/stream",
        thumbnail_url: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(
      screen.getByRole("heading", { name: "Test Video" }),
    ).toBeInTheDocument();
  });

  it("should show video description", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: {
        id: "video-001",
        title: "Test Video",
        description: "A detailed description",
        duration: 120,
        format: "mp4",
        stream_url: "https://example.com/stream",
        thumbnail_url: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("A detailed description")).toBeInTheDocument();
  });

  it("should show 'Video not found' on 404 error", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new StreamerApiError(404, "Not found"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="not-found" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Video not found")).toBeInTheDocument();
  });

  it("should show playback error on server error", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new StreamerApiError(500, "Internal error"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="server-error" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Playback error: unable to load video"),
    ).toBeInTheDocument();
  });

  it("should show 'Unable to load video' on generic error", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network failure"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Unable to load video")).toBeInTheDocument();
  });

  it("should show retry button on error", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new StreamerApiError(404, "Not found"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    render(<WatchClient videoId="not-found" />, {
      wrapper: createWrapper(),
    });
    expect(
      screen.getByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
  });

  it("should return null when no data and not loading or error", () => {
    mockUseVideoPlayer.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useVideoPlayer>);

    const { container } = render(<WatchClient videoId="video-001" />, {
      wrapper: createWrapper(),
    });
    expect(container.innerHTML).toBe("");
  });
});
