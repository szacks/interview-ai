import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Header from './Header'

const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'admin',
}

const mockOnLogout = vi.fn()

describe('Header Component', () => {
  it('renders header element', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('displays InterviewAI branding', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('InterviewAI')).toBeInTheDocument()
  })

  it('displays company name', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('Acme Inc.')).toBeInTheDocument()
  })

  it('displays user avatar with initials', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('displays default avatar when no user', () => {
    render(<Header user={null} onLogout={mockOnLogout} />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('has card background color', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-card')
  })

  it('has border styling', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('border-b', 'border-border')
  })

  it('has proper padding', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const headerContent = container.querySelector('.px-4')
    expect(headerContent).toBeInTheDocument()
  })

  it('arranges content with flex layout', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const headerContent = container.querySelector('.flex')
    expect(headerContent).toHaveClass('items-center', 'justify-between')
  })

  it('avatar is rounded circle', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })

  it('logo has primary background', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const logo = container.querySelector('.bg-primary')
    expect(logo).toBeInTheDocument()
  })
})
