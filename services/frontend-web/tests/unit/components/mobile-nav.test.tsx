import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileNav } from "@/components/layout/mobile-nav";

describe("MobileNav", () => {
  it("should render the menu trigger button", () => {
    render(<MobileNav />);
    expect(
      screen.getByRole("button", { name: /toggle menu/i }),
    ).toBeInTheDocument();
  });

  it("should show navigation links when opened", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const trigger = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(trigger);

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should have accessible label on the menu button", () => {
    render(<MobileNav />);
    const trigger = screen.getByRole("button", { name: /toggle menu/i });
    expect(trigger).toHaveAttribute("aria-label");
  });
});
