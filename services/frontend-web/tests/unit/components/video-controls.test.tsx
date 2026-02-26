import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoControls } from "@/components/video/video-controls";
import { usePlayerStore } from "@/lib/stores/player-store";

describe("VideoControls", () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
  });

  it("should render play button when paused", () => {
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Play" }),
    ).toBeInTheDocument();
  });

  it("should render pause button when playing", () => {
    usePlayerStore.getState().play();
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Pause" }),
    ).toBeInTheDocument();
  });

  it("should toggle play on button click", async () => {
    const user = userEvent.setup();
    render(<VideoControls />);

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it("should render volume control", () => {
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Mute" }),
    ).toBeInTheDocument();
  });

  it("should toggle mute on volume button click", async () => {
    const user = userEvent.setup();
    render(<VideoControls />);

    await user.click(screen.getByRole("button", { name: "Mute" }));
    expect(usePlayerStore.getState().isMuted).toBe(true);
  });

  it("should show unmute label when muted", () => {
    usePlayerStore.getState().toggleMute();
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Unmute" }),
    ).toBeInTheDocument();
  });

  it("should render fullscreen button", () => {
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Fullscreen" }),
    ).toBeInTheDocument();
  });

  it("should toggle fullscreen on button click", async () => {
    const user = userEvent.setup();
    render(<VideoControls />);

    await user.click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(usePlayerStore.getState().isFullscreen).toBe(true);
  });

  it("should show exit fullscreen label when in fullscreen", () => {
    usePlayerStore.getState().toggleFullscreen();
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Exit fullscreen" }),
    ).toBeInTheDocument();
  });

  it("should render time display", () => {
    usePlayerStore.getState().setCurrentTime(65);
    usePlayerStore.getState().setDuration(300);
    render(<VideoControls />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
    expect(screen.getByText("5:00")).toBeInTheDocument();
  });

  it("should render playback speed button", () => {
    render(<VideoControls />);
    expect(
      screen.getByRole("button", { name: "Playback speed" }),
    ).toBeInTheDocument();
  });

  it("should cycle playback speed on click", async () => {
    const user = userEvent.setup();
    render(<VideoControls />);

    // Default is 1x, click should go to 1.25x
    await user.click(screen.getByRole("button", { name: "Playback speed" }));
    expect(usePlayerStore.getState().playbackRate).toBe(1.25);
  });

  it("should change seek value on slider change", () => {
    usePlayerStore.getState().setDuration(100);
    render(<VideoControls />);

    const seekSlider = screen.getByRole("slider", { name: "Seek" });
    fireEvent.change(seekSlider, { target: { value: "50" } });
    expect(usePlayerStore.getState().currentTime).toBe(50);
  });

  it("should change volume value on slider change", () => {
    render(<VideoControls />);

    const volumeSlider = screen.getByRole("slider", { name: "Volume" });
    fireEvent.change(volumeSlider, { target: { value: "0.5" } });
    expect(usePlayerStore.getState().volume).toBe(0.5);
  });

  describe("keyboard shortcuts", () => {
    it("should toggle play on Space key", () => {
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: " " });
      expect(usePlayerStore.getState().isPlaying).toBe(true);

      fireEvent.keyDown(toolbar, { key: " " });
      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });

    it("should seek backward on ArrowLeft", () => {
      usePlayerStore.getState().setCurrentTime(30);
      usePlayerStore.getState().setDuration(100);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
      expect(usePlayerStore.getState().currentTime).toBe(20);
    });

    it("should seek forward on ArrowRight", () => {
      usePlayerStore.getState().setCurrentTime(30);
      usePlayerStore.getState().setDuration(100);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowRight" });
      expect(usePlayerStore.getState().currentTime).toBe(40);
    });

    it("should not seek beyond 0 on ArrowLeft", () => {
      usePlayerStore.getState().setCurrentTime(5);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowLeft" });
      expect(usePlayerStore.getState().currentTime).toBe(0);
    });

    it("should not seek beyond duration on ArrowRight", () => {
      usePlayerStore.getState().setCurrentTime(95);
      usePlayerStore.getState().setDuration(100);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowRight" });
      expect(usePlayerStore.getState().currentTime).toBe(100);
    });

    it("should increase volume on ArrowUp", () => {
      usePlayerStore.getState().setVolume(0.5);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowUp" });
      expect(usePlayerStore.getState().volume).toBeCloseTo(0.6, 1);
    });

    it("should decrease volume on ArrowDown", () => {
      usePlayerStore.getState().setVolume(0.5);
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "ArrowDown" });
      expect(usePlayerStore.getState().volume).toBeCloseTo(0.4, 1);
    });

    it("should toggle mute on M key", () => {
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "m" });
      expect(usePlayerStore.getState().isMuted).toBe(true);
    });

    it("should toggle fullscreen on F key", () => {
      render(<VideoControls />);
      const toolbar = screen.getByRole("toolbar");

      fireEvent.keyDown(toolbar, { key: "f" });
      expect(usePlayerStore.getState().isFullscreen).toBe(true);
    });
  });
});
