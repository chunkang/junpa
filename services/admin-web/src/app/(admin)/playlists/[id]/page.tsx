import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlaylistById } from '@/lib/actions/playlist-actions'
import { getVideos } from '@/lib/actions/video-actions'
import { PlaylistEditor } from '@/components/playlist/playlist-editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlaylistEditorPage({ params }: PageProps) {
  const { id } = await params
  const [playlist, videos] = await Promise.all([
    getPlaylistById(id),
    getVideos(),
  ])

  if (!playlist) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/playlists"
              className="transition-colors hover:text-foreground"
            >
              Playlists
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="truncate font-medium text-foreground">
            {playlist.title}
          </li>
        </ol>
      </nav>

      <PlaylistEditor playlist={playlist} allVideos={videos} />
    </div>
  )
}
