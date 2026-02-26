import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorFallback } from "@/components/shared/error-fallback";

describe("ErrorFallback", () => {
  it("should render the error message", () => {
    render(<ErrorFallback message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("should render a retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ErrorFallback message="Error" onRetry={onRetry} />);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should call onRetry when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorFallback message="Error" onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should not render retry button when onRetry is not provided", () => {
    render(<ErrorFallback message="Error" />);
    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
  });

  it("should have an alert role for accessibility", () => {
    render(<ErrorFallback message="Error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
