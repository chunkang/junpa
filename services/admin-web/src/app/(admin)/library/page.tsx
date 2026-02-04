import { getVideos } from '@/lib/actions/video-actions'
import { VideoGrid } from '@/components/video/video-grid'

export default async function LibraryPage() {
  const videos = await getVideos()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Video Library</h2>
        <span className="text-sm text-muted-foreground">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>
      <VideoGrid videos={videos} />
    </div>
  )
}
