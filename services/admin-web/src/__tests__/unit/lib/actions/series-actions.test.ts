import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JunpaLibrary, Video, Series } from '@/lib/schemas'

// Mock the library store
const mockReadLibrary = vi.fn<() => Promise<JunpaLibrary>>()
const mockWriteLibrary = vi.fn<(lib: JunpaLibrary) => Promise<void>>()

vi.mock('@/lib/store/library-store', () => ({
  readLibrary: () => mockReadLibrary(),
  writeLibrary: (lib: JunpaLibrary) => mockWriteLibrary(lib),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
})

import {
  getAllSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  addEpisode,
  removeEpisode,
  reorderEpisodes,
  autoOrderByUploadDate,
} from '@/lib/actions/series-actions'

function createMockVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'vid-1',
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

function createMockSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: 'series-1',
    title: 'Test Series',
    episodes: [],
    autoPlay: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function createMockLibrary(
  overrides: Partial<JunpaLibrary> = {}
): JunpaLibrary {
  return {
    version: '1.0.0',
    lastModified: '2025-01-01T00:00:00.000Z',
    videos: [],
    playlists: [],
    series: [],
    featured: {
      maxItems: 10,
      items: [],
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockWriteLibrary.mockResolvedValue(undefined)
})

describe('getAllSeries', () => {
  it('should return all series from the library', async () => {
    const series = [createMockSeries(), createMockSeries({ id: 'series-2' })]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await getAllSeries()

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('series-1')
    expect(result[1].id).toBe('series-2')
  })

  it('should return empty array when no series exist', async () => {
    mockReadLibrary.mockResolvedValue(createMockLibrary())

    const result = await getAllSeries()

    expect(result).toEqual([])
  })
})

describe('getSeriesById', () => {
  it('should return a series by ID', async () => {
    const series = [createMockSeries({ id: 'series-1', title: 'My Series' })]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await getSeriesById('series-1')

    expect(result).not.toBeNull()
    expect(result?.title).toBe('My Series')
  })

  it('should return null when series is not found', async () => {
    mockReadLibrary.mockResolvedValue(createMockLibrary())

    const result = await getSeriesById('nonexistent')

    expect(result).toBeNull()
  })
})

describe('createSeries', () => {
  it('should create a new series with empty episodes', async () => {
    mockReadLibrary.mockResolvedValue(createMockLibrary())

    const result = await createSeries({
      title: 'New Series',
      description: 'A test series',
    })

    expect(result.success).toBe(true)
    expect(result.seriesId).toBe('test-uuid-1234')
    expect(mockWriteLibrary).toHaveBeenCalledTimes(1)

    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    const created = writtenLib.series[0]
    expect(created.title).toBe('New Series')
    expect(created.description).toBe('A test series')
    expect(created.episodes).toEqual([])
    expect(created.autoPlay).toBe(false)
  })

  it('should fail when title is empty', async () => {
    const result = await createSeries({ title: '  ' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Title is required')
  })
})

describe('updateSeries', () => {
  it('should update series metadata', async () => {
    const series = [createMockSeries({ id: 'series-1', title: 'Old Title' })]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await updateSeries('series-1', {
      title: 'New Title',
      autoPlay: true,
    })

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    expect(writtenLib.series[0].title).toBe('New Title')
    expect(writtenLib.series[0].autoPlay).toBe(true)
  })

  it('should fail when series is not found', async () => {
    mockReadLibrary.mockResolvedValue(createMockLibrary())

    const result = await updateSeries('nonexistent', { title: 'X' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Series not found')
  })
})

describe('deleteSeries', () => {
  it('should remove the series from the library', async () => {
    const series = [createMockSeries({ id: 'series-1' })]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await deleteSeries('series-1')

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    expect(writtenLib.series).toHaveLength(0)
  })

  it('should fail when series is not found', async () => {
    mockReadLibrary.mockResolvedValue(createMockLibrary())

    const result = await deleteSeries('nonexistent')

    expect(result.success).toBe(false)
  })
})

describe('addEpisode', () => {
  it('should add a video as the next episode', async () => {
    const video = createMockVideo({ id: 'vid-1' })
    const series = [createMockSeries({ id: 'series-1', episodes: [] })]
    mockReadLibrary.mockResolvedValue(
      createMockLibrary({ series, videos: [video] })
    )

    const result = await addEpisode('series-1', 'vid-1', 'Pilot')

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    const ep = writtenLib.series[0].episodes[0]
    expect(ep.videoId).toBe('vid-1')
    expect(ep.episodeNumber).toBe(1)
    expect(ep.title).toBe('Pilot')
  })

  it('should auto-increment episode number', async () => {
    const video1 = createMockVideo({ id: 'vid-1' })
    const video2 = createMockVideo({ id: 'vid-2' })
    const series = [
      createMockSeries({
        id: 'series-1',
        episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
      }),
    ]
    mockReadLibrary.mockResolvedValue(
      createMockLibrary({ series, videos: [video1, video2] })
    )

    const result = await addEpisode('series-1', 'vid-2')

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    expect(writtenLib.series[0].episodes[1].episodeNumber).toBe(2)
  })

  it('should fail if video is already in series', async () => {
    const video = createMockVideo({ id: 'vid-1' })
    const series = [
      createMockSeries({
        id: 'series-1',
        episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
      }),
    ]
    mockReadLibrary.mockResolvedValue(
      createMockLibrary({ series, videos: [video] })
    )

    const result = await addEpisode('series-1', 'vid-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Video is already in this series')
  })
})

describe('removeEpisode', () => {
  it('should remove an episode and renumber remaining', async () => {
    const series = [
      createMockSeries({
        id: 'series-1',
        episodes: [
          { videoId: 'vid-1', episodeNumber: 1 },
          { videoId: 'vid-2', episodeNumber: 2 },
          { videoId: 'vid-3', episodeNumber: 3 },
        ],
      }),
    ]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await removeEpisode('series-1', 'vid-2')

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    const eps = writtenLib.series[0].episodes
    expect(eps).toHaveLength(2)
    expect(eps[0].videoId).toBe('vid-1')
    expect(eps[0].episodeNumber).toBe(1)
    expect(eps[1].videoId).toBe('vid-3')
    expect(eps[1].episodeNumber).toBe(2)
  })

  it('should fail when episode is not found', async () => {
    const series = [createMockSeries({ id: 'series-1', episodes: [] })]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series }))

    const result = await removeEpisode('series-1', 'vid-nonexistent')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Episode not found in this series')
  })
})

describe('autoOrderByUploadDate', () => {
  it('should sort episodes by video upload date ascending', async () => {
    const videos = [
      createMockVideo({
        id: 'vid-a',
        uploadedAt: '2025-03-01T00:00:00.000Z',
      }),
      createMockVideo({
        id: 'vid-b',
        uploadedAt: '2025-01-01T00:00:00.000Z',
      }),
      createMockVideo({
        id: 'vid-c',
        uploadedAt: '2025-02-01T00:00:00.000Z',
      }),
    ]
    const series = [
      createMockSeries({
        id: 'series-1',
        episodes: [
          { videoId: 'vid-a', episodeNumber: 1 },
          { videoId: 'vid-b', episodeNumber: 2 },
          { videoId: 'vid-c', episodeNumber: 3 },
        ],
      }),
    ]
    mockReadLibrary.mockResolvedValue(createMockLibrary({ series, videos }))

    const result = await autoOrderByUploadDate('series-1')

    expect(result.success).toBe(true)
    const writtenLib = mockWriteLibrary.mock.calls[0][0]
    const eps = writtenLib.series[0].episodes
    expect(eps[0].videoId).toBe('vid-b')
    expect(eps[0].episodeNumber).toBe(1)
    expect(eps[1].videoId).toBe('vid-c')
    expect(eps[1].episodeNumber).toBe(2)
    expect(eps[2].videoId).toBe('vid-a')
    expect(eps[2].episodeNumber).toBe(3)
  })
})
