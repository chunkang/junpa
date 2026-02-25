---
id: SPEC-FRONTEND-001
version: "1.0.0"
status: "draft"
created: "2026-02-24"
updated: "2026-02-24"
author: "Chun Kang"
priority: "high"
---

# SPEC-FRONTEND-001: Acceptance Criteria

## Overview

This document defines the acceptance criteria for the Junpa Frontend Web Public Viewer Interface using Gherkin format (Given/When/Then). Each scenario maps to requirements defined in `spec.md` and implementation tasks in `plan.md`.

---

## Feature 1: Content Discovery and Browsing

**Requirements:** R1.1-R1.6
**Tasks:** T1.4-T1.9

### Scenario 1.1: Responsive Content Grid Layout

```gherkin
Feature: Content Discovery and Browsing

  Scenario: Display content in responsive grid layout
    Given a viewer navigates to a channel page with video content
    When the page loads on a desktop viewport (1280px+)
    Then the system shall display content in a 3-4 column grid layout
    And each card shall show a thumbnail, title, and duration

  Scenario: Responsive adaptation for mobile
    Given a viewer navigates to a channel page with video content
    When the page loads on a mobile viewport (< 768px)
    Then the system shall display content in a single column layout
    And touch targets shall meet minimum 44px accessibility requirements
```

### Scenario 1.2: Channel Home Page

```gherkin
  Scenario: Display channel home page with all content sections
    Given a viewer navigates to /{username}
    When the page loads
    Then the system shall display the channel owner's name and branding
    And show featured content in a prominent hero or carousel section
    And show active live channels with "LIVE" badges
    And show recent video additions in a grid
    And the page shall render server-side for SEO
```

### Scenario 1.3: Video Library Browsing

```gherkin
  Scenario: Browse full video library
    Given a viewer navigates to /{username}/videos
    When the page loads
    Then the system shall fetch all available videos from the Streamer API
    And display videos in a responsive grid with thumbnail, title, duration, and tags
    And display the total video count
```

### Scenario 1.4: Search and Filtering

```gherkin
  Scenario: Search videos by title
    Given a viewer is on the video library page with multiple videos
    When the viewer types "cooking" in the search bar
    Then the system shall filter the displayed videos in real time
    And show only videos whose title or tags match "cooking"
    And display the number of matching results

  Scenario: Filter by tag
    Given a viewer is on the video library page
    And videos have tags such as "tutorial", "vlog", and "music"
    When the viewer clicks the "tutorial" tag filter
    Then the system shall display only videos tagged with "tutorial"
    And the selected tag shall appear visually active
```

### Scenario 1.5: Empty Library State

```gherkin
  Scenario: Display empty library message
    Given a viewer navigates to a channel with no video content
    When the page loads
    Then the system shall display a friendly "No content available yet" message
    And show the channel owner's branding
    And the page shall not display error states or broken layouts
```

---

## Feature 2: On-Demand Video Playback

**Requirements:** R2.1-R2.7
**Tasks:** T1.5, T2.1-T2.5

### Scenario 2.1: Video Playback Initiation

```gherkin
Feature: On-Demand Video Playback

  Scenario: Start video playback from video card
    Given a viewer is browsing the video library
    When the viewer clicks on a video card
    Then the system shall navigate to /watch/{videoId}
    And fetch video metadata and streaming URL from the Streamer Service
    And load the video in the HTML5/HLS player
    And display video metadata (title, description, tags, duration) below the player
```

### Scenario 2.2: Player Controls

```gherkin
  Scenario: Video player provides full controls
    Given a video is loaded in the player
    When the viewer interacts with the player
    Then the system shall provide play/pause toggle
    And provide a seek bar showing current position and total duration
    And provide volume control with mute toggle
    And provide a fullscreen toggle button
    And provide playback speed selector (0.5x, 1x, 1.25x, 1.5x, 2x)
    And all controls shall be keyboard-accessible
```

### Scenario 2.3: Video Seeking

```gherkin
  Scenario: Seek to a specific timestamp
    Given a video is playing in the player
    When the viewer drags the seek bar to 50% of the video duration
    Then the system shall request the appropriate segment from the Streamer Service
    And resume playback from the requested position within 2 seconds
    And the seek bar shall reflect the new position
```

