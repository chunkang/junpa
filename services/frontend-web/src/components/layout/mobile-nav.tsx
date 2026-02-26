"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile navigation component with hamburger menu toggle.
 * Uses "use client" directive for interactive state management.
 */
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {isOpen && (
        <nav
          className={cn(
            "absolute left-0 top-14 z-50 w-full border-b border-border bg-background p-4",
          )}
        >
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
