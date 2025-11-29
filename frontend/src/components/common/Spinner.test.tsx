import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Spinner from './Spinner'

describe('Spinner Component', () => {
  it('renders spinner', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies small size styles', () => {
    const { container } = render(<Spinner size="sm" />)
    const spinner = container.querySelector('.w-4')
    expect(spinner).toBeInTheDocument()
  })

  it('applies medium size styles by default', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.w-8')
    expect(spinner).toBeInTheDocument()
  })

  it('applies large size styles', () => {
    const { container } = render(<Spinner size="lg" />)
    const spinner = container.querySelector('.w-12')
    expect(spinner).toBeInTheDocument()
  })

  it('applies blue color by default', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.border-blue-600')
    expect(spinner).toBeInTheDocument()
  })

  it('applies white color', () => {
    const { container } = render(<Spinner color="white" />)
    const spinner = container.querySelector('.border-white')
    expect(spinner).toBeInTheDocument()
  })

  it('applies gray color', () => {
    const { container } = render(<Spinner color="gray" />)
    const spinner = container.querySelector('.border-gray-400')
    expect(spinner).toBeInTheDocument()
  })

  it('displays label text when provided', () => {
    render(<Spinner label="Loading..." />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('does not display label when not provided', () => {
    render(<Spinner />)
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('label has gray color', () => {
    const { container } = render(<Spinner label="Loading..." />)
    const label = container.querySelector('.text-gray-600')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Loading...')
  })

  it('has border styling', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.border-4')
    expect(spinner).toBeInTheDocument()
  })

  it('has rounded appearance', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.rounded-full')
    expect(spinner).toBeInTheDocument()
  })

  it('is centered with flex layout', () => {
    const { container } = render(<Spinner />)
    const container_div = container.querySelector('.flex')
    expect(container_div).toHaveClass('items-center', 'justify-center')
  })
})
