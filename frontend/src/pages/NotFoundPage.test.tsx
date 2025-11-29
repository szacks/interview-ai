import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 error code', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('displays page not found message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('displays helpful description', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/The page you are looking for doesn't exist/i)).toBeInTheDocument()
  })

  it('renders go home link', () => {
    render(<NotFoundPage />)
    const homeLink = screen.getByRole('link', { name: /go home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('404 text is large and bold', () => {
    const { container } = render(<NotFoundPage />)
    const heading = container.querySelector('.text-6xl')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('404')
  })

  it('renders center aligned content', () => {
    const { container } = render(<NotFoundPage />)
    const textCenter = container.querySelector('.text-center')
    expect(textCenter).toBeInTheDocument()
  })
})
