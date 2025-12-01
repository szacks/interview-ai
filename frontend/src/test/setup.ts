import { afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock localStorage for all environments
const store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value
  },
  removeItem: (key: string) => {
    delete store[key]
  },
  clear: () => {
    Object.keys(store).forEach(key => delete store[key])
  },
  length: 0,
  key: (index: number) => {
    const keys = Object.keys(store)
    return keys[index] || null
  },
}

// Set up localStorage globally
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
} else {
  // For Node environment, set up global localStorage
  const globalObj = globalThis as any
  if (globalObj) {
    globalObj.localStorage = localStorageMock
  }
}

// Clear localStorage before each test
beforeEach(() => {
  Object.keys(store).forEach(key => delete store[key])
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  Object.keys(store).forEach(key => delete store[key])
})