### Scenario 2.4: Stream Error Handling

```gherkin
  Scenario: Handle video stream failure gracefully
    Given a viewer navigates to a video page
    When the video stream fails to load (network error, 404, etc.)
    Then the system shall display a user-friendly error message
    And provide a "Try Again" retry button
    And the error shall not crash the application or other page elements
    When the viewer clicks "Try Again"
    Then the system shall re-attempt to fetch the video stream
```

### Scenario 2.5: Auto-Play Audio Policy

```gherkin
  Scenario: Respect browser auto-play policies
    Given a viewer navigates to a video page via direct URL
    When the page loads
    Then the system shall NOT auto-play video with audio unmuted
    And the viewer must explicitly click play to start audio playback
```

### Scenario 2.6: Picture-in-Picture Mode

```gherkin
  Scenario: Enable Picture-in-Picture viewing
    Given a video is playing in the player
    And the browser supports Picture-in-Picture API
    When the viewer clicks the PiP button
    Then the video shall continue playing in a floating mini-player
    And the viewer shall be able to browse other content while watching
```

---

## Feature 3: Live Playlist (Channel) Viewing

**Requirements:** R3.1-R3.7
**Tasks:** T3.1-T3.5

### Scenario 3.1: Join Live Channel at Current Position

```gherkin
Feature: Live Playlist Viewing

  Scenario: Join a live channel in progress
    Given a live playlist started at 10:00:00 with total duration of 3600 seconds
    And the current time is 10:30:00
    When a viewer navigates to the live channel page
    Then the system shall fetch the current playback state from the Streamer Service
    And start playback at the calculated position (1800 seconds into the playlist)
    And display the current video with seek position applied
    And display a "LIVE" badge on the player
```

### Scenario 3.2: Automatic Video Transition

```gherkin
  Scenario: Seamless transition to next video in live playlist
    Given a viewer is watching a live playlist
    And the current video has 5 seconds remaining
    When the current video ends
    Then the system shall automatically fetch the next video from the Streamer Service
    And transition to the next video without viewer intervention
    And the playback shall continue without noticeable interruption
```

### Scenario 3.3: Coming Soon Countdown

```gherkin
  Scenario: Display countdown for upcoming live channel
    Given a live playlist has start_at set to 30 minutes in the future
    When a viewer navigates to the live channel page
    Then the system shall display status as "Coming Soon"
    And show a countdown timer with minutes and seconds until start
    And the countdown shall update in real time
    When the countdown reaches zero
    Then the system shall automatically begin live playback
```

### Scenario 3.4: Live Channel Ended State

```gherkin
  Scenario: Handle ended non-looping live channel
    Given a live playlist with loop disabled has finished all videos
    When a viewer navigates to the live channel page
    Then the system shall display a "This channel has ended" message
    And provide a link to browse other content on the channel
    And the player shall not attempt to play content
```

### Scenario 3.5: Looping Live Channel

```gherkin
  Scenario: Continuous looping playback
    Given a live playlist with loop enabled and total duration of 3600 seconds
    And the current time is 4000 seconds after start_at
    When a viewer navigates to the live channel
    Then the system shall calculate position as 4000 % 3600 = 400 seconds
    And start playback at 400 seconds into the playlist
    And continue looping indefinitely
```

### Scenario 3.6: Live Badge Display

```gherkin
  Scenario: Display LIVE badge on active channels
    Given the channel home page lists multiple playlist channels
    When the page loads
    Then active live playlists shall display a red "LIVE" badge
    And coming-soon playlists shall display a "Coming Soon" indicator
    And ended playlists shall not display any live indicator
```

---

## Feature 4: Series Playback

**Requirements:** R4.1-R4.6
**Tasks:** T4.1-T4.4

### Scenario 4.1: Series Overview Page

```gherkin
Feature: Series Playback

  Scenario: Display series with episode list
    Given a viewer navigates to a series page
    When the page loads
    Then the system shall display the series title and description
    And show an ordered list of episodes with episode number, title, duration, and thumbnail
    And each episode shall be clickable to start playback
```

