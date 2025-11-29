import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
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
})
