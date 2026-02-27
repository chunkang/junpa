"use client";

import { useVideoPlayer } from "@/lib/hooks/use-video-player";
import { VideoPlayer } from "@/components/video/video-player";
import { VideoControls } from "@/components/video/video-controls";
import { VideoMetadata } from "@/components/video/video-metadata";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { StreamerApiError } from "@/lib/api/client";

interface WatchClientProps {
  videoId: string;
}

/**
 * Client component for the video watch page.
 * Uses TanStack Query for data fetching with loading and error states.
 */
export function WatchClient({ videoId }: WatchClientProps) {
  const { data: video, isLoading, error, refetch } = useVideoPlayer(videoId);

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <LoadingSkeleton count={1} />
      </div>
    );
  }

  if (error) {
    let message = "Unable to load video";
    if (error instanceof StreamerApiError) {
      if (error.status === 404) {
        message = "Video not found";
      } else {
        message = "Playback error: unable to load video";
      }
    }

    return (
      <div className="container max-w-5xl py-6">
        <ErrorFallback message={message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="overflow-hidden rounded-lg">
        <VideoPlayer
          src={video.stream_url}
          title={video.title}
        />
        <VideoControls />
      </div>
      <div className="mt-4">
        <VideoMetadata
          title={video.title}
          description={video.description}
        />
      </div>
    </div>
  );
}
