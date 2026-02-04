import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getVideoById } from '@/lib/actions/video-actions'
import { formatDuration, formatFileSize } from '@/lib/format'
import { VideoEditForm } from '@/components/video/video-edit-form'
import { DeleteVideoDialog } from '@/components/video/delete-video-dialog'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params
  const video = await getVideoById(id)

  if (!video) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/library"
              className="transition-colors hover:text-foreground"
            >
              Video Library
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-foreground">
            {video.title}
          </li>
        </ol>
      </nav>

      {/* Video preview area */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-video w-full bg-muted">
          {video.thumbnailPath ? (
            <img
              src={video.thumbnailPath}
              alt={`Thumbnail for ${video.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-accent"
              aria-hidden="true"
            >
              <svg
                className="h-20 w-20 text-muted-foreground/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Video metadata */}
        <div className="border-t border-border p-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="font-medium text-foreground">
                {formatDuration(video.duration)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">File Size</dt>
              <dd className="font-medium text-foreground">
                {formatFileSize(video.fileSize)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Format</dt>
              <dd className="font-medium uppercase text-foreground">
                {video.format}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="font-medium text-foreground">
                {video.source === 'google-photos' ? 'Google Photos' : 'Local'}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Filename</dt>
              <dd
                className="truncate font-medium text-foreground"
                title={video.filename}
              >
                {video.filename}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Uploaded</dt>
              <dd className="font-medium text-foreground">
                {new Date(video.uploadedAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium text-foreground">
                {new Date(video.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Edit form section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Edit Details
          </h3>
          <DeleteVideoDialog videoId={video.id} videoTitle={video.title} />
        </div>
        <VideoEditForm video={video} />
      </div>
    </div>
  )
}
