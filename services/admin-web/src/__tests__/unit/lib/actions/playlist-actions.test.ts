import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JunpaLibrary, Playlist } from '@/lib/schemas'
import { createEmptyLibrary } from '@/lib/schemas'

// Mock the library store
const mockReadLibrary = vi.fn<() => Promise<JunpaLibrary>>()
const mockWriteLibrary = vi.fn<(lib: JunpaLibrary) => Promise<void>>()

vi.mock('@/lib/store/library-store', () => ({
  readLibrary: () => mockReadLibrary(),
  writeLibrary: (lib: JunpaLibrary) => mockWriteLibrary(lib),
}))

// Mock crypto.randomUUID
vi.stubGlobal(
  'crypto',
  Object.assign({}, globalThis.crypto, {
    randomUUID: () => '00000000-0000-0000-0000-000000000001',
  })
)

// Import after mocking
const {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  reorderPlaylistItems,
  setPlaylistItemStartTime,
} = await import('@/lib/actions/playlist-actions')

function createTestPlaylist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Playlist',
    items: [],
    loop: false,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    ...overrides,
  }
}

function createLibraryWithPlaylists(
  playlists: Playlist[]
): JunpaLibrary {
  const lib = createEmptyLibrary()
  lib.playlists = playlists
  return lib
}

describe('Playlist Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteLibrary.mockResolvedValue(undefined)
  })

  describe('getPlaylists', () => {
    it('should return all playlists', async () => {
      const playlist = createTestPlaylist()
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await getPlaylists()
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test Playlist')
    })

    it('should return empty array when no playlists exist', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await getPlaylists()
      expect(result).toHaveLength(0)
    })
  })

  describe('getPlaylistById', () => {
    it('should return a playlist by id', async () => {
      const playlist = createTestPlaylist()
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await getPlaylistById(playlist.id)
      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Playlist')
    })

    it('should return null for non-existent id', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await getPlaylistById('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('createPlaylist', () => {
    it('should create a new playlist', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await createPlaylist({ title: 'My Playlist' })
      expect(result.success).toBe(true)
      expect(result.playlist).toBeDefined()
      expect(result.playlist?.title).toBe('My Playlist')
      expect(result.playlist?.items).toEqual([])
      expect(result.playlist?.loop).toBe(false)
      expect(mockWriteLibrary).toHaveBeenCalledTimes(1)
    })

    it('should return error when title is empty', async () => {
      const result = await createPlaylist({ title: '' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('should trim the title', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await createPlaylist({ title: '  My Playlist  ' })
      expect(result.playlist?.title).toBe('My Playlist')
    })
  })

  describe('updatePlaylist', () => {
    it('should update playlist metadata', async () => {
      const playlist = createTestPlaylist()
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await updatePlaylist(playlist.id, {
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
      expect(mockWriteLibrary).toHaveBeenCalledTimes(1)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.playlists[0].title).toBe('Updated Title')
    })

    it('should return error for non-existent playlist', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await updatePlaylist('non-existent', {
        title: 'Updated',
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Playlist not found')
    })

    it('should return error for empty title', async () => {
      const playlist = createTestPlaylist()
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await updatePlaylist(playlist.id, { title: '  ' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Title is required')
    })
  })

  describe('deletePlaylist', () => {
    it('should delete a playlist', async () => {
      const playlist = createTestPlaylist()
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await deletePlaylist(playlist.id)
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.playlists).toHaveLength(0)
    })

    it('should return error for non-existent playlist', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithPlaylists([]))

      const result = await deletePlaylist('non-existent')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Playlist not found')
    })
  })

  describe('reorderPlaylistItems', () => {
    it('should reorder playlist items', async () => {
      const playlist = createTestPlaylist({
        items: [
          { videoId: 'v1', order: 0 },
          { videoId: 'v2', order: 1 },
        ],
      })
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const newOrder = [
        { videoId: 'v2', order: 0 },
        { videoId: 'v1', order: 1 },
      ]
      const result = await reorderPlaylistItems(playlist.id, newOrder)
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.playlists[0].items[0].videoId).toBe('v2')
      expect(written.playlists[0].items[1].videoId).toBe('v1')
    })
  })

  describe('setPlaylistItemStartTime', () => {
    it('should set start time for a playlist item', async () => {
      const playlist = createTestPlaylist({
        items: [{ videoId: 'v1', order: 0 }],
      })
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await setPlaylistItemStartTime(
        playlist.id,
        'v1',
        'PT1M30S'
      )
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.playlists[0].items[0].startAt).toBe('PT1M30S')
    })

    it('should return error for non-existent video in playlist', async () => {
      const playlist = createTestPlaylist({
        items: [{ videoId: 'v1', order: 0 }],
      })
      mockReadLibrary.mockResolvedValue(
        createLibraryWithPlaylists([playlist])
      )

      const result = await setPlaylistItemStartTime(
        playlist.id,
        'non-existent',
        'PT1M'
      )
      expect(result.success).toBe(false)
      expect(result.error).toBe('Video not found in playlist')
    })
  })
})
