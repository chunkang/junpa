import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import { getPlaylists } from '@/lib/actions/playlist-actions'
import { getVideos } from '@/lib/actions/video-actions'
import { calculatePlaylistDuration } from '@/lib/playlist-utils'

export default async function PlaylistsPage() {
  const [playlists, videos] = await Promise.all([getPlaylists(), getVideos()])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Playlists</h2>
        <Link
          href="/playlists/new"
          className={cn(
            'inline-flex items-center gap-2 rounded-md px-4 py-2',
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
          Create New Playlist
        </Link>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <svg
            className="mb-4 h-16 w-16 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
            />
          </svg>
          <h3 className="text-lg font-medium text-foreground">
            No playlists yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            No playlists yet. Create your first playlist.
          </p>
          <Link
            href="/playlists/new"
            className={cn(
              'mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2',
              'bg-primary text-sm font-medium text-primary-foreground',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            Create Your First Playlist
          </Link>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          )}
        >
          {playlists.map((playlist) => {
            const duration = calculatePlaylistDuration(playlist.items, videos)
            return (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                className={cn(
                  'group block overflow-hidden rounded-lg border border-border',
                  'bg-card transition-shadow hover:shadow-md'
                )}
              >
                {/* Header area */}
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-muted">
                  <div
                    className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-accent"
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
                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                      />
                    </svg>
                    <span className="mt-2 text-sm text-muted-foreground/60">
                      {playlist.items.length}{' '}
                      {playlist.items.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>

                  {/* Duration badge */}
                  <span
                    className={cn(
                      'absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5',
                      'text-xs font-medium text-white'
                    )}
                  >
                    {formatDuration(duration)}
                  </span>

                  {/* Loop indicator */}
                  {playlist.loop && (
                    <span
                      className={cn(
                        'absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5',
                        'text-xs text-white'
                      )}
                      title="Loop enabled"
                    >
                      Loop
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-3">
                  <h3
                    className="truncate text-sm font-medium text-card-foreground"
                    title={playlist.title}
                  >
                    {playlist.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {playlist.items.length}{' '}
                      {playlist.items.length === 1 ? 'video' : 'videos'}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                  {playlist.description && (
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {playlist.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
