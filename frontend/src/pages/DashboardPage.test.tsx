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

  it('displays empty state message for interviews', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/No interviews yet/i)).toBeInTheDocument()
  })

  it('displays metric descriptions', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Currently in progress')).toBeInTheDocument()
    expect(screen.getByText('Finished interviews')).toBeInTheDocument()
    expect(screen.getByText('Awaiting scheduling')).toBeInTheDocument()
    expect(screen.getByText('All candidates')).toBeInTheDocument()
  })

  it('renders dashboard in responsive grid layout', () => {
    const { container } = render(<DashboardPage />)
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
    // Check for responsive classes
    expect(gridContainer?.className).toMatch(/md:grid-cols-2/)
    expect(gridContainer?.className).toMatch(/lg:grid-cols-4/)
  })

  it('renders metric cards with proper structure', () => {
    const { container } = render(<DashboardPage />)
    const cards = container.querySelectorAll('[class*="rounded-lg"]')
    expect(cards.length).toBeGreaterThan(0)
  })
})
