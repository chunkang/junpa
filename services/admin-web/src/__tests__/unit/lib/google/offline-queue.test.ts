import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OfflineQueue, type QueuedChange } from '@/lib/google/offline-queue'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('OfflineQueue', () => {
  let queue: OfflineQueue

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    queue = new OfflineQueue()
  })

  it('should add changes to queue', () => {
    queue.enqueue({ type: 'update-video', payload: { id: '1', title: 'New' } })
    expect(queue.length).toBe(1)
  })

  it('should persist queue to localStorage', () => {
    queue.enqueue({ type: 'update-video', payload: { id: '1' } })
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should process queue in FIFO order', () => {
    queue.enqueue({ type: 'create-video', payload: { id: '1' } })
    queue.enqueue({ type: 'update-video', payload: { id: '2' } })

    const items = queue.drain()
    expect(items).toHaveLength(2)
    expect(items[0].type).toBe('create-video')
    expect(items[1].type).toBe('update-video')
  })

  it('should restore queue from localStorage', () => {
    const stored: QueuedChange[] = [
      { type: 'update-video', payload: { id: '1' }, timestamp: Date.now() },
    ]
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(stored))

    const restoredQueue = new OfflineQueue()
    expect(restoredQueue.length).toBe(1)
  })

  it('should clear queue after drain', () => {
    queue.enqueue({ type: 'delete-video', payload: { id: '1' } })
    queue.drain()
    expect(queue.length).toBe(0)
  })

  it('should return undefined for peek on empty queue', () => {
    expect(queue.peek()).toBeUndefined()
  })

  it('should peek at next item without removing it', () => {
    queue.enqueue({ type: 'create-video', payload: { id: '1' } })
    const peeked = queue.peek()
    expect(peeked?.type).toBe('create-video')
    expect(queue.length).toBe(1)
  })

  it('should add timestamp to enqueued items', () => {
    const before = Date.now()
    queue.enqueue({ type: 'update-video', payload: { id: '1' } })
    const after = Date.now()

    const items = queue.drain()
    expect(items[0].timestamp).toBeGreaterThanOrEqual(before)
    expect(items[0].timestamp).toBeLessThanOrEqual(after)
  })
})
