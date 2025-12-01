import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './AppLayout'

describe('AppLayout', () => {
  const renderWithRoute = () => {
    return render(
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/signup" element={<div>Signup Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Route>
      </Routes>
    )
  }

  it('renders outlet for child routes', () => {
    renderWithRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('displays navigation on login page', () => {
    renderWithRoute()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()
  })

  it('displays navigation on signup page', () => {
    renderWithRoute()
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()
  })

  it('displays logo on auth pages', () => {
    renderWithRoute()
    expect(screen.getByText('InterviewAI')).toBeInTheDocument()
  })

  it('logo links to home', () => {
    renderWithRoute()
    const homeLink = screen.getByRole('link', { name: /interviewai/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('has correct styling on active login link', () => {
    renderWithRoute()
    const loginLink = screen.getByRole('link', { name: /^login$/i })
    expect(loginLink).toHaveClass('bg-blue-600', 'text-white')
  })

  it('has correct styling on inactive signup link when on login page', () => {
    renderWithRoute()
    const signupLink = screen.getByRole('link', { name: /^signup$/i })
    expect(signupLink).not.toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders with light background', () => {
    const { container } = renderWithRoute()
    const layoutContainer = container.querySelector('.bg-gray-50')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('navigation has white background', () => {
    const { container } = renderWithRoute()
    const nav = container.querySelector('.bg-white')
    expect(nav).toBeInTheDocument()
  })
})
