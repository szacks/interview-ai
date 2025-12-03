import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  const renderLayout = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders outlet for child routes', () => {
    renderLayout()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('renders header component', () => {
    renderLayout()
    const header = screen.getByText('InterviewAI')
    expect(header).toBeInTheDocument()
  })

  it('displays company name in header', () => {
    renderLayout()
    const companyName = screen.getByText('Acme Inc.')
    expect(companyName).toBeInTheDocument()
  })

  it('renders logout button in header', () => {
    renderLayout()
    const logoutButton = screen.getByRole('button')
    expect(logoutButton).toBeInTheDocument()
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

  it('renders with background styling', () => {
    const { container } = renderLayout()
    const bgElement = container.querySelector('.bg-background')
    expect(bgElement).toBeInTheDocument()
  })
})
