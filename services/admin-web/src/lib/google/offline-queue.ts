const STORAGE_KEY = 'junpa-offline-queue'

export interface QueuedChange {
  type: string
  payload: Record<string, unknown>
  timestamp: number
}

export class OfflineQueue {
  private queue: QueuedChange[] = []

  constructor() {
    this.restore()
  }

  get length(): number {
    return this.queue.length
  }

  enqueue(change: Omit<QueuedChange, 'timestamp'>): void {
    this.queue.push({ ...change, timestamp: Date.now() })
    this.persist()
  }

  drain(): QueuedChange[] {
    const items = [...this.queue]
    this.queue = []
    this.persist()
    return items
  }

  peek(): QueuedChange | undefined {
    return this.queue[0]
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue))
    } catch {
      // localStorage might be full or unavailable
    }
  }

  private restore(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch {
      this.queue = []
    }
  }
}
