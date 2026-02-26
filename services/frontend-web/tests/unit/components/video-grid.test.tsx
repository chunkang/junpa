import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoGrid } from "@/components/video/video-grid";

const mockVideos = [
  {
    id: "video-001",
    title: "Video One",
    duration: 120,
    thumbnailUrl: "https://example.com/thumb1.jpg",
    description: "First video",
  },
  {
    id: "video-002",
    title: "Video Two",
    duration: 300,
    thumbnailUrl: "https://example.com/thumb2.jpg",
    description: "Second video",
  },
  {
    id: "video-003",
    title: "Video Three",
    duration: 600,
    thumbnailUrl: null,
    description: null,
  },
];

describe("VideoGrid", () => {
  it("should render all video cards", () => {
    render(<VideoGrid videos={mockVideos} />);
    expect(screen.getByText("Video One")).toBeInTheDocument();
    expect(screen.getByText("Video Two")).toBeInTheDocument();
    expect(screen.getByText("Video Three")).toBeInTheDocument();
  });

  it("should render the correct number of cards", () => {
    render(<VideoGrid videos={mockVideos} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("should render empty state when no videos", () => {
    render(<VideoGrid videos={[]} />);
    expect(screen.getByText(/no videos/i)).toBeInTheDocument();
  });

  it("should have a grid container with proper role", () => {
    render(<VideoGrid videos={mockVideos} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
