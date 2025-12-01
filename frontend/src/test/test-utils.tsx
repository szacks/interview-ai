import React from 'react'
import type { ReactElement } from 'react'
import { render as rtlRender, screen } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render, screen }
