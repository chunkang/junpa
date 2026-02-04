'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import type { Video } from '@/lib/schemas'

interface VideoPickerProps {
  availableVideos: Video[]
  onAdd: (videoIds: string[]) => void
  onClose: () => void
}

export function VideoPicker({
  availableVideos,
  onAdd,
  onClose,
}: VideoPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleVideo(videoId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(videoId)) {
        next.delete(videoId)
      } else {
        next.add(videoId)
      }
      return next
    })
  }

  function handleAdd() {
    onAdd(Array.from(selected))
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h4 className="text-sm font-semibold text-foreground">
          Add Videos to Playlist
        </h4>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'rounded-md p-1 text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Close video picker"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        {availableVideos.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            No more videos available to add.
          </p>
        ) : (
          <ul className="space-y-1" role="list">
            {availableVideos.map((video) => (
              <li key={video.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2',
                    'transition-colors hover:bg-accent',
                    selected.has(video.id) && 'bg-accent'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(video.id)}
                    onChange={() => toggleVideo(video.id)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="flex-1 truncate text-sm text-foreground">
                    {video.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(video.duration)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'inline-flex items-center rounded-md border border-input px-3 py-1.5',
            'bg-background text-sm font-medium text-foreground',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={selected.size === 0}
          className={cn(
            'inline-flex items-center rounded-md px-3 py-1.5',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          Add Selected ({selected.size})
        </button>
      </div>
    </div>
  )
}
