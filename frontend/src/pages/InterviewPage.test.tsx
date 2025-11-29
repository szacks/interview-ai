import { describe, it, expect } from 'vitest'
import { render as rtlRender, screen, RenderOptions } from '@testing-library/react'
import { MemoryRouter, Routes, Route, ReactNode } from 'react-router-dom'
import InterviewPage from './InterviewPage'

const render = (
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  return rtlRender(ui, { ...options })
}

describe('InterviewPage', () => {
  const renderWithParams = (interviewId: string = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/interview/${interviewId}`]}>
        <Routes>
          <Route path="/interview/:interviewId" element={<InterviewPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders interview room header', () => {
    renderWithParams()
    expect(screen.getByText('Interview Room')).toBeInTheDocument()
  })

  it('displays interview id from params', () => {
    renderWithParams('abc123')
    expect(screen.getByText(/Interview ID: abc123/)).toBeInTheDocument()
  })

  it('renders code editor section', () => {
    renderWithParams()
    expect(screen.getByText('Code Editor')).toBeInTheDocument()
  })

  it('displays code editor placeholder', () => {
    renderWithParams()
    expect(screen.getByText(/Code editor will be integrated here/)).toBeInTheDocument()
  })

  it('renders chat section', () => {
    renderWithParams()
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })

  it('displays chat placeholder', () => {
    renderWithParams()
    expect(screen.getByText(/Chat messages will appear here/)).toBeInTheDocument()
  })

  it('renders chat input field', () => {
    renderWithParams()
    const chatInput = screen.getByPlaceholderText('Type a message...')
    expect(chatInput).toBeInTheDocument()
  })

  it('renders timer section', () => {
    renderWithParams()
    expect(screen.getByText('Timer')).toBeInTheDocument()
  })

  it('displays default timer value', () => {
    renderWithParams()
    expect(screen.getByText('30:00')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithParams()
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('has dark theme styling', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/*" element={<InterviewPage />} />
        </Routes>
      </MemoryRouter>
    )
    const mainContainer = container.querySelector('.bg-black')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has dark text color', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/*" element={<InterviewPage />} />
        </Routes>
      </MemoryRouter>
    )
    const textElement = container.querySelector('.text-white')
    expect(textElement).toBeInTheDocument()
  })
})
