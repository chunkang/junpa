import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('googleapis', () => {
  // Use a regular function so it can be called with `new`
  function MockOAuth2() {
    // @ts-expect-error mock constructor
    this.setCredentials = vi.fn()
  }
  return {
    google: {
      drive: vi.fn(() => ({
        files: {
          list: vi.fn(),
          create: vi.fn(),
          get: vi.fn(),
          update: vi.fn(),
        },
      })),
      auth: {
        OAuth2: MockOAuth2,
      },
    },
  }
})

describe('Drive Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create authenticated drive client', async () => {
    const { createDriveClient } = await import('@/lib/google/drive-client')
    const client = createDriveClient('test-access-token')
    expect(client).toBeDefined()
    expect(client.files).toBeDefined()
  })

  it('should have ensureJunpaDirectory function', async () => {
    const { ensureJunpaDirectory } = await import('@/lib/google/drive-client')
    expect(typeof ensureJunpaDirectory).toBe('function')
  })

  it('should have readLibraryJson function', async () => {
    const { readLibraryJson } = await import('@/lib/google/drive-client')
    expect(typeof readLibraryJson).toBe('function')
  })

  it('should have writeLibraryJson function', async () => {
    const { writeLibraryJson } = await import('@/lib/google/drive-client')
    expect(typeof writeLibraryJson).toBe('function')
  })
})
