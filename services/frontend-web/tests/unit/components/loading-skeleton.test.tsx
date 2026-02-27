import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

describe("LoadingSkeleton", () => {
  it("should render skeleton cards", () => {
    render(<LoadingSkeleton count={3} />);
    const skeletons = screen.getAllByRole("status");
    expect(skeletons).toHaveLength(3);
  });

  it("should default to 1 skeleton when no count specified", () => {
    render(<LoadingSkeleton />);
    const skeletons = screen.getAllByRole("status");
    expect(skeletons).toHaveLength(1);
  });

  it("should have accessible loading label", () => {
    render(<LoadingSkeleton count={2} />);
    const skeletons = screen.getAllByRole("status");
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute("aria-label", "Loading");
    });
  });
});
