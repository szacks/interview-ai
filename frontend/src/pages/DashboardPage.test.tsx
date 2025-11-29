import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('renders dashboard page', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('displays welcome message', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome to your interview dashboard/i)).toBeInTheDocument()
  })

  it('renders active interviews card', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Active Interviews')).toBeInTheDocument()
  })

  it('renders completed interviews card', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders pending interviews card', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('displays interview count as 0 initially', () => {
    render(<DashboardPage />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })

  it('renders recent interviews section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Recent Interviews')).toBeInTheDocument()
  })

  it('displays empty state message', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/No interviews yet/i)).toBeInTheDocument()
  })

  it('renders dashboard in grid layout', () => {
    const { container } = render(<DashboardPage />)
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })
})
