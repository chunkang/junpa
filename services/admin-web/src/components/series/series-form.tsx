'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createSeries, updateSeries } from '@/lib/actions/series-actions'
import type { Series } from '@/lib/schemas'

interface SeriesFormCreateProps {
  mode: 'create'
}

interface SeriesFormEditProps {
  mode: 'edit'
  series: Series
  onSaved?: () => void
}

type SeriesFormProps = SeriesFormCreateProps | SeriesFormEditProps

export function SeriesForm(props: SeriesFormProps) {
  const router = useRouter()
  const isEdit = props.mode === 'edit'
  const series = isEdit ? props.series : null

  const [title, setTitle] = useState(series?.title ?? '')
  const [description, setDescription] = useState(series?.description ?? '')
  const [autoPlay, setAutoPlay] = useState(series?.autoPlay ?? false)
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

    if (isEdit && series) {
      const result = await updateSeries(series.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        autoPlay,
      })

      if (result.success) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 2000)
        props.onSaved?.()
        router.refresh()
      } else {
        setStatus('error')
        setErrorMessage(result.error ?? 'Failed to save changes')
      }
    } else {
      const result = await createSeries({
        title: title.trim(),
        description: description.trim() || undefined,
      })

      if (result.success && result.seriesId) {
        router.push(`/series/${result.seriesId}`)
      } else {
        setStatus('error')
        setErrorMessage(result.error ?? 'Failed to create series')
      }
    }
  }

  function handleCancel() {
    if (isEdit) {
      setTitle(series?.title ?? '')
      setDescription(series?.description ?? '')
      setAutoPlay(series?.autoPlay ?? false)
      setStatus('idle')
      setErrorMessage('')
    } else {
      router.push('/series')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title field */}
      <div>
        <label
          htmlFor="series-title"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="series-title"
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
          placeholder="Enter series title"
        />
      </div>

      {/* Description field */}
      <div>
        <label
          htmlFor="series-description"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="series-description"
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
          disabled={status === 'saving'}
          placeholder="Add a description for this series"
        />
      </div>

      {/* Auto-play toggle */}
      <div className="flex items-center gap-2">
        <input
          id="series-autoplay"
          type="checkbox"
          checked={autoPlay}
          onChange={(e) => setAutoPlay(e.target.checked)}
          disabled={status === 'saving'}
          className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
        />
        <label
          htmlFor="series-autoplay"
          className="text-sm font-medium text-foreground"
        >
          Enable Auto-Play
        </label>
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
          {status === 'saving'
            ? 'Saving...'
            : isEdit
              ? 'Save Changes'
              : 'Create Series'}
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
