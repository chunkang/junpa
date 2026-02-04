'use server'

import { readLibrary, writeLibrary } from '@/lib/store/library-store'
import type { Playlist, PlaylistItem } from '@/lib/schemas'

export interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Fetch all playlists from the library.
 */
export async function getPlaylists(): Promise<Playlist[]> {
  const library = await readLibrary()
  return library.playlists
}

/**
 * Fetch a single playlist by ID.
 */
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const library = await readLibrary()
  return library.playlists.find((p) => p.id === id) ?? null
}

/**
 * Create a new playlist with the given title and optional description.
 * Returns the newly created playlist on success.
 */
export async function createPlaylist(data: {
  title: string
  description?: string
}): Promise<{ success: boolean; playlist?: Playlist; error?: string }> {
  if (!data.title || !data.title.trim()) {
    return { success: false, error: 'Title is required' }
  }

  const now = new Date().toISOString()
  const playlist: Playlist = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    items: [],
    loop: false,
    createdAt: now,
    updatedAt: now,
  }

  const library = await readLibrary()
  library.playlists.push(playlist)
  await writeLibrary(library)

  return { success: true, playlist }
}

/**
 * Update playlist metadata and items.
 */
export async function updatePlaylist(
  id: string,
  data: Partial<Pick<Playlist, 'title' | 'description' | 'items' | 'loop'>>
): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.playlists.findIndex((p) => p.id === id)

  if (index === -1) {
    return { success: false, error: 'Playlist not found' }
  }

  if (data.title !== undefined && !data.title.trim()) {
    return { success: false, error: 'Title is required' }
  }

  const existing = library.playlists[index]
  library.playlists[index] = {
    ...existing,
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.description !== undefined && {
      description: data.description.trim() || undefined,
    }),
    ...(data.items !== undefined && { items: data.items }),
    ...(data.loop !== undefined && { loop: data.loop }),
    updatedAt: new Date().toISOString(),
  }

  await writeLibrary(library)
  return { success: true }
}

/**
 * Delete a playlist from the library by ID.
 */
export async function deletePlaylist(id: string): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.playlists.findIndex((p) => p.id === id)

  if (index === -1) {
    return { success: false, error: 'Playlist not found' }
  }

  library.playlists.splice(index, 1)
  await writeLibrary(library)
  return { success: true }
}

/**
 * Reorder playlist items.
 */
export async function reorderPlaylistItems(
  playlistId: string,
  items: PlaylistItem[]
): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.playlists.findIndex((p) => p.id === playlistId)

  if (index === -1) {
    return { success: false, error: 'Playlist not found' }
  }

  library.playlists[index] = {
    ...library.playlists[index],
    items,
    updatedAt: new Date().toISOString(),
  }

  await writeLibrary(library)
  return { success: true }
}

/**
 * Set the start time for a specific video within a playlist.
 * The startAt value should be an ISO 8601 duration (e.g. "PT1M30S").
 */
export async function setPlaylistItemStartTime(
  playlistId: string,
  videoId: string,
  startAt: string
): Promise<ActionResult> {
  const library = await readLibrary()
  const playlistIndex = library.playlists.findIndex(
    (p) => p.id === playlistId
  )

  if (playlistIndex === -1) {
    return { success: false, error: 'Playlist not found' }
  }

  const playlist = library.playlists[playlistIndex]
  const itemIndex = playlist.items.findIndex((i) => i.videoId === videoId)

  if (itemIndex === -1) {
    return { success: false, error: 'Video not found in playlist' }
  }

  playlist.items[itemIndex] = {
    ...playlist.items[itemIndex],
    startAt: startAt || undefined,
  }
  playlist.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}
