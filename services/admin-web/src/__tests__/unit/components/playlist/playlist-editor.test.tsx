import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlaylistEditor } from '@/components/playlist/playlist-editor'
import type { Playlist, Video } from '@/lib/schemas'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock server actions
vi.mock('@/lib/actions/playlist-actions', () => ({
  updatePlaylist: vi.fn().mockResolvedValue({ success: true }),
}))

function createMockVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: crypto.randomUUID(),
    title: 'Test Video',
    filename: 'test.mp4',
    duration: 120,
    fileSize: 1000000,
    format: 'mp4',
    tags: [],
    uploadedAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    source: 'local',
    ...overrides,
  }
}

function createMockPlaylist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Playlist',
    items: [],
    loop: false,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    ...overrides,
  }
}

describe('PlaylistEditor', () => {
  const video1 = createMockVideo({ id: 'v1', title: 'Video One', duration: 60 })
  const video2 = createMockVideo({
    id: 'v2',
    title: 'Video Two',
    duration: 90,
  })
  const video3 = createMockVideo({
    id: 'v3',
    title: 'Video Three',
    duration: 45,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render playlist settings section', () => {
    const playlist = createMockPlaylist()
    render(<PlaylistEditor playlist={playlist} allVideos={[]} />)

    expect(screen.getByText('Playlist Settings')).toBeDefined()
    expect(screen.getByLabelText(/title/i)).toBeDefined()
  })

  it('should render videos section', () => {
    const playlist = createMockPlaylist()
    render(<PlaylistEditor playlist={playlist} allVideos={[video1]} />)

    expect(screen.getByText('Videos')).toBeDefined()
    expect(screen.getByText('Add Video')).toBeDefined()
  })

  it('should display playlist items with video titles', () => {
    const playlist = createMockPlaylist({
      items: [
        { videoId: 'v1', order: 0 },
        { videoId: 'v2', order: 1 },
      ],
    })
    render(
      <PlaylistEditor playlist={playlist} allVideos={[video1, video2]} />
    )

    expect(screen.getByText('Video One')).toBeDefined()
    expect(screen.getByText('Video Two')).toBeDefined()
  })

  it('should show empty state when no items in playlist', () => {
    const playlist = createMockPlaylist({ items: [] })
    render(<PlaylistEditor playlist={playlist} allVideos={[video1]} />)

    expect(
      screen.getByText(/no videos in this playlist/i)
    ).toBeDefined()
  })

  it('should show video picker when Add Video is clicked', async () => {
    const user = userEvent.setup()
    const playlist = createMockPlaylist()
    render(
      <PlaylistEditor
        playlist={playlist}
        allVideos={[video1, video2]}
      />
    )

    await user.click(screen.getByText('Add Video'))
    expect(
      screen.getByText('Add Videos to Playlist')
    ).toBeDefined()
  })

  it('should remove a video when remove button is clicked', async () => {
    const user = userEvent.setup()
    const playlist = createMockPlaylist({
      items: [
        { videoId: 'v1', order: 0 },
        { videoId: 'v2', order: 1 },
      ],
    })
    render(
      <PlaylistEditor playlist={playlist} allVideos={[video1, video2]} />
    )

    // Click the remove button for Video One
    const removeButton = screen.getByLabelText('Remove Video One from playlist')
    await user.click(removeButton)

    expect(screen.queryByText('Video One')).toBeNull()
    expect(screen.getByText('Video Two')).toBeDefined()
  })

  it('should display total duration', () => {
    const playlist = createMockPlaylist({
      items: [
        { videoId: 'v1', order: 0 },
        { videoId: 'v2', order: 1 },
      ],
    })
    render(
      <PlaylistEditor playlist={playlist} allVideos={[video1, video2]} />
    )

    // 60 + 90 = 150 seconds = 2:30
    expect(screen.getByText(/2:30/)).toBeDefined()
  })

  it('should show start time inputs for each item', () => {
    const playlist = createMockPlaylist({
      items: [{ videoId: 'v1', order: 0, startAt: 'PT10S' }],
    })
    render(
      <PlaylistEditor playlist={playlist} allVideos={[video1]} />
    )

    const startInput = screen.getByLabelText('Start at:')
    expect(startInput).toBeDefined()
    expect((startInput as HTMLInputElement).value).toBe('PT10S')
  })
})
