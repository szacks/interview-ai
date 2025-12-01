import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  const renderLayout = () => {
    return render(
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
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

  it('renders logout buttons', () => {
    renderLayout()
    const logoutButtons = screen.getAllByRole('button', { name: /logout/i })
    expect(logoutButtons.length).toBeGreaterThan(0)
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
