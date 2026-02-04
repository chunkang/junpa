'use server'

import { readLibrary, writeLibrary } from '@/lib/store/library-store'
import { renumberEpisodes, sortEpisodesByUploadDate } from '@/lib/series-utils'
import type { Series, SeriesEpisode } from '@/lib/schemas'

export interface ActionResult {
  success: boolean
  error?: string
}

export interface SeriesActionResult extends ActionResult {
  seriesId?: string
}

/**
 * Fetch all series from the library.
 */
export async function getAllSeries(): Promise<Series[]> {
  const library = await readLibrary()
  return library.series
}

/**
 * Fetch a single series by ID, including its episode data.
 */
export async function getSeriesById(id: string): Promise<Series | null> {
  const library = await readLibrary()
  return library.series.find((s) => s.id === id) ?? null
}

/**
 * Create a new series with the given title and optional description.
 * Returns the new series ID on success.
 */
export async function createSeries(data: {
  title: string
  description?: string
}): Promise<SeriesActionResult> {
  if (!data.title.trim()) {
    return { success: false, error: 'Title is required' }
  }

  const library = await readLibrary()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  const newSeries: Series = {
    id,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    episodes: [],
    autoPlay: false,
    createdAt: now,
    updatedAt: now,
  }

  library.series.push(newSeries)
  await writeLibrary(library)

  return { success: true, seriesId: id }
}

/**
 * Update series metadata and/or episodes.
 */
export async function updateSeries(
  id: string,
  data: Partial<Pick<Series, 'title' | 'description' | 'autoPlay' | 'episodes'>>
): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.series.findIndex((s) => s.id === id)

  if (index === -1) {
    return { success: false, error: 'Series not found' }
  }

  if (data.title !== undefined && !data.title.trim()) {
    return { success: false, error: 'Title is required' }
  }

  library.series[index] = {
    ...library.series[index],
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.description !== undefined && {
      description: data.description.trim() || undefined,
    }),
    ...(data.autoPlay !== undefined && { autoPlay: data.autoPlay }),
    ...(data.episodes !== undefined && { episodes: data.episodes }),
    updatedAt: new Date().toISOString(),
  }

  await writeLibrary(library)
  return { success: true }
}

/**
 * Delete a series from the library.
 */
export async function deleteSeries(id: string): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.series.findIndex((s) => s.id === id)

  if (index === -1) {
    return { success: false, error: 'Series not found' }
  }

  library.series.splice(index, 1)
  await writeLibrary(library)
  return { success: true }
}

/**
 * Add a video as the next episode in the series.
 * Episode number is auto-incremented based on current episode count.
 */
export async function addEpisode(
  seriesId: string,
  videoId: string,
  title?: string
): Promise<ActionResult> {
  const library = await readLibrary()
  const series = library.series.find((s) => s.id === seriesId)

  if (!series) {
    return { success: false, error: 'Series not found' }
  }

  // Check if the video is already in the series
  if (series.episodes.some((ep) => ep.videoId === videoId)) {
    return { success: false, error: 'Video is already in this series' }
  }

  // Verify the video exists
  const videoExists = library.videos.some((v) => v.id === videoId)
  if (!videoExists) {
    return { success: false, error: 'Video not found' }
  }

  const nextNumber = series.episodes.length + 1
  const newEpisode: SeriesEpisode = {
    videoId,
    episodeNumber: nextNumber,
    ...(title?.trim() && { title: title.trim() }),
  }

  series.episodes.push(newEpisode)
  series.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Remove an episode from the series and renumber the remaining episodes.
 */
export async function removeEpisode(
  seriesId: string,
  videoId: string
): Promise<ActionResult> {
  const library = await readLibrary()
  const series = library.series.find((s) => s.id === seriesId)

  if (!series) {
    return { success: false, error: 'Series not found' }
  }

  const episodeIndex = series.episodes.findIndex((ep) => ep.videoId === videoId)
  if (episodeIndex === -1) {
    return { success: false, error: 'Episode not found in this series' }
  }

  series.episodes.splice(episodeIndex, 1)
  series.episodes = renumberEpisodes(series.episodes)
  series.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Reorder episodes in the series. Accepts the new episode order.
 */
export async function reorderEpisodes(
  seriesId: string,
  episodes: SeriesEpisode[]
): Promise<ActionResult> {
  const library = await readLibrary()
  const series = library.series.find((s) => s.id === seriesId)

  if (!series) {
    return { success: false, error: 'Series not found' }
  }

  series.episodes = renumberEpisodes(episodes)
  series.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}

/**
 * Sort episodes chronologically by their video's uploadedAt date (oldest first).
 */
export async function autoOrderByUploadDate(
  seriesId: string
): Promise<ActionResult> {
  const library = await readLibrary()
  const series = library.series.find((s) => s.id === seriesId)

  if (!series) {
    return { success: false, error: 'Series not found' }
  }

  series.episodes = sortEpisodesByUploadDate(series.episodes, library.videos)
  series.updatedAt = new Date().toISOString()

  await writeLibrary(library)
  return { success: true }
}
