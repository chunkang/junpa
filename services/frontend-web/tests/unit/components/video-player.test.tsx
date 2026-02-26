import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoPlayer } from "@/components/video/video-player";

// Mock HLS.js
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

describe("VideoPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the video element", () => {
    render(<VideoPlayer src="https://example.com/video.mp4" />);
    const video = screen.getByTestId("video-player");
    expect(video).toBeInTheDocument();
    expect(video.tagName).toBe("VIDEO");
  });

  it("should have accessible label", () => {
    render(
      <VideoPlayer
        src="https://example.com/video.mp4"
        title="Test Video"
      />,
    );
    const video = screen.getByTestId("video-player");
    expect(video).toHaveAttribute("aria-label", "Test Video");
  });

  it("should render within a container", () => {
    render(<VideoPlayer src="https://example.com/video.mp4" />);
    const container = screen.getByTestId("video-player-container");
    expect(container).toBeInTheDocument();
  });
});
