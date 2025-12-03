import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './AppLayout'

describe('AppLayout', () => {
  const renderWithRoute = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
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
    renderWithRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders with background styling', () => {
    const { container } = renderWithRoute()
    const layoutContainer = container.querySelector('.bg-background')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('has minimum screen height', () => {
    const { container } = renderWithRoute()
    const layoutContainer = container.querySelector('.min-h-screen')
    expect(layoutContainer).toBeInTheDocument()
  })
})
