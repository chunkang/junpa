import Link from 'next/link'
import { getVideos } from '@/lib/actions/video-actions'
import { getPlaylists } from '@/lib/actions/playlist-actions'
import { getAllSeries } from '@/lib/actions/series-actions'
import { getFeaturedItems } from '@/lib/actions/featured-actions'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const [videos, playlists, series, featuredItems] = await Promise.all([
    getVideos(),
    getPlaylists(),
    getAllSeries(),
    getFeaturedItems(),
  ])

  const stats = [
    {
      label: 'Total Videos',
      value: videos.length,
      href: '/library',
    },
    {
      label: 'Total Playlists',
      value: playlists.length,
      href: '/playlists',
    },
    {
      label: 'Total Series',
      value: series.length,
      href: '/series',
    },
    {
      label: 'Featured Items',
      value: `${featuredItems.length} / 10`,
      href: '/featured',
    },
  ]

  const quickActions = [
    { label: 'Upload Video', href: '/upload' },
    { label: 'Create Playlist', href: '/playlists/new' },
    { label: 'Create Series', href: '/series/new' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-gray-600">
        Welcome to the Junpa Admin panel. Manage your content library below.
      </p>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              'rounded-lg border border-border bg-card p-5',
              'transition-colors hover:bg-muted/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'inline-flex items-center rounded-md px-4 py-2',
                'bg-primary text-sm font-medium text-primary-foreground',
                'transition-colors hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
