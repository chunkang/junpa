'use client'

import { useUploadStore } from '@/lib/upload/upload-store'
import { cn } from '@/lib/utils'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${seconds}s remaining`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s remaining`
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-400', textColor: 'text-gray-600' },
  uploading: { label: 'Uploading', color: 'bg-blue-500', textColor: 'text-blue-600' },
  complete: { label: 'Complete', color: 'bg-green-500', textColor: 'text-green-600' },
  error: { label: 'Error', color: 'bg-red-500', textColor: 'text-red-600' },
} as const

export function UploadProgress() {
  const { uploads, removeUpload, clearCompleted } = useUploadStore()

  if (uploads.length === 0) {
    return null
  }

  const hasCompleted = uploads.some((u) => u.status === 'complete')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Uploads ({uploads.length})
        </h3>
        {hasCompleted && (
          <button
            onClick={clearCompleted}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>

      <ul className="space-y-2" aria-label="Upload progress list">
        {uploads.map((upload) => {
          const config = statusConfig[upload.status]

          return (
            <li
              key={upload.id}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {upload.status === 'complete' && (
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    )}
                    {upload.status === 'error' && (
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                    )}
                    <p className="truncate text-sm font-medium text-gray-900">
                      {upload.filename}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(upload.fileSize)}</span>
                    <span className={config.textColor}>{config.label}</span>
                    {upload.status === 'uploading' &&
                      upload.estimatedTimeRemaining !== undefined && (
                        <span>
                          {formatTimeRemaining(upload.estimatedTimeRemaining)}
                        </span>
                      )}
                  </div>
                </div>

                <button
                  onClick={() => removeUpload(upload.id)}
                  className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label={`Remove ${upload.filename}`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {(upload.status === 'uploading' || upload.status === 'pending') && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{upload.progress}%</span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200"
                    role="progressbar"
                    aria-valuenow={upload.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Upload progress for ${upload.filename}`}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        config.color
                      )}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {upload.status === 'error' && upload.error && (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {upload.error}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