### Scenario 4.2: Episode Playback with Highlighting

```gherkin
  Scenario: Play an episode and highlight current
    Given a viewer is on a series page with 10 episodes
    When the viewer clicks on Episode 3
    Then the system shall load Episode 3 in the video player
    And highlight Episode 3 in the episode list sidebar
    And display "Now Playing" indicator on Episode 3
```

### Scenario 4.3: Auto-Play Next Episode

```gherkin
  Scenario: Auto-play next episode with countdown
    Given a viewer is watching Episode 5 of a series with auto-play enabled
    When Episode 5 ends
    Then the system shall display a "Next Episode" overlay
    And show Episode 6 title and thumbnail as preview
    And display a 5-second countdown timer
    When the countdown reaches zero
    Then the system shall automatically start Episode 6
    And update the episode list highlighting to Episode 6

  Scenario: Cancel auto-play countdown
    Given the "Next Episode" overlay is displayed with countdown
    When the viewer clicks "Cancel"
    Then the system shall stop the countdown
    And remain on the current episode's end screen
    And the viewer can manually select the next episode
```

### Scenario 4.4: Episode Navigation

```gherkin
  Scenario: Navigate to next and previous episodes
    Given a viewer is watching Episode 5 of a 10-episode series
    When the viewer clicks "Next Episode"
    Then the system shall load and begin playback of Episode 6
    When the viewer clicks "Previous Episode"
    Then the system shall load and begin playback of Episode 5
```

### Scenario 4.5: Resume Series Progress

```gherkin
  Scenario: Resume series from last watched position
    Given a viewer previously watched Episode 3 of a series to the halfway point
    And the series progress was saved to localStorage
    When the viewer returns to the series page
    Then the system shall display a "Resume Episode 3" prompt
    And indicate the last watched position
    When the viewer clicks "Resume"
    Then the system shall load Episode 3 and seek to the saved position
```

---

## Feature 5: Viewer Reactions

**Requirements:** R5.1-R5.5
**Tasks:** T5.1-T5.3

### Scenario 5.1: Like a Video

```gherkin
Feature: Viewer Reactions

  Scenario: Like a video with optimistic update
    Given a viewer is watching a video with 42 likes
    And the viewer has not liked this video in the current session
    When the viewer clicks the "Like" button
    Then the like count shall immediately update to 43 (optimistic)
    And the like button shall change to an "active" filled state
    And the system shall send the like to the Streamer Service
```

### Scenario 5.2: Prevent Duplicate Likes

```gherkin
  Scenario: Prevent duplicate likes within a session
    Given a viewer has already liked a video in the current session
    When the viewer views the like button
    Then the button shall be displayed in an "active" state
    And clicking the button shall not increment the count
    And the system shall not send a duplicate like request
```

### Scenario 5.3: View Count Display

```gherkin
  Scenario: Display view count with formatting
    Given a video has 1,234,567 views
    When the viewer sees the video page
    Then the system shall display "1.2M views" (formatted)
    And the view count shall be visible near the video title
```

---

## Feature 6: Shareable URL Access

**Requirements:** R6.1-R6.4
**Tasks:** T6.1-T6.2

### Scenario 6.1: Resolve Shareable Video URL

```gherkin
Feature: Shareable URL Access

  Scenario: Access video via shareable URL
    Given a valid shareable token for a video
    When a viewer navigates to /s/{token}
    Then the system shall validate the token via the Streamer Service
    And load the corresponding video in the player
    And display the video metadata
```

### Scenario 6.2: Resolve Shareable Live Playlist URL

```gherkin
  Scenario: Access live playlist via shareable URL
    Given a valid shareable token for a live playlist
    When a viewer navigates to /s/{token}
    Then the system shall validate the token via the Streamer Service
    And load the live playlist at the current playback position
    And display the "LIVE" badge
```

### Scenario 6.3: Handle Expired Shareable URL

```gherkin
  Scenario: Display expired link page
    Given an expired or invalid shareable token
    When a viewer navigates to /s/{token}
    Then the system shall display a "This link has expired" page
    And show the channel owner's branding if identifiable
    And provide a link to the channel home page if available
    And the page shall not show a broken player or error stack trace
```

