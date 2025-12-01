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

  it('displays welcome message', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('displays user avatar with initials', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('displays user email', () => {
    render(<Header user={mockUser} onLogout={mockOnLogout} />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays default user label when no user', () => {
    render(<Header user={null} onLogout={mockOnLogout} />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('displays default avatar when no user', () => {
    render(<Header user={null} onLogout={mockOnLogout} />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('has white background', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-white')
  })

  it('has shadow styling', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('shadow')
  })

  it('has proper padding', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const headerContent = container.querySelector('.px-6')
    expect(headerContent).toBeInTheDocument()
  })

  it('arranges content with flex layout', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const headerContent = container.querySelector('.flex')
    expect(headerContent).toHaveClass('items-center', 'justify-between')
  })

  it('avatar has blue background', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const avatar = container.querySelector('.bg-blue-600')
    expect(avatar).toBeInTheDocument()
  })

  it('avatar is rounded circle', () => {
    const { container } = render(<Header user={mockUser} onLogout={mockOnLogout} />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })
})
