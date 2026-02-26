/**
 * Format a duration in seconds to a human-readable string.
 * Returns "MM:SS" for durations under an hour, "HH:MM:SS" otherwise.
 *
 * @param seconds - Duration in seconds (fractional values are floored)
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedSecs = secs.toString().padStart(2, "0");

  if (hours > 0) {
    const paddedMins = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMins}:${paddedSecs}`;
  }

  return `${minutes}:${paddedSecs}`;
}
