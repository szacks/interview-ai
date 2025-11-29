import { describe, it, expect } from 'vitest'
import { render as rtlRender, screen, RenderOptions } from '@testing-library/react'
import { MemoryRouter, Routes, Route, ReactNode } from 'react-router-dom'
import InterviewLayout from './InterviewLayout'

const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return rtlRender(ui, { ...options })
}

describe('InterviewLayout', () => {
  const renderLayout = (interviewId: string = 'test-123') => {
    return render(
      <MemoryRouter initialEntries={[`/interview/${interviewId}`]}>
        <Routes>
          <Route path="/interview/:interviewId" element={<InterviewLayout />}>
            <Route index element={<div>Interview Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders outlet for child routes', () => {
    renderLayout()
    expect(screen.getByText('Interview Content')).toBeInTheDocument()
  })

  it('renders interview room title', () => {
    renderLayout()
    expect(screen.getByText('Interview Room')).toBeInTheDocument()
  })

  it('displays interview id from params', () => {
    renderLayout('xyz-789')
    expect(screen.getByText(/Interview ID: xyz-789/)).toBeInTheDocument()
  })

  it('displays time remaining section', () => {
    renderLayout()
    expect(screen.getByText('Time Remaining')).toBeInTheDocument()
  })

  it('displays default timer value', () => {
    renderLayout()
    const timerElements = screen.getAllByText('30:00')
    expect(timerElements.length).toBeGreaterThan(0)
  })

  it('has dark theme styling', () => {
    const { container } = renderLayout()
    const darkBg = container.querySelector('.bg-black')
    expect(darkBg).toBeInTheDocument()
  })

  it('header has dark gray background', () => {
    const { container } = renderLayout()
    const header = container.querySelector('.bg-gray-900')
    expect(header).toBeInTheDocument()
  })

  it('header is full width with padding', () => {
    const { container } = renderLayout()
    const headerInner = container.querySelector('.px-6')
    expect(headerInner).toBeInTheDocument()
  })

  it('has flex column layout', () => {
    const { container } = renderLayout()
    const mainContainer = container.querySelector('.flex.flex-col')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has screen height', () => {
    const { container } = renderLayout()
    const heightContainer = container.querySelector('.h-screen')
    expect(heightContainer).toBeInTheDocument()
  })

  it('displays interview id text in gray', () => {
    const { container } = renderLayout()
    const grayText = container.querySelector('.text-gray-400')
    expect(grayText).toBeInTheDocument()
    expect(grayText?.textContent).toContain('Interview ID')
  })
})
