'use client'

import { useCallback, useRef, useState } from 'react'
import { validateVideoFile } from '@/lib/upload/file-validation'
import { useUploadStore } from '@/lib/upload/upload-store'
import type { Video } from '@/lib/schemas'

function getTitleFromFilename(filename: string): string {
  const name = filename.replace(/\.[^/.]+$/, '')
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  )
  const { addUpload, updateProgress, completeUpload, failUpload } =
    useUploadStore()

  const uploadFile = useCallback(
    (file: File) => {
      const validation = validateVideoFile(file)
      if (!validation.valid) {
        return { success: false as const, error: validation.error! }
      }

      const id = crypto.randomUUID()

      addUpload({
        id,
        filename: file.name,
        fileSize: file.size,
      })

      setIsUploading(true)

      // Simulate upload progress for demo purposes
      let progress = 0
      const totalSteps = 20
      const stepDuration = 150 + Math.random() * 200

      const interval = setInterval(() => {
        progress += Math.random() * (100 / totalSteps) + 1
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          intervalsRef.current.delete(id)
          completeUpload(id)

          // Check if any uploads are still in progress
          const { uploads } = useUploadStore.getState()
          const stillUploading = uploads.some(
            (u) => u.status === 'uploading' || u.status === 'pending'
          )
          if (!stillUploading) {
            setIsUploading(false)
          }
        } else {
          const remaining = Math.ceil(
            ((100 - progress) / (100 / totalSteps)) * (stepDuration / 1000)
          )
          updateProgress(id, Math.round(progress), remaining)
        }
      }, stepDuration)

      intervalsRef.current.set(id, interval)

      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
      const now = new Date().toISOString()

      const video: Video = {
        id,
        title: getTitleFromFilename(file.name),
        filename: file.name,
        duration: 0,
        fileSize: file.size,
        format: extension as 'mp4' | 'webm' | 'mov' | 'avi',
        tags: [],
        uploadedAt: now,
        updatedAt: now,
        source: 'local',
      }

      return { success: true as const, video }
    },
    [addUpload, updateProgress, completeUpload]
  )

  return { uploadFile, isUploading }
}
