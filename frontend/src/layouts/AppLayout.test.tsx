import { describe, it, expect } from 'vitest'
import { render as rtlRender, screen, RenderOptions } from '@testing-library/react'
import { MemoryRouter, Routes, Route, ReactNode } from 'react-router-dom'
import AppLayout from './AppLayout'

const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return rtlRender(ui, { ...options })
}

describe('AppLayout', () => {
  const renderWithRoute = (path: string) => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/signup" element={<div>Signup Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders outlet for child routes', () => {
    renderWithRoute('/login')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('displays navigation on login page', () => {
    renderWithRoute('/login')
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()
  })

  it('displays navigation on signup page', () => {
    renderWithRoute('/signup')
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()
  })

  it('displays logo on auth pages', () => {
    renderWithRoute('/login')
    expect(screen.getByText('InterviewAI')).toBeInTheDocument()
  })

  it('logo links to home', () => {
    renderWithRoute('/login')
    const homeLink = screen.getByRole('link', { name: /interviewai/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('has correct styling on active login link', () => {
    renderWithRoute('/login')
    const loginLink = screen.getByRole('link', { name: /^login$/i })
    expect(loginLink).toHaveClass('bg-blue-600', 'text-white')
  })

  it('has correct styling on inactive signup link when on login page', () => {
    renderWithRoute('/login')
    const signupLink = screen.getByRole('link', { name: /^signup$/i })
    expect(signupLink).not.toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders with light background', () => {
    const { container } = renderWithRoute('/login')
    const layoutContainer = container.querySelector('.bg-gray-50')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('navigation has white background', () => {
    const { container } = renderWithRoute('/login')
    const nav = container.querySelector('.bg-white')
    expect(nav).toBeInTheDocument()
  })
})
