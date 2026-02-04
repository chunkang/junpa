import { describe, it, expect } from 'vitest'
import {
  renumberEpisodes,
  sortEpisodesByUploadDate,
  calculateSeriesTotalDuration,
} from '@/lib/series-utils'
import type { SeriesEpisode, Video } from '@/lib/schemas'

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

describe('renumberEpisodes', () => {
  it('should assign sequential numbers starting from 1', () => {
    const episodes: SeriesEpisode[] = [
      { videoId: 'a', episodeNumber: 5 },
      { videoId: 'b', episodeNumber: 10 },
      { videoId: 'c', episodeNumber: 15 },
    ]

    const result = renumberEpisodes(episodes)

    expect(result[0].episodeNumber).toBe(1)
    expect(result[1].episodeNumber).toBe(2)
    expect(result[2].episodeNumber).toBe(3)
  })

  it('should preserve videoId and title', () => {
    const episodes: SeriesEpisode[] = [
      { videoId: 'a', episodeNumber: 99, title: 'First' },
      { videoId: 'b', episodeNumber: 100 },
    ]

    const result = renumberEpisodes(episodes)

    expect(result[0].videoId).toBe('a')
    expect(result[0].title).toBe('First')
    expect(result[1].videoId).toBe('b')
  })

  it('should return an empty array when given empty input', () => {
    expect(renumberEpisodes([])).toEqual([])
  })

  it('should handle a single episode', () => {
    const episodes: SeriesEpisode[] = [
      { videoId: 'a', episodeNumber: 42 },
    ]

    const result = renumberEpisodes(episodes)

    expect(result).toHaveLength(1)
    expect(result[0].episodeNumber).toBe(1)
  })
})

describe('sortEpisodesByUploadDate', () => {
  it('should sort episodes by video uploadedAt ascending (oldest first)', () => {
    const videoA = createMockVideo({
      id: 'vid-a',
      uploadedAt: '2025-03-01T00:00:00.000Z',
    })
    const videoB = createMockVideo({
      id: 'vid-b',
      uploadedAt: '2025-01-01T00:00:00.000Z',
    })
    const videoC = createMockVideo({
      id: 'vid-c',
      uploadedAt: '2025-02-01T00:00:00.000Z',
    })

    const episodes: SeriesEpisode[] = [
      { videoId: 'vid-a', episodeNumber: 1 },
      { videoId: 'vid-b', episodeNumber: 2 },
      { videoId: 'vid-c', episodeNumber: 3 },
    ]

    const result = sortEpisodesByUploadDate(episodes, [videoA, videoB, videoC])

    expect(result[0].videoId).toBe('vid-b')
    expect(result[1].videoId).toBe('vid-c')
    expect(result[2].videoId).toBe('vid-a')
  })

  it('should renumber episodes after sorting', () => {
    const videoA = createMockVideo({
      id: 'vid-a',
      uploadedAt: '2025-06-01T00:00:00.000Z',
    })
    const videoB = createMockVideo({
      id: 'vid-b',
      uploadedAt: '2025-01-01T00:00:00.000Z',
    })

    const episodes: SeriesEpisode[] = [
      { videoId: 'vid-a', episodeNumber: 1 },
      { videoId: 'vid-b', episodeNumber: 2 },
    ]

    const result = sortEpisodesByUploadDate(episodes, [videoA, videoB])

    expect(result[0].episodeNumber).toBe(1)
    expect(result[1].episodeNumber).toBe(2)
    expect(result[0].videoId).toBe('vid-b')
  })

  it('should handle episodes whose video is missing from the list', () => {
    const videoA = createMockVideo({
      id: 'vid-a',
      uploadedAt: '2025-03-01T00:00:00.000Z',
    })

    const episodes: SeriesEpisode[] = [
      { videoId: 'vid-a', episodeNumber: 1 },
      { videoId: 'vid-missing', episodeNumber: 2 },
    ]

    const result = sortEpisodesByUploadDate(episodes, [videoA])

    // Missing video gets date 0, so it comes first
    expect(result[0].videoId).toBe('vid-missing')
    expect(result[1].videoId).toBe('vid-a')
  })
})

describe('calculateSeriesTotalDuration', () => {
  it('should sum durations of all episode videos', () => {
    const videoA = createMockVideo({ id: 'vid-a', duration: 60 })
    const videoB = createMockVideo({ id: 'vid-b', duration: 120 })
    const videoC = createMockVideo({ id: 'vid-c', duration: 90 })

    const episodes: SeriesEpisode[] = [
      { videoId: 'vid-a', episodeNumber: 1 },
      { videoId: 'vid-b', episodeNumber: 2 },
      { videoId: 'vid-c', episodeNumber: 3 },
    ]

    const total = calculateSeriesTotalDuration(episodes, [
      videoA,
      videoB,
      videoC,
    ])

    expect(total).toBe(270)
  })

  it('should return 0 for empty episodes', () => {
    expect(calculateSeriesTotalDuration([], [])).toBe(0)
  })

  it('should skip episodes whose video is not found', () => {
    const videoA = createMockVideo({ id: 'vid-a', duration: 100 })

    const episodes: SeriesEpisode[] = [
      { videoId: 'vid-a', episodeNumber: 1 },
      { videoId: 'vid-missing', episodeNumber: 2 },
    ]

    const total = calculateSeriesTotalDuration(episodes, [videoA])

    expect(total).toBe(100)
  })
})
