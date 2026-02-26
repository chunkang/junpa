import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Custom 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
