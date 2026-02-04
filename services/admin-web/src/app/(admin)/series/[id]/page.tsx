import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSeriesById } from '@/lib/actions/series-actions'
import { getVideos } from '@/lib/actions/video-actions'
import { SeriesEditor } from '@/components/series/series-editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id } = await params
  const [series, videos] = await Promise.all([getSeriesById(id), getVideos()])

  if (!series) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/series"
              className="transition-colors hover:text-foreground"
            >
              Series
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-foreground">
            {series.title}
          </li>
        </ol>
      </nav>

      <SeriesEditor series={series} videos={videos} />
    </div>
  )
}
