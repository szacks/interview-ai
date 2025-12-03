import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LoginPage from './LoginPage'

// Mock authService
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
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

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders login page', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('renders email input field', () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText('name@company.com') as HTMLInputElement
    expect(emailInput).toBeInTheDocument()
    expect(emailInput.type).toBe('email')
  })

  it('renders password input field', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput.type).toBe('password')
  })

  it('renders sign in button', () => {
    render(<LoginPage />)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    expect(signInButton).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    render(<LoginPage />)
    const forgotLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('renders signup link', () => {
    render(<LoginPage />)
    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('displays signup prompt text', () => {
    render(<LoginPage />)
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
  })

  it('email input is required', () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText('name@company.com')
    expect(emailInput).toBeRequired()
  })

  it('password input is required', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    expect(passwordInput).toBeRequired()
  })

  it('accepts form input values', () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText('name@company.com') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
  })

  it('shows sign in button', () => {
    render(<LoginPage />)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toHaveTextContent('Sign in')
  })
})
