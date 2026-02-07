---
id: SPEC-STREAM-001
version: "1.0.0"
status: "draft"
created: "2026-02-04"
updated: "2026-02-04"
author: "Chun Kang"
priority: "high"
---

# SPEC-STREAM-001: Acceptance Criteria

## Overview

This document defines the acceptance criteria for the Junpa Streamer Service. Each feature maps to requirements in the spec.md and implementation tasks in plan.md.

---

## Feature 1: Stream Authentication

**Requirements:** R1.1-R1.5

### AC1.1: OAuth Token Verification

**GIVEN** a request with a valid Google OAuth token in the Authorization header
**WHEN** the client accesses any protected streaming endpoint
**THEN** the system shall extract user credentials and proceed with the request
**AND** return HTTP 200 with the requested content

### AC1.2: Invalid Token Handling

**GIVEN** a request with an invalid or expired OAuth token
**WHEN** the client accesses a protected endpoint
**THEN** the system shall return HTTP 401 Unauthorized
**AND** include a JSON body with error details and refresh instructions

### AC1.3: Shareable Token Access

**GIVEN** a valid signed stream URL token
**WHEN** the client accesses the shareable URL without OAuth
**THEN** the system shall verify the token signature and expiration
**AND** serve the stream if valid

### AC1.4: Expired Shareable Token

**GIVEN** an expired signed stream URL token
**WHEN** the client accesses the shareable URL
**THEN** the system shall return HTTP 401 Unauthorized
**AND** indicate the token has expired

### AC1.5: Drive ID Protection

**GIVEN** any streaming URL or response
**WHEN** inspecting the URL path or response body
**THEN** the raw Google Drive file ID shall NOT be visible
**AND** only internal video IDs shall be exposed

---

## Feature 2: On-Demand Video Streaming

**Requirements:** R2.1-R2.6

### AC2.1: Video Metadata Retrieval

**GIVEN** a valid video ID from library.json
**WHEN** the client requests GET /api/v1/stream/{video_id}
**THEN** the system shall return HTTP 200
**AND** include video metadata (title, duration, format, thumbnail_url)

### AC2.2: Non-Existent Video

**GIVEN** a video ID not present in library.json
**WHEN** the client requests the video
**THEN** the system shall return HTTP 404 Not Found
**AND** include a descriptive error message

### AC2.3: HLS Master Playlist

**GIVEN** a valid video ID
**WHEN** the client requests GET /api/v1/stream/{video_id}/master.m3u8
**THEN** the system shall return HTTP 200 with Content-Type: application/vnd.apple.mpegurl
**AND** the playlist shall include variant stream references
**AND** conform to HLS specification version 3+

### AC2.4: HLS Segment Delivery

**GIVEN** a valid video ID and segment number
**WHEN** the client requests GET /api/v1/stream/{video_id}/segment_{n}.ts
**THEN** the system shall return HTTP 200 with Content-Type: video/mp2t
**AND** the segment shall be approximately 6 seconds duration

### AC2.5: HTTP Range Support

**GIVEN** a direct video stream request with Range header
**WHEN** the client requests partial content
**THEN** the system shall return HTTP 206 Partial Content
**AND** include Content-Range header with byte positions

### AC2.6: Video Seeking

**GIVEN** a video playing in the client
**WHEN** the user seeks to a specific timestamp
**THEN** the system shall serve the appropriate segment
**AND** playback shall resume from the requested position within 2 seconds

---

## Feature 3: Live Playlist Streaming

**Requirements:** R3.1-R3.6

### AC3.1: Live Position Calculation

**GIVEN** a playlist with start_at = "2026-02-04T10:00:00Z" and total_duration = 3600 seconds
**WHEN** a client connects at "2026-02-04T10:30:00Z"
**THEN** the system shall calculate position = 1800 seconds (30 minutes)
**AND** serve content starting at that position

### AC3.2: Live Playlist Info

