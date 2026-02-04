'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { deleteVideo } from '@/lib/actions/video-actions'

interface DeleteVideoDialogProps {
  videoId: string
  videoTitle: string
}

export function DeleteVideoDialog({
  videoId,
  videoTitle,
}: DeleteVideoDialogProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [deleteFile, setDeleteFile] = useState(false)
  const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function openDialog() {
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    dialogRef.current?.close()
    setDeleteFile(false)
    setStatus('idle')
    setErrorMessage('')
  }

  async function handleConfirm() {
    setStatus('deleting')
    setErrorMessage('')

    const result = await deleteVideo(videoId, deleteFile)

    if (result.success) {
      closeDialog()
      router.push('/library')
      router.refresh()
    } else {
      setStatus('error')
      setErrorMessage(result.error ?? 'Failed to delete video')
    }
  }

  // Close on Escape key (native dialog behavior) and reset state
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function handleClose() {
      setDeleteFile(false)
      setStatus('idle')
      setErrorMessage('')
    }

    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  return (
    <>
      {/* Delete trigger button */}
      <button
        type="button"
        onClick={openDialog}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-4 py-2',
          'bg-destructive text-sm font-medium text-white',
          'transition-colors hover:bg-destructive/90',
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
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
        Delete
      </button>

      {/* Dialog */}
      <dialog
        ref={dialogRef}
        className={cn(
          'w-full max-w-md rounded-lg border border-border bg-background p-0',
          'shadow-lg backdrop:bg-black/50',
          'open:animate-in open:fade-in-0 open:zoom-in-95'
        )}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <div className="p-6">
          <h2
            id="delete-dialog-title"
            className="text-lg font-semibold text-foreground"
          >
            Delete Video
          </h2>
          <p
            id="delete-dialog-description"
            className="mt-2 text-sm text-muted-foreground"
          >
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{videoTitle}</span>?
            This action cannot be undone.
          </p>

          {/* Delete file checkbox */}
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={deleteFile}
              onChange={(e) => setDeleteFile(e.target.checked)}
              disabled={status === 'deleting'}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <span className="text-sm text-foreground">
              Also delete source file from storage
            </span>
          </label>

          {/* Error message */}
          {status === 'error' && errorMessage && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeDialog}
              disabled={status === 'deleting'}
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
            <button
              type="button"
              onClick={handleConfirm}
              disabled={status === 'deleting'}
              className={cn(
                'inline-flex items-center rounded-md px-4 py-2',
                'bg-destructive text-sm font-medium text-white',
                'transition-colors hover:bg-destructive/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {status === 'deleting' ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
