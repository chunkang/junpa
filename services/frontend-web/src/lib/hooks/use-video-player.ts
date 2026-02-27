"use client";

import { useQuery } from "@tanstack/react-query";
import { getVideo } from "@/lib/api/client";
import type { VideoStreamResponse } from "@/lib/schemas/api-responses";

/**
 * Custom hook for fetching video data with TanStack Query.
 * Provides loading, error, and retry states.
 */
export function useVideoPlayer(videoId: string) {
  return useQuery<VideoStreamResponse>({
    queryKey: ["video", videoId],
    queryFn: () => getVideo(videoId),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
