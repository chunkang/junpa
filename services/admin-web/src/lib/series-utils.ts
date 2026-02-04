import type { SeriesEpisode, Video } from '@/lib/schemas'

/**
 * Assign sequential episode numbers starting from 1.
 * Preserves videoId and title, only updates episodeNumber.
 */
export function renumberEpisodes(episodes: SeriesEpisode[]): SeriesEpisode[] {
  return episodes.map((ep, index) => ({
    ...ep,
    episodeNumber: index + 1,
  }))
}

/**
 * Sort episodes by their corresponding video's uploadedAt date (ascending, oldest first),
 * then renumber sequentially.
 */
export function sortEpisodesByUploadDate(
  episodes: SeriesEpisode[],
  videos: Video[]
): SeriesEpisode[] {
  const videoMap = new Map(videos.map((v) => [v.id, v]))

  const sorted = [...episodes].sort((a, b) => {
    const videoA = videoMap.get(a.videoId)
    const videoB = videoMap.get(b.videoId)
    const dateA = videoA ? new Date(videoA.uploadedAt).getTime() : 0
    const dateB = videoB ? new Date(videoB.uploadedAt).getTime() : 0
    return dateA - dateB
  })

  return renumberEpisodes(sorted)
}

/**
 * Calculate the total duration (in seconds) of all episodes in the series
 * by summing the durations of their corresponding videos.
 */
export function calculateSeriesTotalDuration(
  episodes: SeriesEpisode[],
  videos: Video[]
): number {
  const videoMap = new Map(videos.map((v) => [v.id, v]))

  return episodes.reduce((total, ep) => {
    const video = videoMap.get(ep.videoId)
    return total + (video?.duration ?? 0)
  }, 0)
}
