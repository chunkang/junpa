import { cn } from "@/lib/utils/cn";

interface SiteFooterProps {
  className?: string;
}

/**
 * Site footer component with copyright information.
 * Renders as a Server Component.
 */
export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border py-6 md:py-0",
        className,
      )}
    >
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Junpa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
