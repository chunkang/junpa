/**
 * Video player state and action types.
 */

export type PlaybackRate = 0.5 | 1 | 1.25 | 1.5 | 2;

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: PlaybackRate;
  error: string | null;
}

export interface PlayerActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;
