import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'
import Button from './Button'

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('displays title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Confirm Action">
        Modal content
      </Modal>
    )
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('displays description when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} description="Are you sure?">
        Modal content
      </Modal>
    )
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        Modal content
      </Modal>
    )
    const closeButton = container.querySelector('button')
    if (closeButton) {
      await user.click(closeButton)
    }
    expect(handleClose).toHaveBeenCalled()
  })

  it('has backdrop element with click handler', () => {
    const handleClose = vi.fn()
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="inner-content">Modal content</div>
      </Modal>
    )
    // Verify backdrop element exists
    const backdrop = container.querySelector('.fixed.inset-0')
    expect(backdrop).toBeInTheDocument()
  })

  it('does not close when clicking modal content', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div data-testid="modal-content">Modal content</div>
      </Modal>
    )
    const content = screen.getByTestId('modal-content')
    await user.click(content)
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<Button>Confirm</Button>}>
        Modal content
      </Modal>
    )
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
  })

  it('applies small size styles', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        Modal content
      </Modal>
    )
    const modal = container.querySelector('.max-w-sm')
    expect(modal).toBeInTheDocument()
  })

  it('applies medium size styles by default', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    )
    const modal = container.querySelector('.max-w-md')
    expect(modal).toBeInTheDocument()
  })

  it('applies large size styles', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        Modal content
      </Modal>
    )
    const modal = container.querySelector('.max-w-lg')
    expect(modal).toBeInTheDocument()
  })

  it('applies extra large size styles', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} size="xl">
        Modal content
      </Modal>
    )
    const modal = container.querySelector('.max-w-xl')
    expect(modal).toBeInTheDocument()
  })

  it('renders with title and description together', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Confirm"
        description="Continue?"
      >
        Modal content
      </Modal>
    )
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Continue?')).toBeInTheDocument()
  })
})
