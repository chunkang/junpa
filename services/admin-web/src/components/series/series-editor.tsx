'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import { updateSeries } from '@/lib/actions/series-actions'
import { renumberEpisodes, sortEpisodesByUploadDate } from '@/lib/series-utils'
import { SeriesForm } from '@/components/series/series-form'
import { EpisodePicker } from '@/components/series/episode-picker'
import type { Series, SeriesEpisode, Video } from '@/lib/schemas'

interface SeriesEditorProps {
  series: Series
  videos: Video[]
}

export function SeriesEditor({ series, videos }: SeriesEditorProps) {
  const router = useRouter()
  const [episodes, setEpisodes] = useState<SeriesEpisode[]>(series.episodes)
  const [showPicker, setShowPicker] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  const videoMap = new Map(videos.map((v) => [v.id, v]))

  // Filter videos not already in the episode list
  const availableVideos = videos.filter(
    (v) => !episodes.some((ep) => ep.videoId === v.id)
  )

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
      setDragOverIndex(null)

      if (dragIndex === null || dragIndex === dropIndex) {
        setDragIndex(null)
        return
      }

      setEpisodes((prev) => {
        const updated = [...prev]
        const [moved] = updated.splice(dragIndex, 1)
        updated.splice(dropIndex, 0, moved)
        return renumberEpisodes(updated)
      })

      setDragIndex(null)
    },
    [dragIndex]
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  // Episode management
  function handleAddEpisodes(videoIds: string[]) {
    setEpisodes((prev) => {
      const newEpisodes: SeriesEpisode[] = videoIds.map((videoId, i) => ({
        videoId,
        episodeNumber: prev.length + i + 1,
      }))
      return [...prev, ...newEpisodes]
    })
    setShowPicker(false)
  }

  function handleRemoveEpisode(videoId: string) {
    setEpisodes((prev) => {
      const filtered = prev.filter((ep) => ep.videoId !== videoId)
      return renumberEpisodes(filtered)
    })
  }

  function handleEpisodeTitleChange(videoId: string, title: string) {
    setEpisodes((prev) =>
      prev.map((ep) =>
        ep.videoId === videoId
          ? { ...ep, title: title.trim() || undefined }
          : ep
      )
    )
  }

  function handleAutoOrder() {
    setEpisodes((prev) => sortEpisodesByUploadDate(prev, videos))
  }

  async function handleSaveEpisodes() {
    setSaving(true)
    setSaveStatus('idle')
    setErrorMessage('')

    const result = await updateSeries(series.id, { episodes })

    if (result.success) {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
      router.refresh()
    } else {
      setSaveStatus('error')
      setErrorMessage(result.error ?? 'Failed to save episodes')
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Section A: Series settings */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Series Settings
        </h3>
        <SeriesForm mode="edit" series={series} />
      </div>

      {/* Section B: Episode list management */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Episodes ({episodes.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoOrder}
              disabled={episodes.length < 2 || saving}
              className={cn(
                'inline-flex items-center rounded-md border border-input px-3 py-1.5',
                'bg-background text-sm font-medium text-foreground',
                'transition-colors hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              Auto-order by Date
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              disabled={saving}
              className={cn(
                'inline-flex items-center rounded-md px-3 py-1.5',
                'bg-primary text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              Add Episode
            </button>
          </div>
        </div>

        {/* Episode list */}
        {episodes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No episodes yet. Add videos to this series.
          </p>
        ) : (
          <div className="space-y-1">
            {episodes.map((episode, index) => {
              const video = videoMap.get(episode.videoId)
              const isDragging = dragIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <div
                  key={episode.videoId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-3 rounded-md border border-border px-3 py-2',
                    'transition-colors',
                    isDragging && 'opacity-50',
                    isDragOver && 'border-primary bg-primary/5',
                    !isDragging && !isDragOver && 'bg-background'
                  )}
                >
                  {/* Drag handle */}
                  <span
                    className="cursor-grab select-none text-muted-foreground active:cursor-grabbing"
                    aria-label="Drag to reorder"
                  >
                    ☰
                  </span>

                  {/* Episode number */}
                  <span className="w-8 flex-shrink-0 text-center text-sm font-medium text-muted-foreground">
                    #{episode.episodeNumber}
                  </span>

                  {/* Video title */}
                  <span className="min-w-0 flex-shrink-0 truncate text-sm font-medium text-foreground">
                    {video?.title ?? 'Unknown video'}
                  </span>

                  {/* Episode-specific title (editable inline) */}
                  <input
                    type="text"
                    value={episode.title ?? ''}
                    onChange={(e) =>
                      handleEpisodeTitleChange(episode.videoId, e.target.value)
                    }
                    placeholder="Episode title (optional)"
                    className={cn(
                      'min-w-0 flex-1 rounded border border-transparent bg-transparent px-2 py-0.5',
                      'text-sm text-muted-foreground placeholder:text-muted-foreground/50',
                      'focus:border-input focus:outline-none focus:ring-1 focus:ring-ring'
                    )}
                  />

                  {/* Duration */}
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {video ? formatDuration(video.duration) : '--:--'}
                  </span>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveEpisode(episode.videoId)}
                    disabled={saving}
                    className={cn(
                      'flex-shrink-0 rounded p-1 text-muted-foreground',
                      'transition-colors hover:bg-destructive/10 hover:text-destructive',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    )}
                    aria-label={`Remove ${video?.title ?? 'episode'}`}
                  >
                    X
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Episode picker overlay */}
        {showPicker && (
          <div className="mt-4">
            <EpisodePicker
              availableVideos={availableVideos}
              onAdd={handleAddEpisodes}
              onCancel={() => setShowPicker(false)}
            />
          </div>
        )}

        {/* Save episodes button */}
        {episodes.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            {saveStatus === 'success' && (
              <p className="mb-2 text-sm text-green-600" role="status">
                Episodes saved successfully.
              </p>
            )}
            {saveStatus === 'error' && errorMessage && (
              <p className="mb-2 text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleSaveEpisodes}
              disabled={saving}
              className={cn(
                'inline-flex items-center rounded-md px-4 py-2',
                'bg-primary text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {saving ? 'Saving...' : 'Save Episodes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
