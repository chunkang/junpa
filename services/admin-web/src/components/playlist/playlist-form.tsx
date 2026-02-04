'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PlaylistFormProps {
  initialTitle?: string
  initialDescription?: string
  initialLoop?: boolean
  onSave: (data: {
    title: string
    description?: string
    loop: boolean
  }) => Promise<void>
  onCancel?: () => void
  saving?: boolean
}

export function PlaylistForm({
  initialTitle = '',
  initialDescription = '',
  initialLoop = false,
  onSave,
  onCancel,
  saving = false,
}: PlaylistFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [loop, setLoop] = useState(initialLoop)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setError('')
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      loop,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title field */}
      <div>
        <label
          htmlFor="playlist-title"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="playlist-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          disabled={saving}
          placeholder="Enter playlist title"
        />
      </div>

      {/* Description field */}
      <div>
        <label
          htmlFor="playlist-description"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="playlist-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y'
          )}
          disabled={saving}
          placeholder="Add a description for this playlist"
        />
      </div>

      {/* Loop toggle */}
      <div className="flex items-center gap-3">
        <input
          id="playlist-loop"
          type="checkbox"
          checked={loop}
          onChange={(e) => setLoop(e.target.checked)}
          disabled={saving}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <label
          htmlFor="playlist-loop"
          className="text-sm font-medium text-foreground"
        >
          Loop playlist
        </label>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className={cn(
            'inline-flex items-center rounded-md px-4 py-2',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={cn(
              'inline-flex items-center rounded-md border border-input px-4 py-2',
              'bg-background text-sm font-medium text-foreground',
              'transition-colors hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
