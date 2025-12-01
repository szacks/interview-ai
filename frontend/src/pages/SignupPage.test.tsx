import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
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
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('renders company name input field', () => {
    render(<SignupPage />)
    const companyInput = screen.getByPlaceholderText('Company Name')
    expect(companyInput).toBeInTheDocument()
    expect(companyInput).toBeRequired()
  })

  it('renders admin name input field', () => {
    render(<SignupPage />)
    const adminInput = screen.getByPlaceholderText('Admin Name')
    expect(adminInput).toBeInTheDocument()
    expect(adminInput).toBeRequired()
  })

  it('renders email input field', () => {
    render(<SignupPage />)
    const emailInput = screen.getByPlaceholderText('Email address') as HTMLInputElement
    expect(emailInput).toBeInTheDocument()
    expect(emailInput.type).toBe('email')
    expect(emailInput).toBeRequired()
  })

  it('renders password input field', () => {
    render(<SignupPage />)
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
    expect(passwordInput).toBeInTheDocument()
    expect(passwordInput.type).toBe('password')
    expect(passwordInput).toBeRequired()
  })

  it('renders confirm password input field', () => {
    render(<SignupPage />)
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password') as HTMLInputElement
    expect(confirmPasswordInput).toBeInTheDocument()
    expect(confirmPasswordInput.type).toBe('password')
    expect(confirmPasswordInput).toBeRequired()
  })

  it('renders sign up button', () => {
    render(<SignupPage />)
    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    expect(signUpButton).toBeInTheDocument()
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

  it('all form fields are required', () => {
    render(<SignupPage />)
    expect(screen.getByPlaceholderText('Company Name')).toBeRequired()
    expect(screen.getByPlaceholderText('Admin Name')).toBeRequired()
    expect(screen.getByPlaceholderText('Email address')).toBeRequired()
    expect(screen.getByPlaceholderText(/^Password$/)).toBeRequired()
    expect(screen.getByPlaceholderText('Confirm Password')).toBeRequired()
  })

  describe('form validation', () => {
    it('shows company name error when empty', async () => {
      render(<SignupPage />)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Company name is required')).toBeInTheDocument()
      })
    })

    it('shows company name min length error', async () => {
      render(<SignupPage />)
      const companyInput = screen.getByPlaceholderText('Company Name')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(companyInput, { target: { value: 'A' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Company name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('shows admin name error when empty', async () => {
      render(<SignupPage />)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Admin name is required')).toBeInTheDocument()
      })
    })

    it('shows admin name min length error', async () => {
      render(<SignupPage />)
      const adminInput = screen.getByPlaceholderText('Admin Name')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(adminInput, { target: { value: 'J' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Admin name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('shows email error when empty', async () => {
      render(<SignupPage />)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument()
      })
    })

    it('shows email format error for invalid email', async () => {
      render(<SignupPage />)
      const emailInput = screen.getByPlaceholderText('Email address')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('shows password error when empty', async () => {
      render(<SignupPage />)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })
    })

    it('shows password min length error', async () => {
      render(<SignupPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(passwordInput, { target: { value: 'short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('shows confirm password error when empty', async () => {
      render(<SignupPage />)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument()
      })
    })

    it('shows password mismatch error', async () => {
      render(<SignupPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('clears field errors when user fixes input', async () => {
      render(<SignupPage />)
      const companyInput = screen.getByPlaceholderText('Company Name') as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      // Trigger error
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Company name is required')).toBeInTheDocument()
      })

      // Fix input
      fireEvent.change(companyInput, { target: { value: 'Acme Corp' } })

      await waitFor(() => {
        expect(screen.queryByText('Company name is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('password requirements', () => {
    it('validates password is at least 8 characters', async () => {
      render(<SignupPage />)
      const passwordInput = screen.getByPlaceholderText('Password')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(passwordInput, { target: { value: '1234567' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('allows password with exactly 8 characters', async () => {
      render(<SignupPage />)
      const companyInput = screen.getByPlaceholderText('Company Name')
      const adminInput = screen.getByPlaceholderText('Admin Name')
      const emailInput = screen.getByPlaceholderText('Email address')
      const passwordInput = screen.getByPlaceholderText('Password')
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(companyInput, { target: { value: 'Test Corp' } })
      fireEvent.change(adminInput, { target: { value: 'Test Admin' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '12345678' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } })
      fireEvent.click(submitButton)

      // Should not show password error
      await waitFor(() => {
        expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument()
      })
    })
  })
})
