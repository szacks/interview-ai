import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import SignupPage from './SignupPage'

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    signup: vi.fn(),
  },
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SignupPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders signup page', () => {
    render(<SignupPage />)
    const form = document.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('renders form inputs', () => {
    render(<SignupPage />)
    const inputs = document.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders signup button', () => {
    render(<SignupPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders login link', () => {
    render(<SignupPage />)
    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('displays login prompt text', () => {
    render(<SignupPage />)
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })
})