**GIVEN** a valid playlist ID
**WHEN** the client requests GET /api/v1/live/{playlist_id}
**THEN** the system shall return HTTP 200
**AND** include current_video_id, position_in_video, time_until_next

### AC3.3: Live HLS Manifest

**GIVEN** a live playlist in progress
**WHEN** the client requests GET /api/v1/live/{playlist_id}/live.m3u8
**THEN** the system shall return a sliding window manifest
**AND** the manifest shall NOT include #EXT-X-ENDLIST
**AND** the manifest shall reflect current position

### AC3.4: Playlist Looping

**GIVEN** a playlist with loop = true and total_duration = 3600 seconds
**WHEN** a client connects 4000 seconds after start_at
**THEN** the system shall calculate position = 4000 % 3600 = 400 seconds
**AND** serve content from the looped position

### AC3.5: Non-Looping Playlist End

**GIVEN** a playlist with loop = false
**WHEN** current time exceeds playlist end time
**THEN** the system shall return a manifest with #EXT-X-ENDLIST
**AND** indicate the playlist has ended in metadata response

### AC3.6: Future Playlist

**GIVEN** a playlist with start_at in the future
**WHEN** a client requests the live stream
**THEN** the system shall return HTTP 200 with status = "coming_soon"
**AND** include countdown_seconds until start

### AC3.7: Video Transition

**GIVEN** a live playlist with video A (300s) followed by video B
**WHEN** position exceeds 300 seconds
**THEN** the system shall seamlessly transition to video B
**AND** the manifest shall reference video B segments

---

## Feature 4: Shareable URL Generation

**Requirements:** R4.1-R4.5

### AC4.1: URL Generation

**GIVEN** a valid video or playlist ID
**WHEN** an authenticated admin requests POST /api/v1/auth/stream-url
**THEN** the system shall return HTTP 200
**AND** include a signed URL with format /s/{token}/master.m3u8
**AND** include expires_at timestamp

### AC4.2: URL Signature Verification

**GIVEN** a valid signed URL
**WHEN** the client accesses the URL
**THEN** the system shall verify the cryptographic signature
**AND** serve the stream if valid

### AC4.3: Tampered URL Rejection

**GIVEN** a signed URL with modified token
**WHEN** the client accesses the URL
**THEN** the system shall return HTTP 403 Forbidden
**AND** include "Invalid signature" error message

### AC4.4: Custom Expiration

**GIVEN** a URL generation request with expires_in = 7200
**WHEN** the URL is generated
**THEN** the expires_at shall be current_time + 7200 seconds

### AC4.5: Shareable Segment Access

**GIVEN** a valid signed URL base token
**WHEN** the client requests /s/{token}/segment_5.ts
**THEN** the system shall serve the segment
**AND** verify the token for each segment request

---

## Feature 5: Google Drive Integration

**Requirements:** R5.1-R5.6

### AC5.1: Drive Authentication

**GIVEN** a user's OAuth credentials
**WHEN** initiating a stream
**THEN** the system shall authenticate with Google Drive API
**AND** access the user's /.junpa/ directory

### AC5.2: Library.json Retrieval

**GIVEN** a user with /.junpa/library.json in their Drive
**WHEN** the system fetches video metadata
**THEN** the library.json shall be retrieved successfully
**AND** cached for 60 seconds

### AC5.3: Streaming Without Download

**GIVEN** a video file in Google Drive
**WHEN** the video is streamed
**THEN** the system shall stream directly from Drive
**AND** NOT download the entire file to local storage

### AC5.4: Drive API Error Handling

**GIVEN** Google Drive API returns an error (rate limit, not found, etc.)
**WHEN** a stream is requested
**THEN** the system shall return appropriate HTTP status
**AND** include Google's error details in the response

### AC5.5: Library Cache Invalidation

**GIVEN** library.json was cached 65 seconds ago
**WHEN** a new request needs library data
**THEN** the system shall fetch fresh data from Drive
**AND** update the cache

---

## Feature 6: HLS Transmuxing

