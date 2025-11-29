import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import SignupPage from './SignupPage'

describe('SignupPage', () => {
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
    expect(screen.getByPlaceholderText('Email address')).toBeRequired()
    expect(screen.getByPlaceholderText(/^Password$/)).toBeRequired()
    expect(screen.getByPlaceholderText('Confirm Password')).toBeRequired()
  })
})
