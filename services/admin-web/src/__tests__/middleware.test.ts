import { describe, it, expect } from 'vitest';
import { addSecurityHeaders, config } from '../../middleware';
import { NextResponse } from 'next/server';

// Mock next/server module to avoid Next.js server-side imports in test env
vi.mock('next/server', () => {
  class MockHeaders {
    private headers: Map<string, string> = new Map();
    set(key: string, value: string) {
      this.headers.set(key, value);
    }
    get(key: string) {
      return this.headers.get(key);
    }
  }

  class MockNextResponse {
    headers: MockHeaders;
    [key: string]: unknown;
    constructor() {
      this.headers = new MockHeaders();
    }
    static next() {
      return new MockNextResponse();
    }
    static redirect(url: URL) {
      const resp = new MockNextResponse();
      resp.redirectUrl = url.toString();
      return resp;
    }
    static json(body: unknown, init?: { status?: number }) {
      const resp = new MockNextResponse();
      resp.body = body;
      resp.status = init?.status;
      return resp;
    }
  }

  return { NextResponse: MockNextResponse };
});

// Mock @/lib/auth to avoid next-auth initialization
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('addSecurityHeaders', () => {
  it('should set X-Frame-Options to DENY', () => {
    const response = NextResponse.next() as unknown as NextResponse;
    const result = addSecurityHeaders(response);
    expect(result.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('should set X-Content-Type-Options to nosniff', () => {
    const response = NextResponse.next() as unknown as NextResponse;
    const result = addSecurityHeaders(response);
    expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should set Referrer-Policy to strict-origin-when-cross-origin', () => {
    const response = NextResponse.next() as unknown as NextResponse;
    const result = addSecurityHeaders(response);
    expect(result.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    );
  });

  it('should return the same response object', () => {
    const response = NextResponse.next() as unknown as NextResponse;
    const result = addSecurityHeaders(response);
    expect(result).toBe(response);
  });
});

describe('middleware config', () => {
  it('should include dashboard routes in matcher', () => {
    expect(config.matcher).toContain('/dashboard/:path*');
  });

  it('should include videos routes in matcher', () => {
    expect(config.matcher).toContain('/videos/:path*');
  });

  it('should include playlists routes in matcher', () => {
    expect(config.matcher).toContain('/playlists/:path*');
  });

  it('should include settings routes in matcher', () => {
    expect(config.matcher).toContain('/settings/:path*');
  });

  it('should include API routes excluding auth in matcher', () => {
    expect(config.matcher).toContain('/api/((?!auth).*)');
  });

  it('should include login page in matcher', () => {
    expect(config.matcher).toContain('/login');
  });

  it('should have exactly 6 matcher patterns', () => {
    expect(config.matcher).toHaveLength(6);
  });
});
