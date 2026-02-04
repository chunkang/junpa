import { describe, it, expect, beforeEach } from 'vitest'
import { useUploadStore } from '@/lib/upload/upload-store'

describe('upload-store', () => {
  beforeEach(() => {
    // Reset the store state between tests
    useUploadStore.setState({ uploads: [] })
  })

  describe('addUpload', () => {
    it('should add an upload with pending status and 0 progress', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'video.mp4',
        fileSize: 1024,
      })

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(1)
      expect(uploads[0]).toEqual({
        id: 'test-1',
        filename: 'video.mp4',
        fileSize: 1024,
        progress: 0,
        status: 'pending',
      })
    })

    it('should add multiple uploads', () => {
      const { addUpload } = useUploadStore.getState()

      addUpload({ id: 'test-1', filename: 'a.mp4', fileSize: 100 })
      addUpload({ id: 'test-2', filename: 'b.mp4', fileSize: 200 })

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(2)
    })
  })

  describe('updateProgress', () => {
    it('should update progress and set status to uploading', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'video.mp4',
        fileSize: 1024,
      })

      useUploadStore.getState().updateProgress('test-1', 50, 30)

      const { uploads } = useUploadStore.getState()
      expect(uploads[0].progress).toBe(50)
      expect(uploads[0].status).toBe('uploading')
      expect(uploads[0].estimatedTimeRemaining).toBe(30)
    })

    it('should not affect other uploads', () => {
      const { addUpload } = useUploadStore.getState()
      addUpload({ id: 'test-1', filename: 'a.mp4', fileSize: 100 })
      addUpload({ id: 'test-2', filename: 'b.mp4', fileSize: 200 })

      useUploadStore.getState().updateProgress('test-1', 75)

      const { uploads } = useUploadStore.getState()
      expect(uploads[0].progress).toBe(75)
      expect(uploads[1].progress).toBe(0)
      expect(uploads[1].status).toBe('pending')
    })
  })

  describe('completeUpload', () => {
    it('should set status to complete and progress to 100', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'video.mp4',
        fileSize: 1024,
      })

      useUploadStore.getState().completeUpload('test-1')

      const { uploads } = useUploadStore.getState()
      expect(uploads[0].status).toBe('complete')
      expect(uploads[0].progress).toBe(100)
      expect(uploads[0].estimatedTimeRemaining).toBeUndefined()
    })
  })

  describe('failUpload', () => {
    it('should set status to error with error message', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'video.mp4',
        fileSize: 1024,
      })

      useUploadStore.getState().failUpload('test-1', 'Network error')

      const { uploads } = useUploadStore.getState()
      expect(uploads[0].status).toBe('error')
      expect(uploads[0].error).toBe('Network error')
    })
  })

  describe('removeUpload', () => {
    it('should remove the specified upload', () => {
      const { addUpload } = useUploadStore.getState()
      addUpload({ id: 'test-1', filename: 'a.mp4', fileSize: 100 })
      addUpload({ id: 'test-2', filename: 'b.mp4', fileSize: 200 })

      useUploadStore.getState().removeUpload('test-1')

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(1)
      expect(uploads[0].id).toBe('test-2')
    })

    it('should handle removing non-existent upload gracefully', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'a.mp4',
        fileSize: 100,
      })

      useUploadStore.getState().removeUpload('non-existent')

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(1)
    })
  })

  describe('clearCompleted', () => {
    it('should remove only completed uploads', () => {
      const { addUpload } = useUploadStore.getState()
      addUpload({ id: 'test-1', filename: 'a.mp4', fileSize: 100 })
      addUpload({ id: 'test-2', filename: 'b.mp4', fileSize: 200 })
      addUpload({ id: 'test-3', filename: 'c.mp4', fileSize: 300 })

      useUploadStore.getState().completeUpload('test-1')
      useUploadStore.getState().failUpload('test-2', 'Error')

      useUploadStore.getState().clearCompleted()

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(2)
      expect(uploads.map((u) => u.id)).toEqual(['test-2', 'test-3'])
    })

    it('should do nothing when no completed uploads exist', () => {
      useUploadStore.getState().addUpload({
        id: 'test-1',
        filename: 'a.mp4',
        fileSize: 100,
      })

      useUploadStore.getState().clearCompleted()

      const { uploads } = useUploadStore.getState()
      expect(uploads).toHaveLength(1)
    })
  })
})
