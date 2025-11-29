import { describe, it, expect } from 'vitest'
import { render as rtlRender, screen, RenderOptions } from '@testing-library/react'
import { MemoryRouter, Routes, Route, ReactNode } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'

const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return rtlRender(ui, { ...options })
}

describe('DashboardLayout', () => {
  const renderLayout = () => {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders outlet for child routes', () => {
    renderLayout()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('renders sidebar component', () => {
    renderLayout()
    const sidebar = screen.getByText('InterviewAI')
    expect(sidebar).toBeInTheDocument()
  })

  it('renders header component', () => {
    renderLayout()
    const header = screen.getByText('Welcome')
    expect(header).toBeInTheDocument()
  })

  it('renders sidebar navigation links', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /interviews/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /candidates/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('renders logout button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('has flex layout', () => {
    const { container } = renderLayout()
    const mainContainer = container.querySelector('.flex')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has correct height styling', () => {
    const { container } = renderLayout()
    const mainContainer = container.querySelector('.h-screen')
    expect(mainContainer).toBeInTheDocument()
  })

  it('renders with gray background', () => {
    const { container } = renderLayout()
    const bgElement = container.querySelector('.bg-gray-100')
    expect(bgElement).toBeInTheDocument()
  })
})
