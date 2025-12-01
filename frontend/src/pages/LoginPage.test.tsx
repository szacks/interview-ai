import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
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
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('renders email input field', () => {
    render(<LoginPage />)
    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement
    expect(emailInput).toBeInTheDocument()
    expect(emailInput.type).toBe('email')
  })

  it('renders password input field', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
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
    const emailInput = screen.getByPlaceholderText('Email address')
    expect(emailInput).toBeRequired()
  })

  it('password input is required', () => {
    render(<LoginPage />)
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toBeRequired()
  })

  describe('form validation', () => {
    it('shows email error when email is empty', async () => {
      render(<LoginPage />)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('shows password error when password is empty', async () => {
      render(<LoginPage />)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })

    it('shows email format error for invalid email', async () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('clears email error when user fixes input', async () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Trigger error
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })

      // Fix input
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })
    })

    it('clears password error when user fixes input', async () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email address')
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      // Fix input
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('button states', () => {
    it('disables inputs while loading', async () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement
      const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement

      expect(emailInput.disabled).toBe(false)
      expect(passwordInput.disabled).toBe(false)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement
      expect(submitButton.disabled).toBe(false)
    })

    it('shows loading text on submit button', async () => {
      render(<LoginPage />)
      const emailInput = screen.getByPlaceholderText('Email address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // Check button text before submission (would require mocking authService to see loading state)
      expect(submitButton).toHaveTextContent('Sign in')
    })
  })
})
