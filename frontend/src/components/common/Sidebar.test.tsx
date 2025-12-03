import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Sidebar from './Sidebar'

describe('Sidebar Component', () => {
  it('renders sidebar', () => {
    render(<Sidebar />)
    const sidebar = document.querySelector('.w-64')
    expect(sidebar).toBeInTheDocument()
  })

  it('displays logo text', () => {
    render(<Sidebar />)
    expect(screen.getByText('InterviewAI')).toBeInTheDocument()
  })

  it('displays dashboard link', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('displays interviews link', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /interviews/i })).toBeInTheDocument()
  })

  it('displays candidates link', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /candidates/i })).toBeInTheDocument()
  })

  it('displays settings link', () => {
    render(<Sidebar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('displays logout button', () => {
    render(<Sidebar />)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('logout button has destructive styling', () => {
    render(<Sidebar />)
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })

  it('has sidebar background color', () => {
    render(<Sidebar />)
    const sidebar = document.querySelector('.bg-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('has sidebar border', () => {
    const { container } = render(<Sidebar />)
    const sidebar = container.querySelector('.border-r')
    expect(sidebar).toBeInTheDocument()
  })

  it('navigation links have correct href', () => {
    render(<Sidebar />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i }) as HTMLAnchorElement
    const interviewsLink = screen.getByRole('link', { name: /interviews/i }) as HTMLAnchorElement
    const candidatesLink = screen.getByRole('link', { name: /candidates/i }) as HTMLAnchorElement
    const settingsLink = screen.getByRole('link', { name: /settings/i }) as HTMLAnchorElement

    expect(dashboardLink.pathname).toBe('/dashboard')
    expect(interviewsLink.pathname).toBe('/interviews')
    expect(candidatesLink.pathname).toBe('/candidates')
    expect(settingsLink.pathname).toBe('/settings')
  })

  it('logo is sidebar primary colored', () => {
    const { container } = render(<Sidebar />)
    const logo = container.querySelector('.text-sidebar-primary')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveTextContent('InterviewAI')
  })
})
