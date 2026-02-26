"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils/cn";

interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

/**
 * Video player component with HLS.js integration.
 * Supports both native HLS (Safari) and HLS.js fallback.
 * Dynamically imports HLS.js to minimize bundle size.
 */
export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);

  const {
    isPlaying,
    volume,
    isMuted,
    playbackRate,
    setDuration,
    setCurrentTime,
    setError,
    pause,
  } = usePlayerStore();

  const initHls = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsSource =
      src.endsWith(".m3u8") || src.includes("m3u8");

    if (isHlsSource) {
      // Dynamic import to reduce bundle size
      const { default: Hls } = await import("hls.js");

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event: string, data: { fatal: boolean; type: string }) => {
          if (data.fatal) {
            setError("Playback error: stream failed to load");
          }
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = src;
      } else {
        setError("HLS playback is not supported in this browser");
      }
    } else {
      // Direct video source (mp4, webm)
      video.src = src;
    }
  }, [src, setError]);

  // Initialize HLS on mount/src change
  useEffect(() => {
    initHls();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initHls]);

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {
        pause();
      });
    } else {
      video.pause();
    }
  }, [isPlaying, pause]);

  // Sync volume and mute
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handleEnded = () => {
    pause();
  };

  return (
    <div
      data-testid="video-player-container"
      className={cn("relative aspect-video w-full bg-black", className)}
    >
      <video
        ref={videoRef}
        data-testid="video-player"
        aria-label={title || "Video player"}
        className="h-full w-full"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  );
}
