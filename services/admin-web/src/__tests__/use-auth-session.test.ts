import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

// Mock next-auth/react
const mockUpdate = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { expires: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
    status: 'authenticated',
    update: mockUpdate,
  })),
  signIn: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('useAuthSession', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return session, status, and update function', async () => {
    const { useAuthSession } = await import('@/hooks/use-auth-session');
    const { result } = renderHook(() => useAuthSession());

    expect(result.current.session).toBeDefined();
    expect(result.current.status).toBe('authenticated');
    expect(typeof result.current.update).toBe('function');
  });

  it('should expose the session data from useSession', async () => {
    const { useAuthSession } = await import('@/hooks/use-auth-session');
    const { result } = renderHook(() => useAuthSession());

    expect(result.current.session).toHaveProperty('expires');
  });

  it('should set up a visibility change listener', async () => {
    const addEventSpy = vi.spyOn(document, 'addEventListener');

    const { useAuthSession } = await import('@/hooks/use-auth-session');
    renderHook(() => useAuthSession());

    expect(addEventSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  it('should clean up visibility change listener on unmount', async () => {
    const removeEventSpy = vi.spyOn(document, 'removeEventListener');

    const { useAuthSession } = await import('@/hooks/use-auth-session');
    const { unmount } = renderHook(() => useAuthSession());

    unmount();

    expect(removeEventSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });
});
