# Junpa - Product Overview

## Project Identity

**Name:** Junpa

**Origin:** Junpa is originally a friendly nickname for Johnny at home, named by his father. The name also connects to Sanskrit roots where "Jhanpa" means jump, spring, or plunge into water - representing the dynamic nature of streaming content.

**Vision:** Create a platform where everyone can stream their own story with minimized financial burden.

---

## Target Audience

### Primary Users

- **Independent Content Creators:** Individuals who want to share video content without significant hosting costs
- **Small Teams and Organizations:** Groups needing a self-managed video streaming solution
- **Personal Archivists:** Users who want to stream their personal video collections

### Key Value Proposition

- **Zero Hosting Costs:** Leverage existing Google Drive storage instead of expensive video CDNs
- **Simplified Authentication:** Google Account integration eliminates complex user management
- **Full Ownership:** Content remains in the creator's own Google Drive account

---

## Core Features

### Video Streaming

| Feature | Description |
|---------|-------------|
| On-Demand Streams | Individual video assets with unique IDs for direct access |
| Live Playlists | Scheduled playlists simulating live TV channels with start times |
| Series Grouping | Sequential video collections with auto-play functionality |
| Adaptive Streaming | HTTP-based adaptive streaming for optimal playback |

### Content Management

| Feature | Description |
|---------|-------------|
| Video Library | JSON-based library stored at `/.junpa/library.json` in Google Drive |
| Metadata Support | Titles, tags, and categorization for all video assets |
| Playlist Builder | Create and manage playlists with scheduled start times |
| Featured Content | Highlight specific streams or playlists |

### User Experience

| Feature | Description |
|---------|-------------|
| Simple Reactions | Basic engagement without comment complexity |
| Personalized URLs | User-specific streaming URLs based on Google Account |
| Seamless Playback | Join live playlists at current position, loop at completion |

---

## Service Components

### 1. Admin Web

**Purpose:** Content management interface for creators

**Capabilities:**
- Google Account sign-in for Google Drive access
- Video upload from Google Photos or direct upload
- Video library management with metadata editing
- Playlist creation and scheduling
- Featured content selection

**Storage Location:** `/.junpa/` directory in user's Google Drive

### 2. Streamer

**Purpose:** Live streaming service backend

**Capabilities:**
- HTTP-based adaptive streaming delivery
- Live playlist synchronization (join at current position)
- Automatic playlist looping at completion
- User-specific streaming URL generation

**Technical Behavior:**
- Calculates playback position based on playlist start time
- Maintains continuous streaming for live playlist experience

### 3. Frontend Web

**Purpose:** Public-facing viewer interface

**Capabilities:**
- Browse registered video assets
- Access live channels (playlists)
- View series with sequential playback
- Simple reaction interactions

---

## Content Organization

### Video Assets

```
Video
 +-- Unique ID (system-generated)
 +-- Title (defaults to filename)
 +-- Tags (optional, for categorization)
 +-- Series membership (optional)
 +-- Reactions (simple engagement data)
```

### Playlists

```
Playlist
 +-- Collection of On-Demand Stream references
 +-- start_at (scheduled start time for live experience)
 +-- created_at (creation timestamp)
 +-- Loop behavior (restart from beginning when complete)
```

### Series

```
Series
 +-- Ordered collection of On-Demand Streams
 +-- Manual or chronological ordering
 +-- Auto-play next functionality
```

---

## Use Cases

### Personal Streaming Channel

A content creator uploads their video collection to Google Drive, organizes them into series, and creates a 24/7 live playlist that loops their content. Viewers can tune in at any time and experience content as if watching a live channel.

### Educational Content Library

An educator uploads course videos, organizes them into series by topic, and shares the frontend URL with students. Students can watch on-demand or follow along with a scheduled live playlist during class hours.

### Family Video Archive

A family uploads home videos, tags them by event and year, and creates seasonal playlists. Family members can access the content from anywhere using their Google Account.

---

## Project Status

**Current Phase:** Infrastructure Configured

- MoAI-ADK framework initialized
- Development environment prepared
- Quality gates configured
- No application code implemented yet

**Next Steps:**
1. Define detailed SPEC documents for each service component
2. Implement Admin Web for content management
3. Build Streamer service for video delivery
4. Create Frontend Web for viewer experience

---

## Related Documentation

- [Project Structure](./structure.md) - Directory organization and architecture
- [Technology Stack](./tech.md) - Technical implementation details
