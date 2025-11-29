import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Header from './Header'

describe('Header Component', () => {
  it('renders header element', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toBeInTheDocument()
  })

  it('displays welcome message', () => {
    render(<Header />)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('displays user avatar with initials', () => {
    render(<Header />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('displays user label', () => {
    render(<Header />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('has white background', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('bg-white')
  })

  it('has shadow styling', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')
    expect(header).toHaveClass('shadow')
  })

  it('has proper padding', () => {
    const { container } = render(<Header />)
    const headerContent = container.querySelector('.px-6')
    expect(headerContent).toBeInTheDocument()
  })

  it('arranges content with flex layout', () => {
    const { container } = render(<Header />)
    const headerContent = container.querySelector('.flex')
    expect(headerContent).toHaveClass('items-center', 'justify-between')
  })

  it('avatar has blue background', () => {
    const { container } = render(<Header />)
    const avatar = container.querySelector('.bg-blue-600')
    expect(avatar).toBeInTheDocument()
  })

  it('avatar is rounded circle', () => {
    const { container } = render(<Header />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })
})
