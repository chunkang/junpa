import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDuration, formatFileSize } from '@/lib/format'
import type { Video } from '@/lib/schemas'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={`/library/${video.id}`}
      className={cn(
        'group block overflow-hidden rounded-lg border border-border',
        'bg-card transition-shadow hover:shadow-md'
      )}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {video.thumbnailPath ? (
          <img
            src={video.thumbnailPath}
            alt={`Thumbnail for ${video.title}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center',
              'bg-gradient-to-br from-primary/20 via-primary/10 to-accent'
            )}
            aria-hidden="true"
          >
            <svg
              className="h-12 w-12 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        )}

        {/* Duration badge */}
        <span
          className={cn(
            'absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5',
            'text-xs font-medium text-white'
          )}
        >
          {formatDuration(video.duration)}
        </span>

        {/* Format badge */}
        <span
          className={cn(
            'absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5',
            'text-xs uppercase text-white'
          )}
        >
          {video.format}
        </span>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3
          className="truncate text-sm font-medium text-card-foreground"
          title={video.title}
        >
          {video.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(video.fileSize)}</span>
          <span aria-hidden="true">·</span>
          {/* Source indicator */}
          {video.source === 'google-photos' ? (
            <span className="flex items-center gap-1" title="Google Photos">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Cloud
            </span>
          ) : (
            <span className="flex items-center gap-1" title="Local file">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Local
            </span>
          )}
        </div>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {video.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-block rounded-full bg-secondary px-2 py-0.5',
                  'text-[11px] text-secondary-foreground'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
