import { describe, it, expect } from "vitest";
import { formatCount } from "@/lib/utils/format-count";

describe("formatCount", () => {
  it("should return numbers under 1000 as-is", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("should format thousands with K suffix", () => {
    expect(formatCount(1000)).toBe("1K");
    expect(formatCount(1234)).toBe("1.2K");
    expect(formatCount(9999)).toBe("10K");
  });

  it("should format millions with M suffix", () => {
    expect(formatCount(1000000)).toBe("1M");
    expect(formatCount(1234567)).toBe("1.2M");
    expect(formatCount(9999999)).toBe("10M");
  });

  it("should format billions with B suffix", () => {
    expect(formatCount(1000000000)).toBe("1B");
    expect(formatCount(1500000000)).toBe("1.5B");
  });

  it("should not show decimal when it would be zero", () => {
    expect(formatCount(2000)).toBe("2K");
    expect(formatCount(5000000)).toBe("5M");
  });

  it("should handle negative values", () => {
    expect(formatCount(-1)).toBe("0");
  });
});
