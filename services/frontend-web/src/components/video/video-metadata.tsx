import { cn } from "@/lib/utils/cn";

interface VideoMetadataProps {
  title: string;
  description: string | null;
  className?: string;
}

/**
 * Video metadata display component showing title and description
 * below the video player.
 */
export function VideoMetadata({
  title,
  description,
  className,
}: VideoMetadataProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-xl font-bold tracking-tight md:text-2xl">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );
}
