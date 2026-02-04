import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoGrid } from '@/components/video/video-grid'
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

describe('VideoGrid', () => {
  describe('when videos are provided', () => {
    it('should render all video cards', () => {
      const videos = [
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'First Video',
        }),
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Second Video',
        }),
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440003',
          title: 'Third Video',
        }),
      ]

      render(<VideoGrid videos={videos} />)

      expect(screen.getByText('First Video')).toBeDefined()
      expect(screen.getByText('Second Video')).toBeDefined()
      expect(screen.getByText('Third Video')).toBeDefined()
    })

    it('should render correct number of links', () => {
      const videos = [
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Video A',
        }),
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Video B',
        }),
      ]

      render(<VideoGrid videos={videos} />)

      const links = screen.getAllByRole('link')
      expect(links.length).toBe(2)
    })

    it('should link each card to its detail page', () => {
      const videos = [
        createMockVideo({
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Video A',
        }),
      ]

      render(<VideoGrid videos={videos} />)

      const link = screen.getByRole('link')
      expect(link.getAttribute('href')).toBe(
        '/library/550e8400-e29b-41d4-a716-446655440001'
      )
    })
  })

  describe('empty state', () => {
    it('should show empty state message when no videos', () => {
      render(<VideoGrid videos={[]} />)
      expect(screen.getByText('No videos yet')).toBeDefined()
    })

    it('should show onboarding description text', () => {
      render(<VideoGrid videos={[]} />)
      expect(
        screen.getByText(/your video library is empty/i)
      ).toBeDefined()
    })

    it('should render upload CTA button', () => {
      render(<VideoGrid videos={[]} />)
      const uploadLink = screen.getByRole('link', {
        name: /upload your first video/i,
      })
      expect(uploadLink).toBeDefined()
      expect(uploadLink.getAttribute('href')).toBe('/upload')
    })

    it('should not render any video cards', () => {
      const { container } = render(<VideoGrid videos={[]} />)
      // The grid container with video cards should not exist
      const grid = container.querySelector('.grid')
      expect(grid).toBeNull()
    })
  })
})
