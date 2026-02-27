import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ErrorFallbackProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Error fallback component with optional retry button.
 * Accessible with alert role for screen readers.
 */
export function ErrorFallback({
  message,
  onRetry,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6",
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