### Scenario 6.4: Share Button Functionality

```gherkin
  Scenario: Copy shareable URL to clipboard
    Given a viewer is watching a video or live channel
    When the viewer clicks the "Share" button
    Then the system shall copy the shareable URL to the clipboard
    And display a brief "Link copied!" confirmation toast
    And the toast shall auto-dismiss after 3 seconds
```

---

## Feature 7: Personalized Channel URLs

**Requirements:** R7.1-R7.3
**Tasks:** T7.1-T7.2

### Scenario 7.1: Access Personalized Channel

```gherkin
Feature: Personalized Channel URLs

  Scenario: Navigate to a user's channel
    Given a channel exists for username "johnny"
    When a viewer navigates to /johnny
    Then the system shall load Johnny's channel page
    And display the channel owner's name as branding
    And show featured content, active live channels, and recent videos
```

### Scenario 7.2: Non-Existent Channel

```gherkin
  Scenario: Handle non-existent channel URL
    Given no channel exists for username "nonexistent"
    When a viewer navigates to /nonexistent
    Then the system shall display a 404 page
    And show a friendly "Channel not found" message
    And suggest the viewer check the URL for typos
```

---

## Feature 8: Performance and Accessibility

**Requirements:** R8.1-R8.7
**Tasks:** T8.1-T8.4

### Scenario 8.1: Server-Side Rendering

```gherkin
Feature: Performance and Accessibility

  Scenario: Channel pages render server-side
    Given a viewer navigates to /{username}
    When the initial HTML response is received
    Then the page shall include fully rendered content (not empty shells)
    And search engine crawlers shall see complete page content
    And time-to-first-byte shall be under 500ms
```

### Scenario 8.2: Lazy Loading

```gherkin
  Scenario: Lazy load images and below-fold content
    Given a channel page has 50 video cards
    When the page loads
    Then only images above the fold shall load immediately
    And images below the fold shall load as the viewer scrolls
    And the main thread shall not be blocked for more than 200ms
```

### Scenario 8.3: Keyboard Navigation

```gherkin
  Scenario: Full keyboard accessibility
    Given a viewer is navigating the site using only a keyboard
    When the viewer presses Tab
    Then focus shall move through all interactive elements in logical order
    And all focused elements shall have a visible focus indicator
    And the video player shall respond to keyboard shortcuts:
      | Key       | Action              |
      | Space     | Play/Pause          |
      | Left      | Seek backward 10s   |
      | Right     | Seek forward 10s    |
      | Up        | Volume up           |
      | Down      | Volume down         |
      | M         | Mute/Unmute         |
      | F         | Toggle fullscreen   |
```

### Scenario 8.4: Screen Reader Support

```gherkin
  Scenario: Screen reader compatibility
    Given a viewer is using a screen reader
    When navigating the video library
    Then each video card shall announce title, duration, and view count
    And the video player shall announce play state changes
    And all interactive elements shall have appropriate ARIA labels
    And live regions shall announce countdown and live state changes
```

### Scenario 8.5: Dark Mode

```gherkin
  Scenario: Toggle dark mode
    Given a viewer is on any page
    When the viewer clicks the theme toggle button
    Then the system shall switch between light and dark mode
    And the preference shall persist in localStorage
    And all components shall adapt to the selected theme
    And the video player controls shall remain visible in both modes
```

### Scenario 8.6: Core Web Vitals

```gherkin
  Scenario: Meet Core Web Vitals thresholds
    Given any page in the Frontend Web
    When measured by Lighthouse
    Then Largest Contentful Paint (LCP) shall be under 2.5 seconds
    And First Input Delay (FID) shall be under 100 milliseconds
    And Cumulative Layout Shift (CLS) shall be under 0.1
    And the overall Lighthouse Performance score shall be 90 or above
```

---

## Performance Acceptance Criteria

### P1: Initial Page Load

**GIVEN** a viewer navigates to a channel page
**WHEN** the page loads on a 4G mobile connection
**THEN** Time to Interactive shall be under 3.5 seconds
**AND** initial JS bundle shall be under 150KB gzipped

