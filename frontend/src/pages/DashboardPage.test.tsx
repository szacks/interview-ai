import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  it('renders dashboard page', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Interviews')).toBeInTheDocument()
  })

  it('displays page description', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Manage and conduct technical interviews')).toBeInTheDocument()
  })

  it('renders interview section title', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Interviews')).toBeInTheDocument()
  })

  it('has proper layout structure', () => {
    const { container } = render(<DashboardPage />)
    const mainContainer = container.querySelector('.p-8')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has max width container', () => {
    const { container } = render(<DashboardPage />)
    const maxWidth = container.querySelector('.max-w-6xl')
    expect(maxWidth).toBeInTheDocument()
  })
})
