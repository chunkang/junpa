import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoCard } from "@/components/video/video-card";

const defaultProps = {
  id: "video-001",
  title: "Test Video",
  duration: 3661,
  thumbnailUrl: "https://example.com/thumb.jpg",
  description: "A test description",
};

describe("VideoCard", () => {
  it("should render the video title", () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText("Test Video")).toBeInTheDocument();
  });

  it("should render the thumbnail image", () => {
    render(<VideoCard {...defaultProps} />);
    const img = screen.getByRole("img", { name: /test video/i });
    expect(img).toBeInTheDocument();
  });

  it("should render the formatted duration badge", () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText("1:01:01")).toBeInTheDocument();
  });

  it("should link to the watch page", () => {
    render(<VideoCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/watch/video-001");
  });

  it("should render a placeholder when no thumbnail is provided", () => {
    render(<VideoCard {...defaultProps} thumbnailUrl={null} />);
    expect(screen.getByLabelText(/video thumbnail/i)).toBeInTheDocument();
  });

  it("should have accessible alt text on the thumbnail", () => {
    render(<VideoCard {...defaultProps} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Test Video");
  });
});
