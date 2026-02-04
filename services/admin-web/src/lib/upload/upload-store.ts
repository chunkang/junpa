import { create } from 'zustand'

export interface UploadItem {
  id: string
  filename: string
  fileSize: number
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  estimatedTimeRemaining?: number // seconds
}

export interface UploadStore {
  uploads: UploadItem[]
  addUpload: (item: Omit<UploadItem, 'progress' | 'status'>) => void
  updateProgress: (
    id: string,
    progress: number,
    estimatedTime?: number
  ) => void
  completeUpload: (id: string) => void
  failUpload: (id: string, error: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],

  addUpload: (item) =>
    set((state) => ({
      uploads: [
        ...state.uploads,
        { ...item, progress: 0, status: 'pending' as const },
      ],
    })),

  updateProgress: (id, progress, estimatedTime) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress,
              status: 'uploading' as const,
              estimatedTimeRemaining: estimatedTime,
            }
          : upload
      ),
    })),

  completeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress: 100,
              status: 'complete' as const,
              estimatedTimeRemaining: undefined,
            }
          : upload
      ),
    })),

  failUpload: (id, error) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id
          ? { ...upload, status: 'error' as const, error }
          : upload
      ),
    })),

  removeUpload: (id) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.status !== 'complete'),
    })),
}))
