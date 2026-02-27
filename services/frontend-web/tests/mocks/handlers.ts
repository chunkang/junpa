import { http, HttpResponse } from "msw";
import { createVideoStreamResponse } from "./fixtures";

const BASE_URL =
  process.env.NEXT_PUBLIC_STREAMER_API_URL || "http://localhost:8000/api/v1";

export const handlers = [
  http.get(`${BASE_URL}/stream/:videoId`, ({ params }) => {
    const { videoId } = params;

    if (videoId === "not-found") {
      return HttpResponse.json(
        { detail: "Video not found" },
        { status: 404 },
      );
    }

    if (videoId === "server-error") {
      return HttpResponse.json(
        { detail: "Internal server error" },
        { status: 500 },
      );
    }

    return HttpResponse.json(
      createVideoStreamResponse({ id: videoId as string }),
    );
  }),
];
