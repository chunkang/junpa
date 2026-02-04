'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import { calculatePlaylistDuration } from '@/lib/playlist-utils'
import { updatePlaylist } from '@/lib/actions/playlist-actions'
import { PlaylistForm } from '@/components/playlist/playlist-form'
import { VideoPicker } from '@/components/playlist/video-picker'
import type { Playlist, PlaylistItem, Video } from '@/lib/schemas'

interface PlaylistEditorProps {
  playlist: Playlist
  allVideos: Video[]
}

export function PlaylistEditor({ playlist, allVideos }: PlaylistEditorProps) {
  const router = useRouter()
  const [items, setItems] = useState<PlaylistItem[]>(playlist.items)
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const videoMap = new Map(allVideos.map((v) => [v.id, v]))

  const availableVideos = allVideos.filter(
    (v) => !items.some((item) => item.videoId === v.id)
  )

  const totalDuration = calculatePlaylistDuration(items, allVideos)

  async function handleSaveSettings(data: {
    title: string
    description?: string
    loop: boolean
  }) {
    setSaving(true)
    setStatus('idle')
    setErrorMessage('')

    const result = await updatePlaylist(playlist.id, {
      title: data.title,
      description: data.description,
      loop: data.loop,
      items,
    })

    setSaving(false)
    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
      router.refresh()
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Failed to save changes')
    }
  }

  function handleAddVideos(videoIds: string[]) {
    const newItems: PlaylistItem[] = videoIds.map((videoId, i) => ({
      videoId,
      order: items.length + i,
    }))
    setItems((prev) => [...prev, ...newItems])
    setShowPicker(false)
  }

  function handleRemoveItem(videoId: string) {
    setItems((prev) =>
      prev
        .filter((item) => item.videoId !== videoId)
        .map((item, i) => ({ ...item, order: i }))
    )
  }

  function handleStartAtChange(videoId: string, value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.videoId === videoId
          ? { ...item, startAt: value || undefined }
          : item
      )
    )
  }

  // Drag-and-drop handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDragIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(index))
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverIndex(index)
    },
    []
  )

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault()
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)

      if (isNaN(fromIndex) || fromIndex === dropIndex) {
        setDragIndex(null)
        setDragOverIndex(null)
        return
      }

      setItems((prev) => {
        const updated = [...prev]
        const [moved] = updated.splice(fromIndex, 1)
        updated.splice(dropIndex, 0, moved)
        return updated.map((item, i) => ({ ...item, order: i }))
      })

      setDragIndex(null)
      setDragOverIndex(null)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  async function handleSaveItems() {
    setSaving(true)
    setStatus('idle')
    setErrorMessage('')

    const result = await updatePlaylist(playlist.id, { items })

    setSaving(false)
    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
      router.refresh()
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Failed to save changes')
    }
  }

  return (
    <div className="space-y-8">
      {/* Playlist settings section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Playlist Settings
        </h3>
        <PlaylistForm
          initialTitle={playlist.title}
          initialDescription={playlist.description ?? ''}
          initialLoop={playlist.loop}
          onSave={handleSaveSettings}
          saving={saving}
        />
      </div>

      {/* Video list management section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Videos</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'video' : 'videos'}
              {' · '}
              Total duration: {formatDuration(totalDuration)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-2',
              'bg-primary text-sm font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Video
          </button>
        </div>

        {/* Video picker panel */}
        {showPicker && (
          <div className="mb-4">
            <VideoPicker
              availableVideos={availableVideos}
              onAdd={handleAddVideos}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}

        {/* Draggable video items */}
        {items.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No videos in this playlist. Click &quot;Add Video&quot; to get
              started.
            </p>
          </div>
        ) : (
          <div className="space-y-1" role="list" aria-label="Playlist videos">
            {items.map((item, index) => {
              const video = videoMap.get(item.videoId)
              if (!video) return null

              const isDragging = dragIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <div
                  key={item.videoId}
                  role="listitem"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2',
                    'transition-colors',
                    isDragging && 'opacity-50',
                    isDragOver && 'border-primary bg-primary/5'
                  )}
                >
                  {/* Drag handle */}
                  <span
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                    aria-hidden="true"
                  >
                    &#9776;
                  </span>

                  {/* Order number */}
                  <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>

                  {/* Video info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {video.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(video.duration)}
                    </p>
                  </div>

                  {/* Start time input */}
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor={`start-at-${item.videoId}`}
                      className="text-xs text-muted-foreground whitespace-nowrap"
                    >
                      Start at:
                    </label>
                    <input
                      id={`start-at-${item.videoId}`}
                      type="text"
                      value={item.startAt ?? ''}
                      onChange={(e) =>
                        handleStartAtChange(item.videoId, e.target.value)
                      }
                      placeholder="PT0S"
                      className={cn(
                        'w-24 rounded border border-input bg-background px-2 py-1',
                        'text-xs text-foreground placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-1 focus:ring-ring'
                      )}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.videoId)}
                    className={cn(
                      'rounded-md p-1 text-muted-foreground',
                      'transition-colors hover:bg-destructive/10 hover:text-destructive',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    aria-label={`Remove ${video.title} from playlist`}
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
              )
            })}
          </div>
        )}

        {/* Feedback messages */}
        {status === 'success' && (
          <p className="mt-3 text-sm text-green-600" role="status">
            Changes saved successfully.
          </p>
        )}
        {status === 'error' && errorMessage && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Save items button */}
        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveItems}
              disabled={saving}
              className={cn(
                'inline-flex items-center rounded-md px-4 py-2',
                'bg-primary text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {saving ? 'Saving...' : 'Save Video List'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
