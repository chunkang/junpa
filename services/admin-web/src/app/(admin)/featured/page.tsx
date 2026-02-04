import { getFeaturedItems } from '@/lib/actions/featured-actions'
import { getVideos } from '@/lib/actions/video-actions'
import { getPlaylists } from '@/lib/actions/playlist-actions'
import { getAllSeries } from '@/lib/actions/series-actions'
import { FeaturedPageClient } from './featured-page-client'

export default async function FeaturedPage() {
  const [featuredItems, videos, playlists, series] = await Promise.all([
    getFeaturedItems(),
    getVideos(),
    getPlaylists(),
    getAllSeries(),
  ])

  const featuredIds = new Set(featuredItems.map((item) => item.contentId))

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Featured Content
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage which content appears in the featured section.
        </p>
      </div>
      <FeaturedPageClient
        featuredItems={featuredItems}
        videos={videos}
        playlists={playlists}
        series={series}
        featuredIds={featuredIds}
      />
    </div>
  )
}
