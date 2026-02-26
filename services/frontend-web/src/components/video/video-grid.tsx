import { VideoCard } from "./video-card";
import { cn } from "@/lib/utils/cn";

interface VideoGridItem {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string | null;
  description?: string | null;
}

interface VideoGridProps {
  videos: VideoGridItem[];
  className?: string;
}

/**
 * Responsive video grid component.
 * Displays 1 column on mobile, 2 on tablet, 3-4 on desktop.
 */
export function VideoGrid({ videos, className }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No videos available</p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {videos.map((video) => (
        <li key={video.id}>
          <VideoCard
            id={video.id}
            title={video.title}
            duration={video.duration}
            thumbnailUrl={video.thumbnailUrl}
            description={video.description}
          />
        </li>
      ))}
    </ul>
  );
}
