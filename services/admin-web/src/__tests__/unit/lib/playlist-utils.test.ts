import { describe, it, expect } from 'vitest'
import {
  parseISO8601Duration,
  formatISO8601Duration,
  calculatePlaylistDuration,
} from '@/lib/playlist-utils'
import type { PlaylistItem, Video } from '@/lib/schemas'

function createMockVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: crypto.randomUUID(),
    title: 'Test Video',
    filename: 'test.mp4',
    duration: 120,
    fileSize: 1000000,
    format: 'mp4',
    tags: [],
    uploadedAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    source: 'local',
    ...overrides,
  }
}

describe('parseISO8601Duration', () => {
  it('should parse seconds only', () => {
    expect(parseISO8601Duration('PT30S')).toBe(30)
  })

  it('should parse minutes and seconds', () => {
    expect(parseISO8601Duration('PT1M30S')).toBe(90)
  })

  it('should parse hours, minutes, and seconds', () => {
    expect(parseISO8601Duration('PT1H30M15S')).toBe(5415)
  })

  it('should parse minutes only', () => {
    expect(parseISO8601Duration('PT5M')).toBe(300)
  })

  it('should parse hours only', () => {
    expect(parseISO8601Duration('PT2H')).toBe(7200)
  })

  it('should return 0 for empty string', () => {
    expect(parseISO8601Duration('')).toBe(0)
  })

  it('should return 0 for invalid format', () => {
    expect(parseISO8601Duration('invalid')).toBe(0)
  })

  it('should return 0 for PT0S', () => {
    expect(parseISO8601Duration('PT0S')).toBe(0)
  })
})

describe('formatISO8601Duration', () => {
  it('should format seconds only', () => {
    expect(formatISO8601Duration(30)).toBe('PT30S')
  })

  it('should format minutes and seconds', () => {
    expect(formatISO8601Duration(90)).toBe('PT1M30S')
  })

  it('should format hours, minutes, and seconds', () => {
    expect(formatISO8601Duration(5415)).toBe('PT1H30M15S')
  })

  it('should return PT0S for zero', () => {
    expect(formatISO8601Duration(0)).toBe('PT0S')
  })

  it('should return PT0S for negative values', () => {
    expect(formatISO8601Duration(-10)).toBe('PT0S')
  })

  it('should handle exact minute values', () => {
    expect(formatISO8601Duration(300)).toBe('PT5M')
  })

  it('should handle exact hour values', () => {
    expect(formatISO8601Duration(7200)).toBe('PT2H')
  })

  it('should return PT0S for NaN', () => {
    expect(formatISO8601Duration(NaN)).toBe('PT0S')
  })
})

describe('calculatePlaylistDuration', () => {
  it('should sum up video durations', () => {
    const video1 = createMockVideo({ id: 'v1', duration: 60 })
    const video2 = createMockVideo({ id: 'v2', duration: 90 })
    const items: PlaylistItem[] = [
      { videoId: 'v1', order: 0 },
      { videoId: 'v2', order: 1 },
    ]

    expect(calculatePlaylistDuration(items, [video1, video2])).toBe(150)
  })

  it('should return 0 for empty items', () => {
    expect(calculatePlaylistDuration([], [])).toBe(0)
  })

  it('should skip items with missing videos', () => {
    const video1 = createMockVideo({ id: 'v1', duration: 60 })
    const items: PlaylistItem[] = [
      { videoId: 'v1', order: 0 },
      { videoId: 'missing-id', order: 1 },
    ]

    expect(calculatePlaylistDuration(items, [video1])).toBe(60)
  })

  it('should handle a single video', () => {
    const video = createMockVideo({ id: 'v1', duration: 45 })
    const items: PlaylistItem[] = [{ videoId: 'v1', order: 0 }]

    expect(calculatePlaylistDuration(items, [video])).toBe(45)
  })
})
