/**
 * Format a number to a compact human-readable string.
 * Examples: 1234 -> "1.2K", 1234567 -> "1.2M", 1500000000 -> "1.5B"
 *
 * @param count - The number to format
 * @returns Formatted count string
 */
export function formatCount(count: number): string {
  if (count < 0) {
    return "0";
  }

  const tiers = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const { threshold, suffix } of tiers) {
    if (count >= threshold) {
      const value = count / threshold;
      const rounded = Math.round(value * 10) / 10;
      // Remove trailing .0
      const formatted =
        rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
      return `${formatted}${suffix}`;
    }
  }

  return count.toString();
}
