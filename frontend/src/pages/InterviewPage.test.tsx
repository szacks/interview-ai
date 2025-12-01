import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Routes, Route } from 'react-router-dom'
import InterviewPage from './InterviewPage'

describe('InterviewPage', () => {
  const renderWithParams = () => {
    return render(
      <Routes>
        <Route path="/interview/:interviewId" element={<InterviewPage />} />
      </Routes>
    )
  }

  it('renders interview room header', () => {
    renderWithParams()
    expect(screen.getByText('Interview Room')).toBeInTheDocument()
  })

  it('displays interview id from params', () => {
    renderWithParams()
    expect(screen.getByText(/Interview ID:/)).toBeInTheDocument()
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
    const { container } = renderWithParams()
    const mainContainer = container.querySelector('.bg-black')
    expect(mainContainer).toBeInTheDocument()
  })

  it('has dark text color', () => {
    const { container } = renderWithParams()
    const textElement = container.querySelector('.text-white')
    expect(textElement).toBeInTheDocument()
  })
})
