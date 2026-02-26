"use client";

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/stores/player-store";
import { formatDuration } from "@/lib/utils/format-duration";
import { cn } from "@/lib/utils/cn";
import type { PlaybackRate } from "@/types/player";

const PLAYBACK_RATES: PlaybackRate[] = [0.5, 1, 1.25, 1.5, 2];

interface VideoControlsProps {
  className?: string;
}

/**
 * Video player controls component.
 * Includes play/pause, seek bar, volume, fullscreen, speed,
 * and time display. Supports keyboard shortcuts.
 */
export function VideoControls({ className }: VideoControlsProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    playbackRate,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setPlaybackRate,
  } = usePlayerStore();

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
        e.preventDefault();
        seek(Math.max(0, currentTime - 10));
        break;
      case "ArrowRight":
        e.preventDefault();
        seek(Math.min(duration, currentTime + 10));
        break;
      case "ArrowUp":
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.1));
        break;
      case "ArrowDown":
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.1));
        break;
      case "m":
      case "M":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
      case "F":
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-b-lg bg-black/90 px-3 py-2",
        className,
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="toolbar"
      aria-label="Video controls"
    >
      {/* Seek bar */}
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onChange={handleSeekChange}
        className="w-full cursor-pointer accent-primary"
        aria-label="Seek"
      />

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Volume */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 cursor-pointer accent-primary"
            aria-label="Volume"
          />
        </div>

        {/* Time display */}
        <div className="flex-1 text-center text-xs text-white">
          <span>{formatDuration(currentTime)}</span>
          <span className="mx-1 text-white/60">/</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Playback speed */}
        <Button
          variant="ghost"
          size="icon"
          onClick={cyclePlaybackRate}
          aria-label="Playback speed"
          className="h-8 w-8 text-xs text-white hover:bg-white/20"
        >
          {playbackRate}x
        </Button>

        {/* Fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="h-8 w-8 text-white hover:bg-white/20"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
