import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatDuration } from "@/lib/utils/format-duration";

interface VideoCardProps {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string | null;
  description?: string | null;
  className?: string;
}

/**
 * Video card component displaying thumbnail, title, and duration badge.
 * Links to the watch page for the video.
 */
export function VideoCard({
  id,
  title,
  duration,
  thumbnailUrl,
  className,
}: VideoCardProps) {
  return (
    <Link
      href={`/watch/${id}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent",
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-muted"
            aria-label="Video thumbnail placeholder"
          >
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(duration)}
        </span>
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {title}
        </h3>
      </div>
    </Link>
  );
}
