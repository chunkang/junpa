import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshAccessToken } from '@/lib/auth-refresh';

// Mock environment variables
vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');

describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return updated token fields on successful refresh', async () => {
    const mockResponse = {
      access_token: 'new-access-token',
      expires_in: 3600,
      token_type: 'Bearer',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const token = {
      accessToken: 'old-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) - 60, // expired 1 minute ago
    };

    const result = await refreshAccessToken(token);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(result.refreshToken).toBe('test-refresh-token');
    expect(result.error).toBeUndefined();

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    // Verify the body contains required parameters
    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const body = callArgs[1]?.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('client_id')).toBe('test-client-id');
    expect(body.get('client_secret')).toBe('test-client-secret');
    expect(body.get('refresh_token')).toBe('test-refresh-token');
  });

  it('should preserve new refresh_token if provided in response', async () => {
    const mockResponse = {
      access_token: 'new-access-token',
      expires_in: 3600,
      refresh_token: 'new-refresh-token',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const token = {
      accessToken: 'old-access-token',
      refreshToken: 'old-refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) - 60,
    };

    const result = await refreshAccessToken(token);

    expect(result.refreshToken).toBe('new-refresh-token');
  });

  it('should return error flag on failed refresh', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'invalid_grant' }),
    });

    const token = {
      accessToken: 'old-access-token',
      refreshToken: 'expired-refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) - 60,
    };

    const result = await refreshAccessToken(token);

    expect(result.error).toBe('RefreshTokenExpired');
    expect(result.accessToken).toBe('old-access-token');
  });

  it('should return error flag on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const token = {
      accessToken: 'old-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: Math.floor(Date.now() / 1000) - 60,
    };

    const result = await refreshAccessToken(token);

    expect(result.error).toBe('RefreshTokenExpired');
  });
});
