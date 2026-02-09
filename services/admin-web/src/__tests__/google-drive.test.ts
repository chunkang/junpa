import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock the schemas module before importing GoogleDriveClient
vi.mock('@/lib/schemas/library', () => ({
  Library: {},
  librarySchema: { parse: vi.fn((v: unknown) => v) },
  emptyLibrary: { videos: [], playlists: [] },
}));

import { GoogleDriveClient, SessionExpiredError } from '@/lib/google-drive';

describe('GoogleDriveClient', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('SessionExpiredError', () => {
    it('should be an instance of Error', () => {
      const error = new SessionExpiredError();
      expect(error).toBeInstanceOf(Error);
    });

    it('should have the correct name', () => {
      const error = new SessionExpiredError();
      expect(error.name).toBe('SessionExpiredError');
    });

    it('should have a default message', () => {
      const error = new SessionExpiredError();
      expect(error.message).toBe('Session has expired. Please sign in again.');
    });

    it('should accept a custom message', () => {
      const error = new SessionExpiredError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('fetch with 401 retry', () => {
    it('should pass through successful (non-401) responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ files: [] }),
        text: () => Promise.resolve('OK'),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const client = new GoogleDriveClient('test-token');
      const files = await client.listVideos();

      expect(files).toEqual([]);
      // fetch should be called once (no retry needed)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 401 and succeed with fresh token', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      };
      const successResponse = {
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            files: [{ id: '1', name: 'video.mp4', mimeType: 'video/mp4' }],
          }),
        text: () => Promise.resolve('OK'),
      };
      const sessionResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ accessToken: 'fresh-token' }),
      };

      // Call sequence: 1st fetch (401), session fetch, retry fetch (200)
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(unauthorizedResponse)   // original request -> 401
        .mockResolvedValueOnce(sessionResponse)         // /api/auth/session
        .mockResolvedValueOnce(successResponse);        // retry request -> 200

      const client = new GoogleDriveClient('expired-token');
      const files = await client.listVideos();

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('video.mp4');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw SessionExpiredError on double 401', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      };
      const sessionResponse = {
        ok: true,
        json: () =>
          Promise.resolve({ accessToken: 'still-expired-token' }),
      };

      // Call sequence: 1st fetch (401), session fetch, retry fetch (401 again)
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce(unauthorizedResponse)  // original request -> 401
        .mockResolvedValueOnce(sessionResponse)        // /api/auth/session
        .mockResolvedValueOnce(unauthorizedResponse);  // retry request -> 401 again

      const client = new GoogleDriveClient('expired-token');

      await expect(client.listVideos()).rejects.toThrow(SessionExpiredError);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
