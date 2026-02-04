/**
 * Format a duration in seconds to a human-readable string.
 * Returns "mm:ss" for durations under an hour, "hh:mm:ss" otherwise.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }

  const totalSeconds = Math.floor(seconds)
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  const paddedSecs = secs.toString().padStart(2, '0')

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0')
    return `${hrs}:${paddedMins}:${paddedSecs}`
  }

  return `${mins}:${paddedSecs}`
}

/**
 * Format a file size in bytes to a human-readable string.
 * Uses binary-style labels: B, KB, MB, GB, TB.
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B'
  }

  if (bytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const index = Math.min(i, units.length - 1)
  const value = bytes / Math.pow(k, index)

  // Show decimals only for values >= KB
  if (index === 0) {
    return `${Math.round(value)} B`
  }

  return `${value.toFixed(1)} ${units[index]}`
}
