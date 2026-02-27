import { VideoStreamResponseSchema } from "@/lib/schemas/api-responses";
import type { VideoStreamResponse } from "@/lib/schemas/api-responses";

const BASE_URL =
  process.env.NEXT_PUBLIC_STREAMER_API_URL || "http://localhost:8000/api/v1";

/**
 * Custom error class for Streamer API errors.
 * Contains the HTTP status code and error message.
 */
export class StreamerApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StreamerApiError";
    this.status = status;
  }
}

/**
 * Fetch wrapper with Zod validation for the Streamer API.
 * Validates response data against the expected schema.
 *
 * @throws StreamerApiError on HTTP error responses
 * @throws Error on network errors or validation failures
 */
async function apiFetch<T>(
  path: string,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new StreamerApiError(0, "Network error: unable to reach server");
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Use default detail
    }

    if (response.status === 404) {
      throw new StreamerApiError(404, `Video not found: ${detail}`);
    }

    throw new StreamerApiError(response.status, detail);
  }

  const data = await response.json();
  return schema.parse(data);
}

/**
 * Fetch a video stream response by video ID.
 *
 * @param videoId - The video identifier
 * @returns Validated VideoStreamResponse
 * @throws StreamerApiError on API errors
 */
export async function getVideo(
  videoId: string,
): Promise<VideoStreamResponse> {
  return apiFetch(`/stream/${videoId}`, VideoStreamResponseSchema);
}
