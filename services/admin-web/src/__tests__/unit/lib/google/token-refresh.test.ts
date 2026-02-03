import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Token Refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should refresh token when given valid refresh token', async () => {
    const { refreshAccessToken } = await import('@/lib/google/token-refresh')

    const mockResponse = {
      access_token: 'new-access-token',
      expires_in: 3600,
      token_type: 'Bearer',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await refreshAccessToken('valid-refresh-token')
    expect(result.accessToken).toBe('new-access-token')
    expect(result.error).toBeUndefined()
  })

  it('should return error when refresh fails', async () => {
    const { refreshAccessToken } = await import('@/lib/google/token-refresh')

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    } as unknown as Response)

    const result = await refreshAccessToken('invalid-refresh-token')
    expect(result.error).toBe('RefreshAccessTokenError')
  })

  it('should return error on network failure', async () => {
    const { refreshAccessToken } = await import('@/lib/google/token-refresh')

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await refreshAccessToken('some-token')
    expect(result.error).toBe('RefreshAccessTokenError')
  })

  it('should detect token expiring within 5 minutes', async () => {
    const { isTokenExpiringSoon } = await import('@/lib/google/token-refresh')
    const fourMinutesFromNow = Math.floor(Date.now() / 1000) + 4 * 60
    expect(isTokenExpiringSoon(fourMinutesFromNow)).toBe(true)
  })

  it('should not flag token expiring in more than 5 minutes', async () => {
    const { isTokenExpiringSoon } = await import('@/lib/google/token-refresh')
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60
    expect(isTokenExpiringSoon(oneHourFromNow)).toBe(false)
  })

  it('should call Google token endpoint with correct params', async () => {
    const { refreshAccessToken } = await import('@/lib/google/token-refresh')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600 }),
    } as Response)

    await refreshAccessToken('my-refresh-token')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    )
  })
})
