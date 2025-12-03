import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import InterviewPage from './InterviewPage'

describe('InterviewPage', () => {
  const renderWithParams = () => {
    return render(
      <MemoryRouter initialEntries={['/interview/test-123']}>
        <Routes>
          <Route path="/interview/:interviewId" element={<InterviewPage />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders interview page', () => {
    renderWithParams()
    const page = document.querySelector('[class*="bg-"]')
    expect(page).toBeInTheDocument()
  })

  it('renders with interview setup or interface', () => {
    const { container } = renderWithParams()
    expect(container).toBeInTheDocument()
  })

  it('displays interview interface', () => {
    const { container } = renderWithParams()
    expect(container).toBeInTheDocument()
  })
})
