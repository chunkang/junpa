import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoCard } from '@/components/video/video-card'
import type { Video } from '@/lib/schemas'

// Mock next/link to render as a plain anchor
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function createMockVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Test Video',
    filename: 'test-video.mp4',
    duration: 125,
    fileSize: 1258291,
    format: 'mp4',
    tags: [],
    uploadedAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
    source: 'local',
    ...overrides,
  }
}

describe('VideoCard', () => {
  it('should render the video title', () => {
    const video = createMockVideo({ title: 'My Birthday Video' })
    render(<VideoCard video={video} />)
    expect(screen.getByText('My Birthday Video')).toBeDefined()
  })

  it('should link to the video detail page', () => {
    const video = createMockVideo()
    render(<VideoCard video={video} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe(
      '/library/550e8400-e29b-41d4-a716-446655440000'
    )
  })

  it('should display formatted duration', () => {
    const video = createMockVideo({ duration: 125 })
    render(<VideoCard video={video} />)
    expect(screen.getByText('2:05')).toBeDefined()
  })

  it('should display formatted file size', () => {
    const video = createMockVideo({ fileSize: 1258291 })
    render(<VideoCard video={video} />)
    expect(screen.getByText('1.2 MB')).toBeDefined()
  })

  it('should display the format badge', () => {
    const video = createMockVideo({ format: 'webm' })
    render(<VideoCard video={video} />)
    expect(screen.getByText('webm')).toBeDefined()
  })

  it('should display tags as chips', () => {
    const video = createMockVideo({ tags: ['birthday', 'family'] })
    render(<VideoCard video={video} />)
    expect(screen.getByText('birthday')).toBeDefined()
    expect(screen.getByText('family')).toBeDefined()
  })

  it('should not render tag chips when there are no tags', () => {
    const video = createMockVideo({ tags: [] })
    const { container } = render(<VideoCard video={video} />)
    // No tag chip elements should be present
    const chips = container.querySelectorAll('.rounded-full')
    expect(chips.length).toBe(0)
  })

  it('should show Local source indicator for local videos', () => {
    const video = createMockVideo({ source: 'local' })
    render(<VideoCard video={video} />)
    expect(screen.getByText('Local')).toBeDefined()
  })

  it('should show Cloud source indicator for google-photos videos', () => {
    const video = createMockVideo({ source: 'google-photos' })
    render(<VideoCard video={video} />)
    expect(screen.getByText('Cloud')).toBeDefined()
  })

  it('should render a placeholder when no thumbnail is provided', () => {
    const video = createMockVideo({ thumbnailPath: undefined })
    const { container } = render(<VideoCard video={video} />)
    // Should have the gradient placeholder div
    const placeholder = container.querySelector('[aria-hidden="true"]')
    expect(placeholder).not.toBeNull()
  })

  it('should render the thumbnail image when provided', () => {
    const video = createMockVideo({ thumbnailPath: '/thumbs/test.jpg' })
    render(<VideoCard video={video} />)
    const img = screen.getByAltText('Thumbnail for Test Video')
    expect(img).toBeDefined()
    expect(img.getAttribute('src')).toBe('/thumbs/test.jpg')
  })
})
