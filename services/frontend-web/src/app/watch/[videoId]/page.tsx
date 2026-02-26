import type { Metadata } from "next";
import { WatchClient } from "./watch-client";

interface WatchPageProps {
  params: Promise<{ videoId: string }>;
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { videoId } = await params;
  return {
    title: `Watch ${videoId}`,
  };
}

/**
 * Server Component shell for the video watch page.
 * Passes the videoId param to the client component.
 */
export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  return <WatchClient videoId={videoId} />;
}
