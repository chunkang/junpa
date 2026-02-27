import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Loading skeleton component that renders placeholder cards
 * matching the VideoCard shape for consistent loading states.
 */
export function LoadingSkeleton({ count = 1, className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading"
          className="overflow-hidden rounded-lg border border-border"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
