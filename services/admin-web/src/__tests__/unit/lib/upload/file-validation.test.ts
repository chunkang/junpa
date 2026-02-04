import { describe, it, expect } from 'vitest'
import {
  validateVideoFile,
  ACCEPTED_VIDEO_FORMATS,
  MAX_FILE_SIZE,
  ACCEPTED_MIME_TYPES,
} from '@/lib/upload/file-validation'

function createMockFile(
  name: string,
  size: number,
  type: string = 'video/mp4'
): File {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('file-validation', () => {
  describe('constants', () => {
    it('should define accepted video formats', () => {
      expect(ACCEPTED_VIDEO_FORMATS).toEqual(['mp4', 'webm', 'mov', 'avi'])
    })

    it('should define MAX_FILE_SIZE as 10GB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024 * 1024)
    })

    it('should define MIME types for all accepted formats', () => {
      expect(ACCEPTED_MIME_TYPES).toEqual({
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
      })
    })
  })

  describe('validateVideoFile', () => {
    it('should accept a valid mp4 file', () => {
      const file = createMockFile('video.mp4', 1024 * 1024)
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should accept a valid webm file', () => {
      const file = createMockFile('clip.webm', 1024 * 1024, 'video/webm')
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should accept a valid mov file', () => {
      const file = createMockFile('movie.mov', 1024 * 1024, 'video/quicktime')
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should accept a valid avi file', () => {
      const file = createMockFile('video.avi', 1024 * 1024, 'video/x-msvideo')
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should reject an unsupported format', () => {
      const file = createMockFile('video.mkv', 1024 * 1024, 'video/x-matroska')
      const result = validateVideoFile(file)
      expect(result).toEqual({
        valid: false,
        error:
          'Unsupported format. Please upload mp4, webm, mov, or avi files.',
      })
    })

    it('should reject a file with no extension', () => {
      const file = createMockFile('noextension', 1024 * 1024)
      const result = validateVideoFile(file)
      expect(result).toEqual({
        valid: false,
        error:
          'Unsupported format. Please upload mp4, webm, mov, or avi files.',
      })
    })

    it('should reject a non-video file type', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf')
      const result = validateVideoFile(file)
      expect(result).toEqual({
        valid: false,
        error:
          'Unsupported format. Please upload mp4, webm, mov, or avi files.',
      })
    })

    it('should reject a file exceeding 10GB', () => {
      const file = createMockFile('huge.mp4', MAX_FILE_SIZE + 1)
      const result = validateVideoFile(file)
      expect(result).toEqual({
        valid: false,
        error: 'File exceeds the 10GB size limit.',
      })
    })

    it('should accept a file exactly at 10GB', () => {
      const file = createMockFile('max.mp4', MAX_FILE_SIZE)
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should handle case-insensitive extensions', () => {
      const file = createMockFile('video.MP4', 1024 * 1024)
      const result = validateVideoFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('should check format before size', () => {
      const file = createMockFile('huge.mkv', MAX_FILE_SIZE + 1)
      const result = validateVideoFile(file)
      expect(result.error).toBe(
        'Unsupported format. Please upload mp4, webm, mov, or avi files.'
      )
    })
  })
})
