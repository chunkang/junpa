import { describe, it, expect } from 'vitest'
import { junpaLibrarySchema, createEmptyLibrary } from '@/lib/schemas'

describe('Library Schema', () => {
  it('should validate a valid empty library', () => {
    const library = createEmptyLibrary()
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(true)
  })

  it('should reject invalid library format', () => {
    const result = junpaLibrarySchema.safeParse({ invalid: true })
    expect(result.success).toBe(false)
  })

  it('should validate library with video entries', () => {
    const library = createEmptyLibrary()
    library.videos.push({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Video',
      filename: 'test.mp4',
      duration: 120,
      fileSize: 1024000,
      format: 'mp4',
      tags: ['test'],
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'local',
    })
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(true)
  })

  it('should reject video with invalid format', () => {
    const library = createEmptyLibrary()
    library.videos.push({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test',
      filename: 'test.exe',
      duration: 120,
      fileSize: 1024,
      format: 'exe' as unknown as 'mp4',
      tags: [],
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'local',
    })
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(false)
  })

  it('should enforce featured items max limit of 10', () => {
    const library = createEmptyLibrary()
    // Add 11 featured items
    for (let i = 0; i < 11; i++) {
      library.featured.items.push({
        contentType: 'video',
        contentId: `id-${i}`,
        priority: i,
        featuredAt: new Date().toISOString(),
      })
    }
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(false)
  })

  it('should validate a complete library with playlists', () => {
    const library = createEmptyLibrary()
    library.playlists.push({
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Test Playlist',
      items: [
        {
          videoId: '550e8400-e29b-41d4-a716-446655440000',
          order: 0,
        },
      ],
      loop: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(true)
  })

  it('should validate a library with series', () => {
    const library = createEmptyLibrary()
    library.series.push({
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Test Series',
      episodes: [
        {
          videoId: '550e8400-e29b-41d4-a716-446655440000',
          episodeNumber: 1,
          title: 'Episode 1',
        },
      ],
      autoPlay: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const result = junpaLibrarySchema.safeParse(library)
    expect(result.success).toBe(true)
  })

  it('should create empty library with correct default structure', () => {
    const library = createEmptyLibrary()
    expect(library.version).toBe('1.0.0')
    expect(library.videos).toEqual([])
    expect(library.playlists).toEqual([])
    expect(library.series).toEqual([])
    expect(library.featured.maxItems).toBe(10)
    expect(library.featured.items).toEqual([])
  })
})
