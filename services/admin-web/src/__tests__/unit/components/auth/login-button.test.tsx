import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginButton } from '@/components/auth/login-button'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

describe('LoginButton', () => {
  it('should render sign in button', () => {
    render(<LoginButton />)
    expect(
      screen.getByRole('button', { name: /sign in with google/i })
    ).toBeDefined()
  })

  it('should contain the Google SVG icon', () => {
    const { container } = render(<LoginButton />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })
})
