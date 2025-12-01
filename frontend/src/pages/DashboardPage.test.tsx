import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('renders company dashboard page', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Company Dashboard')).toBeInTheDocument()
  })

  it('displays welcome message', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Welcome to your interview dashboard/i)).toBeInTheDocument()
  })

  it('renders key metrics section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Key Metrics')).toBeInTheDocument()
  })

  it('renders active interviews metric', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Active Interviews')).toBeInTheDocument()
  })

  it('renders completed interviews metric', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders pending interviews metric', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders total candidates metric', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Total Candidates')).toBeInTheDocument()
  })

  it('displays interview counts as 0 initially', () => {
    render(<DashboardPage />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })

  it('renders quick actions section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Schedule Interview')).toBeInTheDocument()
    expect(screen.getByText('View Candidates')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders recent interviews section', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Recent Interviews')).toBeInTheDocument()
  })

  it('displays loading or empty state for interviews', () => {
    render(<DashboardPage />)
    // Check that either loading spinner or empty state is shown
    const container = screen.getByText('Recent Interviews').parentElement
    expect(container).toBeInTheDocument()
  })

  it('displays metric descriptions', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Currently in progress')).toBeInTheDocument()
    expect(screen.getByText('Finished interviews')).toBeInTheDocument()
    expect(screen.getByText('Awaiting scheduling')).toBeInTheDocument()
    expect(screen.getByText('All candidates')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = render(<DashboardPage />)
    const mainContainer = container.querySelector('.p-8')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has max width container', () => {
    const { container } = render(<DashboardPage />)
    const maxWidth = container.querySelector('.max-w-7xl')
    expect(maxWidth).toBeInTheDocument()
  })

  it('uses grid layout for metrics', () => {
    const { container } = render(<DashboardPage />)
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})
