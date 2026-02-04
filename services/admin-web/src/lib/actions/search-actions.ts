'use server'

import { readLibrary } from '@/lib/store/library-store'
import type { Video, Playlist, Series } from '@/lib/schemas'

export interface SearchResults {
  videos: Video[]
  playlists: Playlist[]
  series: Series[]
}

/**
 * Search across video titles and tags, playlist titles, and series titles.
 * Case-insensitive matching. Returns empty arrays if query is empty or
 * less than 2 characters.
 */
export async function searchContent(query: string): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { videos: [], playlists: [], series: [] }
  }

  const library = await readLibrary()
  const term = query.trim().toLowerCase()

  const videos = library.videos.filter(
    (v) =>
      v.title.toLowerCase().includes(term) ||
      v.tags.some((tag) => tag.toLowerCase().includes(term))
  )

  const playlists = library.playlists.filter((p) =>
    p.title.toLowerCase().includes(term)
  )

  const series = library.series.filter((s) =>
    s.title.toLowerCase().includes(term)
  )

  return { videos, playlists, series }
}
