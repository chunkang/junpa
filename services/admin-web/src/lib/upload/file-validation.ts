export const ACCEPTED_VIDEO_FORMATS = ['mp4', 'webm', 'mov', 'avi'] as const

export type AcceptedVideoFormat = (typeof ACCEPTED_VIDEO_FORMATS)[number]

/** 10 GB in bytes */
export const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024

export const ACCEPTED_MIME_TYPES: Record<AcceptedVideoFormat, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
}

export const ACCEPT_STRING = Object.values(ACCEPTED_MIME_TYPES).join(',')

function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

export function validateVideoFile(file: File): {
  valid: boolean
  error?: string
} {
  const extension = getFileExtension(file.name)

  if (
    !extension ||
    !ACCEPTED_VIDEO_FORMATS.includes(extension as AcceptedVideoFormat)
  ) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload mp4, webm, mov, or avi files.',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'File exceeds the 10GB size limit.',
    }
  }

  return { valid: true }
}
