import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface SiteHeaderProps {
  className?: string;
}

/**
 * Site header component with logo, navigation links.
 * Renders as a Server Component (no "use client" needed).
 */
export function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-lg font-bold">Junpa</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
