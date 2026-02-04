import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { JunpaLibrary, FeaturedItem, Video } from '@/lib/schemas'
import { createEmptyLibrary } from '@/lib/schemas'

// Mock the library store
const mockReadLibrary = vi.fn<() => Promise<JunpaLibrary>>()
const mockWriteLibrary = vi.fn<(lib: JunpaLibrary) => Promise<void>>()

vi.mock('@/lib/store/library-store', () => ({
  readLibrary: () => mockReadLibrary(),
  writeLibrary: (lib: JunpaLibrary) => mockWriteLibrary(lib),
}))

// Import after mocking
const {
  getFeaturedItems,
  addFeaturedItem,
  removeFeaturedItem,
  reorderFeaturedItems,
  isFeatured,
} = await import('@/lib/actions/featured-actions')

function createTestVideo(id: string, title: string): Video {
  return {
    id,
    title,
    filename: `${id}.mp4`,
    duration: 120,
    fileSize: 1000000,
    format: 'mp4',
    tags: ['test'],
    uploadedAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    source: 'local',
  }
}

function createLibraryWithFeatured(
  items: FeaturedItem[],
  videos: Video[] = []
): JunpaLibrary {
  const lib = createEmptyLibrary()
  lib.featured.items = items
  lib.videos = videos
  return lib
}

describe('Featured Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteLibrary.mockResolvedValue(undefined)
  })

  describe('getFeaturedItems', () => {
    it('should return featured items with titles', async () => {
      const video = createTestVideo('v1', 'My Video')
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured(items, [video])
      )

      const result = await getFeaturedItems()
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('My Video')
      expect(result[0].contentType).toBe('video')
    })

    it('should return items sorted by priority', async () => {
      const v1 = createTestVideo('v1', 'First')
      const v2 = createTestVideo('v2', 'Second')
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v2',
          priority: 1,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured(items, [v1, v2])
      )

      const result = await getFeaturedItems()
      expect(result[0].contentId).toBe('v1')
      expect(result[1].contentId).toBe('v2')
    })

    it('should return empty array when no featured items exist', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured([]))

      const result = await getFeaturedItems()
      expect(result).toHaveLength(0)
    })

    it('should show Unknown title for missing content', async () => {
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'nonexistent',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured(items))

      const result = await getFeaturedItems()
      expect(result[0].title).toBe('Unknown')
    })
  })

  describe('addFeaturedItem', () => {
    it('should add a video to featured', async () => {
      const video = createTestVideo('v1', 'My Video')
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured([], [video])
      )

      const result = await addFeaturedItem('video', 'v1')
      expect(result.success).toBe(true)
      expect(mockWriteLibrary).toHaveBeenCalledTimes(1)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.featured.items).toHaveLength(1)
      expect(written.featured.items[0].contentId).toBe('v1')
      expect(written.featured.items[0].contentType).toBe('video')
      expect(written.featured.items[0].priority).toBe(0)
    })

    it('should assign correct priority when items already exist', async () => {
      const v1 = createTestVideo('v1', 'First')
      const v2 = createTestVideo('v2', 'Second')
      const existing: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured(existing, [v1, v2])
      )

      const result = await addFeaturedItem('video', 'v2')
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.featured.items).toHaveLength(2)
      expect(written.featured.items[1].priority).toBe(1)
    })

    it('should enforce 10-item limit', async () => {
      const videos = Array.from({ length: 11 }, (_, i) =>
        createTestVideo(`v${i}`, `Video ${i}`)
      )
      const items: FeaturedItem[] = Array.from({ length: 10 }, (_, i) => ({
        contentType: 'video' as const,
        contentId: `v${i}`,
        priority: i,
        featuredAt: '2025-01-15T10:00:00.000Z',
      }))
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured(items, videos)
      )

      const result = await addFeaturedItem('video', 'v10')
      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Featured content limit reached (maximum 10 items).'
      )
      expect(mockWriteLibrary).not.toHaveBeenCalled()
    })

    it('should prevent duplicate featured items', async () => {
      const video = createTestVideo('v1', 'My Video')
      const existing: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(
        createLibraryWithFeatured(existing, [video])
      )

      const result = await addFeaturedItem('video', 'v1')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Content is already featured.')
    })

    it('should return error for nonexistent content', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured([]))

      const result = await addFeaturedItem('video', 'nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Content not found.')
    })
  })

  describe('removeFeaturedItem', () => {
    it('should remove a featured item', async () => {
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v2',
          priority: 1,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured(items))

      const result = await removeFeaturedItem('v1')
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.featured.items).toHaveLength(1)
      expect(written.featured.items[0].contentId).toBe('v2')
    })

    it('should reorder priorities after removal', async () => {
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v2',
          priority: 1,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v3',
          priority: 2,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured(items))

      await removeFeaturedItem('v1')

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.featured.items[0].priority).toBe(0)
      expect(written.featured.items[1].priority).toBe(1)
    })

    it('should return error for non-existent item', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured([]))

      const result = await removeFeaturedItem('nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Featured item not found.')
    })
  })

  describe('reorderFeaturedItems', () => {
    it('should update priorities based on new order', async () => {
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v2',
          priority: 1,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured(items))

      // Reverse order
      const reordered: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v2',
          priority: 1,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]

      const result = await reorderFeaturedItems(reordered)
      expect(result.success).toBe(true)

      const written = mockWriteLibrary.mock.calls[0][0]
      expect(written.featured.items[0].contentId).toBe('v2')
      expect(written.featured.items[0].priority).toBe(0)
      expect(written.featured.items[1].contentId).toBe('v1')
      expect(written.featured.items[1].priority).toBe(1)
    })
  })

  describe('isFeatured', () => {
    it('should return true for featured content', async () => {
      const items: FeaturedItem[] = [
        {
          contentType: 'video',
          contentId: 'v1',
          priority: 0,
          featuredAt: '2025-01-15T10:00:00.000Z',
        },
      ]
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured(items))

      const result = await isFeatured('v1')
      expect(result).toBe(true)
    })

    it('should return false for non-featured content', async () => {
      mockReadLibrary.mockResolvedValue(createLibraryWithFeatured([]))

      const result = await isFeatured('v1')
      expect(result).toBe(false)
    })
  })
})
