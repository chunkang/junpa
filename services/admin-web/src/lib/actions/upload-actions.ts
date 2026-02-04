'use server'

import { ACCEPTED_VIDEO_FORMATS, MAX_FILE_SIZE } from '@/lib/upload/file-validation'
import type { Video } from '@/lib/schemas'
import type { AcceptedVideoFormat } from '@/lib/upload/file-validation'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

function getTitleFromFilename(filename: string): string {
  const name = filename.replace(/\.[^/.]+$/, '')
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function uploadVideo(
  formData: FormData
): Promise<{ success: true; video: Video } | { success: false; error: string }> {
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return { success: false, error: 'No file provided.' }
  }

  const extension = getFileExtension(file.name)

  if (
    !extension ||
    !ACCEPTED_VIDEO_FORMATS.includes(extension as AcceptedVideoFormat)
  ) {
    return {
      success: false,
      error: 'Unsupported format. Please upload mp4, webm, mov, or avi files.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File exceeds the 10GB size limit.' }
  }

  try {
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const uniqueFilename = `${crypto.randomUUID()}-${file.name}`
    const filePath = path.join(uploadDir, uniqueFilename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const now = new Date().toISOString()

    const video: Video = {
      id: crypto.randomUUID(),
      title: getTitleFromFilename(file.name),
      filename: file.name,
      duration: 0,
      fileSize: file.size,
      format: extension as AcceptedVideoFormat,
      tags: [],
      uploadedAt: now,
      updatedAt: now,
      source: 'local',
    }

    return { success: true, video }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.'
    return { success: false, error: message }
  }
}

export async function importFromGooglePhotos(
  videoIds: string[]
): Promise<
  { success: true; videos: Video[] } | { success: false; error: string }
> {
  if (!videoIds.length) {
    return { success: false, error: 'No videos selected for import.' }
  }

  try {
    const now = new Date().toISOString()

    const videos: Video[] = videoIds.map((googleId) => ({
      id: crypto.randomUUID(),
      title: `Google Photos Video ${googleId.slice(0, 8)}`,
      filename: `google-${googleId}.mp4`,
      duration: 0,
      fileSize: 0,
      format: 'mp4' as const,
      tags: ['google-photos'],
      uploadedAt: now,
      updatedAt: now,
      source: 'google-photos' as const,
      googleDriveFileId: googleId,
    }))

    return { success: true, videos }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to import from Google Photos.'
    return { success: false, error: message }
  }
}
