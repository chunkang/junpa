'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import type { Video } from '@/lib/schemas'

interface EpisodePickerProps {
  availableVideos: Video[]
  onAdd: (videoIds: string[]) => void
  onCancel: () => void
}

export function EpisodePicker({
  availableVideos,
  onAdd,
  onCancel,
}: EpisodePickerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleVideo(videoId: string) {
    setSelectedIds((prev) => {
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
    onAdd(Array.from(selectedIds))
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-semibold text-foreground">
        Select Videos to Add
      </h4>

      {availableVideos.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No more videos available to add.
        </p>
      ) : (
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {availableVideos.map((video) => (
            <label
              key={video.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2',
                'transition-colors hover:bg-accent',
                selectedIds.has(video.id) && 'bg-accent'
              )}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(video.id)}
                onChange={() => toggleVideo(video.id)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="flex-1 truncate text-sm text-foreground">
                {video.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(video.duration)}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(video.uploadedAt).toLocaleDateString()}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={selectedIds.size === 0}
          className={cn(
            'inline-flex items-center rounded-md px-3 py-1.5',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          Add Selected ({selectedIds.size})
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'inline-flex items-center rounded-md border border-input px-3 py-1.5',
            'bg-background text-sm font-medium text-foreground',
            'transition-colors hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
