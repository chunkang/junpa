'use server'

import { readLibrary, writeLibrary } from '@/lib/store/library-store'
import type { FeaturedItem, Video, Playlist, Series } from '@/lib/schemas'

export interface ActionResult {
  success: boolean
  error?: string
}

export interface FeaturedItemWithDetails {
  contentType: FeaturedItem['contentType']
  contentId: string
  priority: number
  featuredAt: string
  title: string
}

/**
 * Fetch all featured items with their content details (title, type).
 */
export async function getFeaturedItems(): Promise<FeaturedItemWithDetails[]> {
  const library = await readLibrary()
  const { items } = library.featured

  return items
    .sort((a, b) => a.priority - b.priority)
    .map((item) => {
      let title = 'Unknown'

      if (item.contentType === 'video') {
        const video = library.videos.find((v) => v.id === item.contentId)
        if (video) title = video.title
      } else if (item.contentType === 'playlist') {
        const playlist = library.playlists.find(
          (p) => p.id === item.contentId
        )
        if (playlist) title = playlist.title
      } else if (item.contentType === 'series') {
        const series = library.series.find((s) => s.id === item.contentId)
        if (series) title = series.title
      }

      return {
        contentType: item.contentType,
        contentId: item.contentId,
        priority: item.priority,
        featuredAt: item.featuredAt,
        title,
      }
    })
}

/**
 * Add content to the featured list with the next priority number.
 * Enforces the maximum 10 items limit.
 */
export async function addFeaturedItem(
  contentType: FeaturedItem['contentType'],
  contentId: string
): Promise<ActionResult> {
  const library = await readLibrary()

  if (library.featured.items.length >= 10) {
    return {
      success: false,
      error: 'Featured content limit reached (maximum 10 items).',
    }
  }

  // Check if already featured
  if (library.featured.items.some((item) => item.contentId === contentId)) {
    return { success: false, error: 'Content is already featured.' }
  }

  // Verify the content exists
  let exists = false
  if (contentType === 'video') {
    exists = library.videos.some((v) => v.id === contentId)
  } else if (contentType === 'playlist') {
    exists = library.playlists.some((p) => p.id === contentId)
  } else if (contentType === 'series') {
    exists = library.series.some((s) => s.id === contentId)
  }

  if (!exists) {
    return { success: false, error: 'Content not found.' }
  }

  const maxPriority = library.featured.items.reduce(
    (max, item) => Math.max(max, item.priority),
    -1
  )

  const newItem: FeaturedItem = {
    contentType,
    contentId,
    priority: maxPriority + 1,
    featuredAt: new Date().toISOString(),
  }

  library.featured.items.push(newItem)
  library.featured.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Remove content from the featured list and reorder priorities.
 */
export async function removeFeaturedItem(
  contentId: string
): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.featured.items.findIndex(
    (item) => item.contentId === contentId
  )

  if (index === -1) {
    return { success: false, error: 'Featured item not found.' }
  }

  library.featured.items.splice(index, 1)

  // Reorder priorities starting from 0
  library.featured.items
    .sort((a, b) => a.priority - b.priority)
    .forEach((item, i) => {
      item.priority = i
    })

  library.featured.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Update the priority order for all featured items.
 */
export async function reorderFeaturedItems(
  items: FeaturedItem[]
): Promise<ActionResult> {
  const library = await readLibrary()

  // Reassign priorities based on array order
  library.featured.items = items.map((item, i) => ({
    ...item,
    priority: i,
  }))
  library.featured.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Check if content is already featured.
 */
export async function isFeatured(contentId: string): Promise<boolean> {
  const library = await readLibrary()
  return library.featured.items.some((item) => item.contentId === contentId)
}
