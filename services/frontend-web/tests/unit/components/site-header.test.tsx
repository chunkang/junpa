import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("should render the site logo/name", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Junpa")).toBeInTheDocument();
  });

  it("should contain a link to the home page", () => {
    render(<SiteHeader />);
    const homeLink = screen.getByRole("link", { name: /junpa/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should have a navigation element", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should be accessible with proper landmark", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
