import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeaturedEditor } from '@/components/featured/featured-editor'
import type { FeaturedItemWithDetails } from '@/lib/actions/featured-actions'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock server actions
const mockRemoveFeaturedItem = vi.fn().mockResolvedValue({ success: true })
const mockReorderFeaturedItems = vi.fn().mockResolvedValue({ success: true })

vi.mock('@/lib/actions/featured-actions', () => ({
  removeFeaturedItem: (...args: unknown[]) => mockRemoveFeaturedItem(...args),
  reorderFeaturedItems: (...args: unknown[]) =>
    mockReorderFeaturedItems(...args),
}))

function createMockFeaturedItem(
  overrides: Partial<FeaturedItemWithDetails> = {}
): FeaturedItemWithDetails {
  return {
    contentType: 'video',
    contentId: 'v1',
    priority: 0,
    featuredAt: '2025-01-15T10:00:00.000Z',
    title: 'Test Video',
    ...overrides,
  }
}

describe('FeaturedEditor', () => {
  const mockOnAddClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the featured content heading', () => {
    render(<FeaturedEditor items={[]} onAddClick={mockOnAddClick} />)

    expect(screen.getByText('Featured Content')).toBeDefined()
  })

  it('should display the item count', () => {
    const items = [
      createMockFeaturedItem({ contentId: 'v1', priority: 0 }),
      createMockFeaturedItem({ contentId: 'v2', priority: 1, title: 'Second' }),
    ]
    render(<FeaturedEditor items={items} onAddClick={mockOnAddClick} />)

    expect(screen.getByText('2 / 10 featured items')).toBeDefined()
  })

  it('should show empty state when no items', () => {
    render(<FeaturedEditor items={[]} onAddClick={mockOnAddClick} />)

    expect(
      screen.getByText(
        'No featured content. Mark videos, playlists, or series as featured.'
      )
    ).toBeDefined()
  })

  it('should render featured items with titles and type badges', () => {
    const items = [
      createMockFeaturedItem({
        contentId: 'v1',
        contentType: 'video',
        title: 'My Video',
      }),
      createMockFeaturedItem({
        contentId: 'p1',
        contentType: 'playlist',
        priority: 1,
        title: 'My Playlist',
      }),
      createMockFeaturedItem({
        contentId: 's1',
        contentType: 'series',
        priority: 2,
        title: 'My Series',
      }),
    ]
    render(<FeaturedEditor items={items} onAddClick={mockOnAddClick} />)

    expect(screen.getByText('My Video')).toBeDefined()
    expect(screen.getByText('My Playlist')).toBeDefined()
    expect(screen.getByText('My Series')).toBeDefined()
    expect(screen.getByText('Video')).toBeDefined()
    expect(screen.getByText('Playlist')).toBeDefined()
    expect(screen.getByText('Series')).toBeDefined()
  })

  it('should call onAddClick when Add Featured button is clicked', async () => {
    const user = userEvent.setup()
    render(<FeaturedEditor items={[]} onAddClick={mockOnAddClick} />)

    await user.click(screen.getByText('+ Add Featured'))
    expect(mockOnAddClick).toHaveBeenCalledTimes(1)
  })

  it('should call removeFeaturedItem when Remove button is clicked', async () => {
    const user = userEvent.setup()
    const items = [
      createMockFeaturedItem({
        contentId: 'v1',
        title: 'My Video',
      }),
    ]
    render(<FeaturedEditor items={items} onAddClick={mockOnAddClick} />)

    await user.click(screen.getByLabelText('Remove My Video from featured'))
    expect(mockRemoveFeaturedItem).toHaveBeenCalledWith('v1')
  })

  it('should display priority numbers for each item', () => {
    const items = [
      createMockFeaturedItem({ contentId: 'v1', priority: 0, title: 'First' }),
      createMockFeaturedItem({
        contentId: 'v2',
        priority: 1,
        title: 'Second',
      }),
    ]
    render(<FeaturedEditor items={items} onAddClick={mockOnAddClick} />)

    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('should disable Add Featured button when at 10 items', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      createMockFeaturedItem({
        contentId: `v${i}`,
        priority: i,
        title: `Video ${i}`,
      })
    )
    render(<FeaturedEditor items={items} onAddClick={mockOnAddClick} />)

    const addButton = screen.getByText('+ Add Featured')
    expect(addButton).toHaveProperty('disabled', true)
  })
})
