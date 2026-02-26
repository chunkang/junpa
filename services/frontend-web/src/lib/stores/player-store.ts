import { create } from "zustand";
import type { PlaybackRate, PlayerStore } from "@/types/player";

const INITIAL_STATE = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  playbackRate: 1 as PlaybackRate,
  error: null as string | null,
};

/**
 * Zustand store for video player state management.
 * Provides state and actions for controlling video playback.
 */
export const usePlayerStore = create<PlayerStore>((set) => ({
  ...INITIAL_STATE,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  seek: (time: number) =>
    set({ currentTime: Math.max(0, time) }),

  setVolume: (volume: number) =>
    set({ volume: Math.min(1, Math.max(0, volume)) }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen })),

  setPlaybackRate: (rate: PlaybackRate) => set({ playbackRate: rate }),

  setDuration: (duration: number) => set({ duration }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setError: (error: string | null) => set({ error }),

  reset: () => set(INITIAL_STATE),
}));
