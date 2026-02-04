import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/format'
import { getAllSeries } from '@/lib/actions/series-actions'
import { getVideos } from '@/lib/actions/video-actions'
import { calculateSeriesTotalDuration } from '@/lib/series-utils'

export default async function SeriesListPage() {
  const [series, videos] = await Promise.all([getAllSeries(), getVideos()])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Series</h2>
        <Link
          href="/series/new"
          className={cn(
            'inline-flex items-center rounded-md px-4 py-2',
            'bg-primary text-sm font-medium text-primary-foreground',
            'transition-colors hover:bg-primary/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
        >
          Create New Series
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-muted-foreground">
            No series yet. Create your first series.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => {
            const totalDuration = calculateSeriesTotalDuration(
              s.episodes,
              videos
            )
            return (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className={cn(
                  'group block rounded-lg border border-border bg-card p-5',
                  'transition-shadow hover:shadow-md'
                )}
              >
                <h3 className="truncate text-base font-semibold text-card-foreground">
                  {s.title}
                </h3>

                {s.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {s.episodes.length}{' '}
                    {s.episodes.length === 1 ? 'episode' : 'episodes'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDuration(totalDuration)}</span>
                  {s.autoPlay && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span
                        className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700"
                        title="Auto-play enabled"
                      >
                        Auto-Play
                      </span>
                    </>
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
