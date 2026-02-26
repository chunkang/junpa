import { describe, it, expect, beforeEach } from "vitest";
import { usePlayerStore } from "@/lib/stores/player-store";

describe("playerStore", () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    usePlayerStore.getState().reset();
  });

  it("should have correct initial state", () => {
    const state = usePlayerStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTime).toBe(0);
    expect(state.duration).toBe(0);
    expect(state.volume).toBe(1);
    expect(state.isMuted).toBe(false);
    expect(state.isFullscreen).toBe(false);
    expect(state.playbackRate).toBe(1);
    expect(state.error).toBeNull();
  });

  it("should toggle play state", () => {
    const store = usePlayerStore.getState();
    store.play();
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    store.pause();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it("should toggle play with togglePlay", () => {
    const store = usePlayerStore.getState();
    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    store.togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });

  it("should seek to a specific time", () => {
    usePlayerStore.getState().seek(42.5);
    expect(usePlayerStore.getState().currentTime).toBe(42.5);
  });

  it("should clamp seek to non-negative values", () => {
    usePlayerStore.getState().seek(-10);
    expect(usePlayerStore.getState().currentTime).toBe(0);
  });

  it("should set volume between 0 and 1", () => {
    usePlayerStore.getState().setVolume(0.5);
    expect(usePlayerStore.getState().volume).toBe(0.5);
  });

  it("should clamp volume to valid range", () => {
    usePlayerStore.getState().setVolume(1.5);
    expect(usePlayerStore.getState().volume).toBe(1);

    usePlayerStore.getState().setVolume(-0.5);
    expect(usePlayerStore.getState().volume).toBe(0);
  });

  it("should toggle mute", () => {
    usePlayerStore.getState().toggleMute();
    expect(usePlayerStore.getState().isMuted).toBe(true);

    usePlayerStore.getState().toggleMute();
    expect(usePlayerStore.getState().isMuted).toBe(false);
  });

  it("should toggle fullscreen", () => {
    usePlayerStore.getState().toggleFullscreen();
    expect(usePlayerStore.getState().isFullscreen).toBe(true);

    usePlayerStore.getState().toggleFullscreen();
    expect(usePlayerStore.getState().isFullscreen).toBe(false);
  });

  it("should set playback rate", () => {
    usePlayerStore.getState().setPlaybackRate(1.5);
    expect(usePlayerStore.getState().playbackRate).toBe(1.5);
  });

  it("should set duration", () => {
    usePlayerStore.getState().setDuration(120);
    expect(usePlayerStore.getState().duration).toBe(120);
  });

  it("should set current time", () => {
    usePlayerStore.getState().setCurrentTime(30);
    expect(usePlayerStore.getState().currentTime).toBe(30);
  });

  it("should set and clear error", () => {
    usePlayerStore.getState().setError("Playback failed");
    expect(usePlayerStore.getState().error).toBe("Playback failed");

    usePlayerStore.getState().setError(null);
    expect(usePlayerStore.getState().error).toBeNull();
  });

  it("should reset to initial state", () => {
    const store = usePlayerStore.getState();
    store.play();
    store.seek(50);
    store.setVolume(0.7);
    store.toggleMute();
    store.setPlaybackRate(2);

    store.reset();
    const state = usePlayerStore.getState();
    expect(state.isPlaying).toBe(false);
    expect(state.currentTime).toBe(0);
    expect(state.volume).toBe(1);
    expect(state.isMuted).toBe(false);
    expect(state.playbackRate).toBe(1);
  });
});
