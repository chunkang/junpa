'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { updateVideo } from '@/lib/actions/video-actions'
import type { Video } from '@/lib/schemas'

interface VideoEditFormProps {
  video: Video
}

export function VideoEditForm({ video }: VideoEditFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description ?? '')
  const [tagsInput, setTagsInput] = useState(video.tags.join(', '))
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  )
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setStatus('error')
      setErrorMessage('Title is required')
      return
    }

    setStatus('saving')
    setErrorMessage('')

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const result = await updateVideo(video.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      tags,
    })

    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
      router.refresh()
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Failed to save changes')
    }
  }

  function handleCancel() {
    setTitle(video.title)
    setDescription(video.description ?? '')
    setTagsInput(video.tags.join(', '))
    setStatus('idle')
    setErrorMessage('')
  }

  // Parse current tags for chip display
  const currentTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title field */}
      <div>
        <label
          htmlFor="video-title"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="video-title"
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
          disabled={status === 'saving'}
          placeholder="Enter video title"
        />
      </div>

      {/* Description field */}
      <div>
        <label
          htmlFor="video-description"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="video-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y'
          )}
          disabled={status === 'saving'}
          placeholder="Add a description for this video"
        />
      </div>

      {/* Tags field */}
      <div>
        <label
          htmlFor="video-tags"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Tags
        </label>
        <input
          id="video-tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          disabled={status === 'saving'}
          placeholder="Enter tags separated by commas"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Separate tags with commas (e.g. birthday, family, vacation)
        </p>

        {/* Tag chips preview */}
        {currentTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {currentTags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {status === 'success' && (
        <p className="text-sm text-green-600" role="status">
          Changes saved successfully.
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={status === 'saving'}
          className={cn(
            'inline-flex items-center rounded-md px-4 py-2',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          {status === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={status === 'saving'}
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
      </div>
    </form>
  )
}
