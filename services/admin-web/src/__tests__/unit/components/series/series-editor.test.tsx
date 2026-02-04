import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SeriesEditor } from '@/components/series/series-editor'
import type { Series, Video } from '@/lib/schemas'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock server actions
const mockUpdateSeries = vi.fn()
vi.mock('@/lib/actions/series-actions', () => ({
  updateSeries: (...args: unknown[]) => mockUpdateSeries(...args),
  createSeries: vi.fn(),
}))

function createMockVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'vid-1',
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

function createMockSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: 'series-1',
    title: 'Test Series',
    episodes: [],
    autoPlay: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdateSeries.mockResolvedValue({ success: true })
})

describe('SeriesEditor', () => {
  it('should render the series settings and episodes sections', () => {
    const series = createMockSeries()
    render(<SeriesEditor series={series} videos={[]} />)

    expect(screen.getByText('Series Settings')).toBeDefined()
    expect(screen.getByText('Episodes (0)')).toBeDefined()
  })

  it('should show empty state when no episodes exist', () => {
    const series = createMockSeries()
    render(<SeriesEditor series={series} videos={[]} />)

    expect(
      screen.getByText('No episodes yet. Add videos to this series.')
    ).toBeDefined()
  })

  it('should render episodes with their video titles', () => {
    const video1 = createMockVideo({ id: 'vid-1', title: 'Episode One Video' })
    const video2 = createMockVideo({ id: 'vid-2', title: 'Episode Two Video' })

    const series = createMockSeries({
      episodes: [
        { videoId: 'vid-1', episodeNumber: 1 },
        { videoId: 'vid-2', episodeNumber: 2 },
      ],
    })

    render(<SeriesEditor series={series} videos={[video1, video2]} />)

    expect(screen.getByText('Episode One Video')).toBeDefined()
    expect(screen.getByText('Episode Two Video')).toBeDefined()
    expect(screen.getByText('#1')).toBeDefined()
    expect(screen.getByText('#2')).toBeDefined()
  })

  it('should show episode count in the header', () => {
    const video = createMockVideo({ id: 'vid-1' })
    const series = createMockSeries({
      episodes: [
        { videoId: 'vid-1', episodeNumber: 1 },
      ],
    })

    render(<SeriesEditor series={series} videos={[video]} />)

    expect(screen.getByText('Episodes (1)')).toBeDefined()
  })

  it('should show the episode picker when Add Episode is clicked', async () => {
    const user = userEvent.setup()
    const video = createMockVideo({ id: 'vid-1', title: 'Available Video' })
    const series = createMockSeries()

    render(<SeriesEditor series={series} videos={[video]} />)

    await user.click(screen.getByText('Add Episode'))

    expect(screen.getByText('Select Videos to Add')).toBeDefined()
    expect(screen.getByText('Available Video')).toBeDefined()
  })

  it('should remove an episode when remove button is clicked', async () => {
    const user = userEvent.setup()
    const video = createMockVideo({ id: 'vid-1', title: 'My Video' })
    const series = createMockSeries({
      episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
    })

    render(<SeriesEditor series={series} videos={[video]} />)

    expect(screen.getByText('My Video')).toBeDefined()

    const removeButton = screen.getByLabelText('Remove My Video')
    await user.click(removeButton)

    expect(
      screen.getByText('No episodes yet. Add videos to this series.')
    ).toBeDefined()
  })

  it('should display formatted duration for each episode', () => {
    const video = createMockVideo({ id: 'vid-1', duration: 185 })
    const series = createMockSeries({
      episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
    })

    render(<SeriesEditor series={series} videos={[video]} />)

    expect(screen.getByText('3:05')).toBeDefined()
  })

  it('should call updateSeries when Save Episodes is clicked', async () => {
    const user = userEvent.setup()
    const video = createMockVideo({ id: 'vid-1' })
    const series = createMockSeries({
      episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
    })

    render(<SeriesEditor series={series} videos={[video]} />)

    await user.click(screen.getByText('Save Episodes'))

    expect(mockUpdateSeries).toHaveBeenCalledWith('series-1', {
      episodes: [{ videoId: 'vid-1', episodeNumber: 1 }],
    })
  })
})
