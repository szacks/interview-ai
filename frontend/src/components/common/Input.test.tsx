import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input Component', () => {
  it('renders without label', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows required asterisk when required prop is true', () => {
    render(<Input label="Email" required />)
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-destructive')
  })

  it('displays error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('displays error styles when error is present', () => {
    render(<Input error="Invalid input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-destructive')
  })

  it('displays helper text when no error', () => {
    render(<Input helperText="Enter a valid email" />)
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
  })

  it('does not display helper text when error is present', () => {
    render(<Input error="Invalid" helperText="Helper text" />)
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    expect(screen.getByText('Invalid')).toBeInTheDocument()
  })

  it('accepts input values', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'test@example.com')
    expect(input.value).toBe('test@example.com')
  })

  it('applies placeholder attribute', () => {
    render(<Input placeholder="Enter email" />)
    const input = screen.getByPlaceholderText('Enter email')
    expect(input).toBeInTheDocument()
  })

  it('handles change events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  it('supports input type attribute', () => {
    const { container } = render(<Input type="email" />)
    const input = container.querySelector('input[type="email"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'email')
  })

  it('displays border in default state', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-border', 'bg-background')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })
})
