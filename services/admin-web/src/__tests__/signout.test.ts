import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-auth auth function
const mockAuth = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown) => ({ body, status: 200 }),
  },
}));

// We need to import the route handler AFTER mocks are set up
// Dynamic import will be used in each test

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('should revoke Google token when accessToken is present', async () => {
    mockAuth.mockResolvedValue({ accessToken: 'test-access-token' });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    const { POST } = await import('@/app/api/auth/signout/route');
    const response = await POST();

    expect(response).toEqual(
      expect.objectContaining({ body: { success: true } })
    );

    // Verify Google revocation was called
    expect(global.fetch).toHaveBeenCalledWith(
      'https://oauth2.googleapis.com/revoke?token=test-access-token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('should return success even when token revocation fails', async () => {
    mockAuth.mockResolvedValue({ accessToken: 'test-access-token' });
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    );

    const { POST } = await import('@/app/api/auth/signout/route');
    const response = await POST();

    expect(response).toEqual(
      expect.objectContaining({ body: { success: true } })
    );
  });

  it('should not attempt revocation when accessToken is missing', async () => {
    mockAuth.mockResolvedValue({ accessToken: undefined });

    const { POST } = await import('@/app/api/auth/signout/route');
    const response = await POST();

    expect(response).toEqual(
      expect.objectContaining({ body: { success: true } })
    );

    // fetch should NOT have been called for revocation
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should return success even when auth() throws', async () => {
    mockAuth.mockRejectedValue(new Error('Session error'));

    const { POST } = await import('@/app/api/auth/signout/route');
    const response = await POST();

    expect(response).toEqual(
      expect.objectContaining({ body: { success: true } })
    );
  });
});
