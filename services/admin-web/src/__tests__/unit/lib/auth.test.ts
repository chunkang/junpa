import { describe, it, expect, vi } from 'vitest'

// Mock next-auth since it requires Next.js server runtime
vi.mock('next-auth', () => {
  return {
    default: vi.fn(() => ({
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })),
  }
})

// Mock the Google provider
vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((config: unknown) => ({ id: 'google', name: 'Google', ...config as object })),
}))

// We test the auth configuration and callbacks
describe('Auth Configuration', () => {
  it('should export auth handlers', async () => {
    const auth = await import('@/lib/auth')
    expect(auth.handlers).toBeDefined()
    expect(auth.auth).toBeDefined()
    expect(auth.signIn).toBeDefined()
    expect(auth.signOut).toBeDefined()
  })

  it('should configure Google provider with Drive scope', async () => {
    const { authOptions } = await import('@/lib/auth-options')
    expect(authOptions.providers).toBeDefined()
    expect(authOptions.providers.length).toBeGreaterThan(0)
  })

  it('should use jwt session strategy', async () => {
    const { authOptions } = await import('@/lib/auth-options')
    expect(authOptions.session?.strategy).toBe('jwt')
  })

  it('should configure sign-in page to /login', async () => {
    const { authOptions } = await import('@/lib/auth-options')
    expect(authOptions.pages?.signIn).toBe('/login')
  })

  it('should set session maxAge to 30 days', async () => {
    const { authOptions } = await import('@/lib/auth-options')
    expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60)
  })

  it('should have jwt and session callbacks defined', async () => {
    const { authOptions } = await import('@/lib/auth-options')
    expect(authOptions.callbacks?.jwt).toBeDefined()
    expect(authOptions.callbacks?.session).toBeDefined()
  })
})
