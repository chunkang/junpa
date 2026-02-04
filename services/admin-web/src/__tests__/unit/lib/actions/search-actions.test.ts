import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JunpaLibrary, Video, Playlist, Series } from '@/lib/schemas'
import { createEmptyLibrary } from '@/lib/schemas'

// Mock the library store
const mockReadLibrary = vi.fn<() => Promise<JunpaLibrary>>()

vi.mock('@/lib/store/library-store', () => ({
  readLibrary: () => mockReadLibrary(),
}))

// Import after mocking
const { searchContent } = await import('@/lib/actions/search-actions')

function createTestVideo(overrides: Partial<Video> = {}): Video {
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

function createTestPlaylist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: crypto.randomUUID(),
    title: 'Test Playlist',
    items: [],
    loop: false,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function createTestSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: crypto.randomUUID(),
    title: 'Test Series',
    episodes: [],
    autoPlay: false,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('Search Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty results for empty query', async () => {
    const result = await searchContent('')
    expect(result.videos).toHaveLength(0)
    expect(result.playlists).toHaveLength(0)
    expect(result.series).toHaveLength(0)
  })

  it('should return empty results for query shorter than 2 characters', async () => {
    const result = await searchContent('a')
    expect(result.videos).toHaveLength(0)
    expect(result.playlists).toHaveLength(0)
    expect(result.series).toHaveLength(0)
  })

  it('should search video titles', async () => {
    const lib = createEmptyLibrary()
    lib.videos = [
      createTestVideo({ title: 'React Tutorial' }),
      createTestVideo({ title: 'Vue Guide' }),
    ]
    mockReadLibrary.mockResolvedValue(lib)

    const result = await searchContent('react')
    expect(result.videos).toHaveLength(1)
    expect(result.videos[0].title).toBe('React Tutorial')
  })

  it('should search video tags', async () => {
    const lib = createEmptyLibrary()
    lib.videos = [
      createTestVideo({ title: 'My Video', tags: ['javascript', 'react'] }),
      createTestVideo({ title: 'Other Video', tags: ['python'] }),
    ]
    mockReadLibrary.mockResolvedValue(lib)

    const result = await searchContent('javascript')
    expect(result.videos).toHaveLength(1)
    expect(result.videos[0].title).toBe('My Video')
  })

  it('should be case insensitive', async () => {
    const lib = createEmptyLibrary()
    lib.videos = [createTestVideo({ title: 'UPPERCASE Video' })]
    lib.playlists = [createTestPlaylist({ title: 'lowercase playlist' })]
    mockReadLibrary.mockResolvedValue(lib)

    const result = await searchContent('uppercase')
    expect(result.videos).toHaveLength(1)

    const result2 = await searchContent('LOWERCASE')
    expect(result2.playlists).toHaveLength(1)
  })

  it('should search across all content types', async () => {
    const lib = createEmptyLibrary()
    lib.videos = [createTestVideo({ title: 'Music Video' })]
    lib.playlists = [createTestPlaylist({ title: 'Music Playlist' })]
    lib.series = [createTestSeries({ title: 'Music Series' })]
    mockReadLibrary.mockResolvedValue(lib)

    const result = await searchContent('Music')
    expect(result.videos).toHaveLength(1)
    expect(result.playlists).toHaveLength(1)
    expect(result.series).toHaveLength(1)
  })

  it('should return empty arrays when no matches found', async () => {
    const lib = createEmptyLibrary()
    lib.videos = [createTestVideo({ title: 'React Tutorial' })]
    mockReadLibrary.mockResolvedValue(lib)

    const result = await searchContent('angular')
    expect(result.videos).toHaveLength(0)
    expect(result.playlists).toHaveLength(0)
    expect(result.series).toHaveLength(0)
  })

  it('should handle whitespace-only queries', async () => {
    const result = await searchContent('   ')
    expect(result.videos).toHaveLength(0)
    expect(result.playlists).toHaveLength(0)
    expect(result.series).toHaveLength(0)
  })
})
