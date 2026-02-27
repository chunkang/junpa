"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Global error boundary page.
 * Must be a Client Component to use useEffect and reset.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-lg text-muted-foreground">
        An unexpected error occurred.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
