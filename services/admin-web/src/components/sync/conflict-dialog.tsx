'use client'

import { cn } from '@/lib/utils'

interface ConflictDialogProps {
  localLastModified: string
  remoteLastModified: string
  onKeepLocal: () => void
  onKeepRemote: () => void
  onMerge: () => void
  onCancel: () => void
}

export function ConflictDialog({
  localLastModified,
  remoteLastModified,
  onKeepLocal,
  onKeepRemote,
  onMerge,
  onCancel,
}: ConflictDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
    >
      <div className="mx-4 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl">
        <h2
          id="conflict-dialog-title"
          className="text-lg font-semibold text-foreground"
        >
          Sync Conflict Detected
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The remote library has been modified since your last sync. Choose how
          to resolve this conflict.
        </p>

        {/* Comparison */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Local Version
            </p>
            <p className="mt-1 text-sm text-foreground">
              Last modified:{' '}
              {new Date(localLastModified).toLocaleString()}
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Remote Version
            </p>
            <p className="mt-1 text-sm text-foreground">
              Last modified:{' '}
              {new Date(remoteLastModified).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onKeepLocal}
            className={cn(
              'inline-flex items-center rounded-md px-4 py-2',
              'bg-primary text-sm font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Keep Local
          </button>
          <button
            type="button"
            onClick={onKeepRemote}
            className={cn(
              'inline-flex items-center rounded-md border border-border px-4 py-2',
              'bg-background text-sm font-medium text-foreground',
              'transition-colors hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Keep Remote
          </button>
          <button
            type="button"
            onClick={onMerge}
            className={cn(
              'inline-flex items-center rounded-md border border-border px-4 py-2',
              'bg-background text-sm font-medium text-foreground',
              'transition-colors hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Merge
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'inline-flex items-center rounded-md px-4 py-2',
              'text-sm font-medium text-muted-foreground',
              'transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
