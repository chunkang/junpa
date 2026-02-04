import type { PlaylistItem, Video } from '@/lib/schemas'

/**
 * Parse an ISO 8601 duration string (e.g. "PT1M30S") to seconds.
 * Supports hours (H), minutes (M), and seconds (S) components.
 * Returns 0 for invalid or empty input.
 */
export function parseISO8601Duration(duration: string): number {
  if (!duration || typeof duration !== 'string') {
    return 0
  }

  const match = duration.match(
    /^PT(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?$/
  )

  if (!match) {
    return 0
  }

  const hours = parseFloat(match[1] || '0')
  const minutes = parseFloat(match[2] || '0')
  const seconds = parseFloat(match[3] || '0')

  return Math.floor(hours * 3600 + minutes * 60 + seconds)
}

/**
 * Format seconds to an ISO 8601 duration string (e.g. "PT1M30S").
 * Returns "PT0S" for zero or negative values.
 */
export function formatISO8601Duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'PT0S'
  }

  const totalSeconds = Math.floor(seconds)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  let result = 'PT'
  if (h > 0) result += `${h}H`
  if (m > 0) result += `${m}M`
  if (s > 0 || result === 'PT') result += `${s}S`

  return result
}

/**
 * Calculate total playlist duration by summing up video durations.
 * Only includes videos that exist in the provided videos array.
 */
export function calculatePlaylistDuration(
  items: PlaylistItem[],
  videos: Video[]
): number {
  const videoMap = new Map(videos.map((v) => [v.id, v]))

  return items.reduce((total, item) => {
    const video = videoMap.get(item.videoId)
    if (video) {
      return total + video.duration
    }
    return total
  }, 0)
}