### P2: Video Start Time

**GIVEN** a viewer clicks play on a video
**WHEN** the first video frame renders
**THEN** time from click to first frame shall be under 2 seconds on broadband
**AND** under 4 seconds on 4G mobile

### P3: Live Playlist Sync Accuracy

**GIVEN** a live playlist in progress
**WHEN** comparing client playback position to server-calculated position
**THEN** drift shall not exceed 3 seconds

### P4: Search Responsiveness

**GIVEN** a video library with 500 videos
**WHEN** the viewer types a search query
**THEN** results shall filter in under 100ms (perceived instant)

---

## Security Acceptance Criteria

### S1: XSS Prevention

**GIVEN** video metadata containing potentially malicious content (e.g., script tags in titles)
**WHEN** the metadata is displayed on the page
**THEN** all content shall be properly escaped and sanitized
**AND** no script execution shall occur

### S2: Shareable Token Handling

**GIVEN** a shareable URL token
**WHEN** the frontend processes the token
**THEN** the token shall only be passed to the Streamer Service API for validation
**AND** no sensitive information shall be extracted or displayed client-side

### S3: Content Security Policy

**GIVEN** the application is deployed to production
**WHEN** HTTP headers are inspected
**THEN** a Content Security Policy header shall be present
**AND** video sources shall be restricted to known Google Drive domains and the Streamer API

---

## Quality Gate Criteria

### Test Coverage

| Metric                   | Target   | Validation Tool       |
|--------------------------|----------|-----------------------|
| Unit test coverage       | 85%+     | Vitest coverage       |
| Component test coverage  | 80%+     | Vitest + RTL          |
| Integration test coverage| 80%+     | Vitest + MSW          |
| E2E critical paths       | 100%     | Playwright            |

### Code Quality

| Metric                   | Target           | Validation Tool       |
|--------------------------|------------------|-----------------------|
| ESLint errors            | Zero             | ESLint CI check       |
| TypeScript strict mode   | Enabled          | tsc --noEmit          |
| Unused exports           | Zero             | ts-prune              |
| Code duplication         | < 3%             | jscpd                 |

### Accessibility

| Metric                   | Target           | Validation Tool            |
|--------------------------|------------------|----------------------------|
| WCAG compliance level    | 2.1 AA           | axe-core + manual audit    |
| Keyboard navigation      | Full support     | Playwright E2E             |
| Screen reader support    | ARIA compliant   | axe-core + manual audit    |
| Color contrast ratio     | 4.5:1 minimum    | Lighthouse accessibility   |

### Performance

| Metric                        | Target      | Validation Tool          |
|-------------------------------|-------------|--------------------------|
| Lighthouse Performance Score  | 90+         | Lighthouse CI            |
| LCP                           | < 2.5s      | Core Web Vitals          |
| FID                           | < 100ms     | Core Web Vitals          |
| CLS                           | < 0.1       | Core Web Vitals          |
| Initial JS bundle             | < 150KB gz  | Bundle analyzer          |
| TTI                           | < 3.5s      | Lighthouse               |

---

## Definition of Done

A feature is considered complete when all of the following criteria are met:

- [ ] All Gherkin scenarios for the feature pass as automated tests
- [ ] Unit test coverage meets or exceeds 85% for the feature module
- [ ] E2E tests cover all critical user paths for the feature
- [ ] Zero ESLint errors and zero TypeScript compilation errors
- [ ] No critical or high severity security vulnerabilities in dependencies
- [ ] Lighthouse Performance score of 90 or above
- [ ] Core Web Vitals metrics within target thresholds
- [ ] WCAG 2.1 AA accessibility compliance verified
- [ ] Responsive layout verified on mobile (375px), tablet (768px), and desktop (1280px+)
- [ ] Video player tested on Chrome, Firefox, Safari, and Edge (including mobile Safari)
- [ ] Dark mode renders correctly across all components
- [ ] Shareable URLs resolve correctly and display appropriate states for expired tokens
- [ ] All Streamer Service API integrations tested with both live API and MSW mocks
