import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import authService, { LoginRequest, SignupRequest, AuthResponse } from './authService'
import apiClient from './apiClient'

vi.mock('./apiClient')

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'auth-token-123',
        user: {
          id: '1',
          email: 'test@example.com',
          companyName: 'Test Company',
          role: 'interviewer',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.login(credentials)

      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('authToken')).toBe('auth-token-123')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials)
    })

    it('should throw error if no token in response', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ user: { id: '1' } })

      await expect(authService.login(credentials)).rejects.toThrow()
    })

    it('should throw error on api failure', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const error = new Error('Network error')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(credentials)).rejects.toThrow('Network error')
    })
  })

  describe('signup', () => {
    it('should signup successfully and store token', async () => {
      const signupData: SignupRequest = {
        companyName: 'New Company',
        email: 'newuser@example.com',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'auth-token-456',
        user: {
          id: '2',
          email: 'newuser@example.com',
          companyName: 'New Company',
          role: 'interviewer',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.signup(signupData)

      expect(result).toEqual(mockResponse)
      expect(localStorage.getItem('authToken')).toBe('auth-token-456')
      expect(apiClient.post).toHaveBeenCalledWith('/auth/signup', signupData)
    })

    it('should throw error if no token in response', async () => {
      const signupData: SignupRequest = {
        companyName: 'Company',
        email: 'user@example.com',
        password: 'password',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ user: { id: '1' } })

      await expect(authService.signup(signupData)).rejects.toThrow()
    })
  })

  describe('logout', () => {
    it('should remove auth token from localStorage', () => {
      localStorage.setItem('authToken', 'test-token')
      authService.logout()
      expect(localStorage.getItem('authToken')).toBeNull()
    })

    it('should work when no token is stored', () => {
      authService.logout()
      expect(localStorage.getItem('authToken')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        companyName: 'Test Company',
        role: 'interviewer',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUser)

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })

    it('should propagate api errors', async () => {
      const error = new Error('Unauthorized')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      const resetData = { email: 'test@example.com' }
      const mockResponse = { message: 'Reset email sent' }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.requestPasswordReset(resetData)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', resetData)
    })
  })

  describe('confirmPasswordReset', () => {
    it('should confirm password reset', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
      }
      const mockResponse = { message: 'Password updated' }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.confirmPasswordReset(resetData)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetData)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when token is stored', () => {
      localStorage.setItem('authToken', 'test-token')
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when no token is stored', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('getToken', () => {
    it('should return stored token', () => {
      localStorage.setItem('authToken', 'test-token-xyz')
      expect(authService.getToken()).toBe('test-token-xyz')
    })

    it('should return null when no token is stored', () => {
      expect(authService.getToken()).toBeNull()
    })
  })
})
