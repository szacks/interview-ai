import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import Card from './Card'

describe('Card Component', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'border', 'border-gray-200')
  })

  it('applies elevated variant styles', () => {
    const { container } = render(<Card variant="elevated">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'shadow-md')
  })

  it('applies elevated variant styles with different shadow', () => {
    const { container } = render(<Card variant="elevated">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'shadow-lg')
  })

  it('applies small padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('p-3')
  })

  it('applies medium padding by default', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('p-6')
  })

  it('applies large padding', () => {
    const { container } = render(<Card padding="lg">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('p-8')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })

  it('renders multiple children', () => {
    render(
      <Card>
        <div>Child 1</div>
        <div>Child 2</div>
      </Card>
    )
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('has rounded corners', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('rounded-lg')
  })

  it('renders as div element', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.tagName).toBe('DIV')
  })
})
