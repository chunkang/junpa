'use server'

import { z } from 'zod'
import { readLibrary, writeLibrary } from '@/lib/store/library-store'
import type { Video } from '@/lib/schemas'

const updateVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()),
})

export type UpdateVideoData = z.infer<typeof updateVideoSchema>

export interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Fetch all videos from the library.
 */
export async function getVideos(): Promise<Video[]> {
  const library = await readLibrary()
  return library.videos
}

/**
 * Fetch a single video by ID.
 */
export async function getVideoById(id: string): Promise<Video | null> {
  const library = await readLibrary()
  return library.videos.find((v) => v.id === id) ?? null
}

/**
 * Update video metadata by ID.
 */
export async function updateVideo(
  id: string,
  data: UpdateVideoData
): Promise<ActionResult> {
  const parsed = updateVideoSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError?.message ?? 'Validation failed' }
  }

  const library = await readLibrary()
  const index = library.videos.findIndex((v) => v.id === id)

  if (index === -1) {
    return { success: false, error: 'Video not found' }
  }

  library.videos[index] = {
    ...library.videos[index],
    title: parsed.data.title,
    description: parsed.data.description,
    tags: parsed.data.tags,
    updatedAt: new Date().toISOString(),
  }

  await writeLibrary(library)
  return { success: true }
}

/**
 * Delete a video from the library by ID.
 * The deleteFile parameter is accepted for future use but file deletion
 * is not implemented in the local development store.
 */
export async function deleteVideo(
  id: string,
  _deleteFile?: boolean
): Promise<ActionResult> {
  const library = await readLibrary()
  const index = library.videos.findIndex((v) => v.id === id)

  if (index === -1) {
    return { success: false, error: 'Video not found' }
  }

  library.videos.splice(index, 1)
  await writeLibrary(library)
  return { success: true }
}
