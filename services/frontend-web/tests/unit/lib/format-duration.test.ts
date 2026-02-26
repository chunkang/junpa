import { describe, it, expect } from "vitest";
import { formatDuration } from "@/lib/utils/format-duration";

describe("formatDuration", () => {
  it("should format seconds under a minute as MM:SS", () => {
    expect(formatDuration(45)).toBe("0:45");
  });

  it("should format exact minutes as MM:SS", () => {
    expect(formatDuration(120)).toBe("2:00");
  });

  it("should format minutes and seconds as MM:SS", () => {
    expect(formatDuration(185)).toBe("3:05");
  });

  it("should format hours as HH:MM:SS", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("should format large durations correctly", () => {
    expect(formatDuration(36000)).toBe("10:00:00");
  });

  it("should handle zero seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("should handle fractional seconds by flooring", () => {
    expect(formatDuration(61.9)).toBe("1:01");
  });

  it("should pad seconds with leading zero", () => {
    expect(formatDuration(9)).toBe("0:09");
  });

  it("should pad minutes with leading zero in HH:MM:SS format", () => {
    expect(formatDuration(3605)).toBe("1:00:05");
  });

  it("should handle negative values as zero", () => {
    expect(formatDuration(-10)).toBe("0:00");
  });
});
