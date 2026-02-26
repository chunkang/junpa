import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/layout/site-footer";

describe("SiteFooter", () => {
  it("should render the footer", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("should display copyright text", () => {
    render(<SiteFooter />);
    expect(screen.getByText(/junpa/i)).toBeInTheDocument();
  });

  it("should be accessible with proper landmark", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