**Requirements:** R6.1-R6.5

### AC6.1: MP4 to HLS Conversion

**GIVEN** an mp4 video file
**WHEN** HLS streaming is requested
**THEN** the system shall transmux to HLS format
**AND** generate valid .m3u8 and .ts files

### AC6.2: Segment Duration

**GIVEN** any HLS segment generated
**WHEN** measuring the segment duration
**THEN** the duration shall be approximately 6 seconds
**AND** the last segment may be shorter

### AC6.3: Manifest Validity

**GIVEN** a generated HLS manifest
**WHEN** validating against HLS specification
**THEN** the manifest shall include required tags (#EXTM3U, #EXT-X-VERSION)
**AND** segment durations shall not exceed #EXT-X-TARGETDURATION

### AC6.4: Unsupported Format Rejection

**GIVEN** a video file in unsupported format (e.g., .mkv with incompatible codec)
**WHEN** HLS streaming is requested
**THEN** the system shall return HTTP 415 Unsupported Media Type
**AND** include supported formats in error message

### AC6.5: WebM Support

**GIVEN** a webm video file
**WHEN** HLS streaming is requested
**THEN** the system shall transmux to HLS format
**AND** generate valid segments

---

## Feature 7: Health and Monitoring

**Requirements:** R7.1-R7.4

### AC7.1: Health Check Endpoint

**GIVEN** the service is running
**WHEN** GET /api/v1/health is called
**THEN** the system shall return HTTP 200
**AND** include status: "healthy" or "degraded"

### AC7.2: Drive Connectivity Check

**GIVEN** the health endpoint is called
**WHEN** Google Drive API is accessible
**THEN** the health response shall include drive_status: "connected"

### AC7.3: Drive Connectivity Failure

**GIVEN** Google Drive API is not accessible
**WHEN** the health endpoint is called
**THEN** the system shall return status: "degraded"
**AND** include drive_status: "disconnected"

### AC7.4: Structured Logging

**GIVEN** any API request
**WHEN** an error occurs
**THEN** the system shall log structured JSON with correlation_id
**AND** include request path, method, and error details

### AC7.5: Request Correlation

**GIVEN** a request with X-Correlation-ID header
**WHEN** the request is processed
**THEN** all log entries shall include the same correlation_id
**AND** the response shall include the correlation_id header

---

## Performance Acceptance Criteria

### P1: Streaming Latency

**GIVEN** an on-demand video request
**WHEN** the first segment is requested
**THEN** time to first byte shall be less than 2 seconds

### P2: Live Position Accuracy

**GIVEN** a live playlist
**WHEN** comparing calculated position to wall clock
**THEN** drift shall not exceed 1 second

### P3: Concurrent Streams

**GIVEN** 100 concurrent viewers on the same playlist
**WHEN** all are streaming
**THEN** all viewers shall receive segments without timeout

### P4: Memory Efficiency

**GIVEN** streaming a 4GB video
**WHEN** monitoring server memory
**THEN** memory usage shall not exceed 512MB per stream

---

## Security Acceptance Criteria

### S1: Token Security

**GIVEN** a signed stream URL
**WHEN** attempting to decode the token
**THEN** the secret key shall NOT be derivable from the token

### S2: Authorization Scope

**GIVEN** a user's OAuth credentials
**WHEN** accessing Drive
**THEN** only /.junpa/ directory shall be accessible
**AND** no other user files shall be readable

### S3: HTTPS Enforcement

**GIVEN** any production deployment
**WHEN** accessing the service
**THEN** all endpoints shall require HTTPS
**AND** HTTP requests shall be redirected

---

## Test Coverage Requirements

| Module           | Minimum Coverage |
|------------------|------------------|
| core/auth.py     | 100%             |
| core/signing.py  | 100%             |
| services/playlist.py | 100%         |
| services/drive.py | 90%             |
| services/hls.py  | 95%              |
| api/*            | 85%              |
| Overall          | 90%              |
