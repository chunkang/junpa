'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  removeFeaturedItem,
  reorderFeaturedItems,
} from '@/lib/actions/featured-actions'
import type { FeaturedItemWithDetails } from '@/lib/actions/featured-actions'
import type { FeaturedItem } from '@/lib/schemas'

interface FeaturedEditorProps {
  items: FeaturedItemWithDetails[]
  onAddClick: () => void
}

const typeBadgeStyles: Record<string, string> = {
  video: 'bg-blue-100 text-blue-800',
  playlist: 'bg-green-100 text-green-800',
  series: 'bg-purple-100 text-purple-800',
}

const typeLabels: Record<string, string> = {
  video: 'Video',
  playlist: 'Playlist',
  series: 'Series',
}

export function FeaturedEditor({ items, onAddClick }: FeaturedEditorProps) {
  const router = useRouter()
  const [localItems, setLocalItems] =
    useState<FeaturedItemWithDetails[]>(items)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  async function handleRemove(contentId: string) {
    const result = await removeFeaturedItem(contentId)
    if (result.success) {
      setLocalItems((prev) =>
        prev.filter((item) => item.contentId !== contentId)
      )
      router.refresh()
    }
  }

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

      setLocalItems((prev) => {
        const updated = [...prev]
        const [moved] = updated.splice(fromIndex, 1)
        updated.splice(dropIndex, 0, moved)
        return updated.map((item, i) => ({ ...item, priority: i }))
      })

      setHasChanges(true)
      setDragIndex(null)
      setDragOverIndex(null)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  async function handleSaveOrder() {
    setSaving(true)
    setStatus('idle')
    setErrorMessage('')

    const featuredItems: FeaturedItem[] = localItems.map((item, i) => ({
      contentType: item.contentType,
      contentId: item.contentId,
      priority: i,
      featuredAt: item.featuredAt,
    }))

    const result = await reorderFeaturedItems(featuredItems)

    setSaving(false)
    if (result.success) {
      setStatus('success')
      setHasChanges(false)
      setTimeout(() => setStatus('idle'), 2000)
      router.refresh()
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Failed to save order')
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Featured Content
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {localItems.length} / 10 featured items
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          disabled={localItems.length >= 10}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-3 py-2',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          + Add Featured
        </button>
      </div>

      {localItems.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No featured content. Mark videos, playlists, or series as featured.
          </p>
        </div>
      ) : (
        <div className="space-y-1" role="list" aria-label="Featured items">
          {localItems.map((item, index) => {
            const isDragging = dragIndex === index
            const isDragOver = dragOverIndex === index

            return (
              <div
                key={item.contentId}
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

                {/* Priority number */}
                <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>

                {/* Type badge */}
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    typeBadgeStyles[item.contentType] ?? 'bg-gray-100 text-gray-800'
                  )}
                >
                  {typeLabels[item.contentType] ?? item.contentType}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.contentId)}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs text-muted-foreground',
                    'transition-colors hover:bg-destructive/10 hover:text-destructive',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                  aria-label={`Remove ${item.title} from featured`}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Feedback messages */}
      {status === 'success' && (
        <p className="mt-3 text-sm text-green-600" role="status">
          Order saved successfully.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Save order button */}
      {hasChanges && localItems.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={saving}
            className={cn(
              'inline-flex items-center rounded-md px-4 py-2',
              'bg-primary text-sm font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      )}
    </div>
  )
}
