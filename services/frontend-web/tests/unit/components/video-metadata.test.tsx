import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoMetadata } from "@/components/video/video-metadata";

describe("VideoMetadata", () => {
  it("should render the video title", () => {
    render(
      <VideoMetadata
        title="Test Video"
        description="A description"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Test Video" }),
    ).toBeInTheDocument();
  });

  it("should render the description", () => {
    render(
      <VideoMetadata
        title="Test Video"
        description="A description"
      />,
    );
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("should handle null description gracefully", () => {
    render(<VideoMetadata title="Test Video" description={null} />);
    expect(
      screen.getByRole("heading", { name: "Test Video" }),
    ).toBeInTheDocument();
  });
});
