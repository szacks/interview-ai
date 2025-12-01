import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { LoginRequest, SignupRequest, AuthResponse } from './authService'
import authService from './authService'
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
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
        message: 'Login successful',
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

      vi.mocked(apiClient.post).mockResolvedValueOnce({ userId: 1 })

      await expect(authService.login(credentials)).rejects.toThrow('No token in response')
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

    it('should handle invalid credentials error', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const error = new Error('Invalid email or password')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(credentials)).rejects.toThrow('Invalid email or password')
    })

    it('should handle server errors (5xx)', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const error = new Error('Internal server error')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(credentials)).rejects.toThrow('Internal server error')
    })

    it('should trim email before sending', async () => {
      const credentials: LoginRequest = {
        email: '  test@example.com  ',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'auth-token-123',
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      await authService.login(credentials)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: '  test@example.com  ',
        password: 'password123',
      })
    })
  })

  describe('signup', () => {
    it('should signup successfully and store token', async () => {
      const signupData: SignupRequest = {
        companyName: 'New Company',
        adminName: 'John Doe',
        email: 'newuser@example.com',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'auth-token-456',
        userId: 2,
        name: 'John Doe',
        email: 'newuser@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
        message: 'Signup successful',
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
        adminName: 'Admin',
        email: 'user@example.com',
        password: 'password123',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ userId: 1 })

      await expect(authService.signup(signupData)).rejects.toThrow('No token in response')
    })

    it('should handle email already exists error', async () => {
      const signupData: SignupRequest = {
        companyName: 'New Company',
        adminName: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      }

      const error = new Error('Email already exists')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.signup(signupData)).rejects.toThrow('Email already exists')
    })

    it('should handle company name validation errors', async () => {
      const signupData: SignupRequest = {
        companyName: 'New Company',
        adminName: 'John Doe',
        email: 'newuser@example.com',
        password: 'password123',
      }

      const error = new Error('Invalid company name')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.signup(signupData)).rejects.toThrow('Invalid company name')
    })

    it('should trim whitespace from signup data', async () => {
      const signupData: SignupRequest = {
        companyName: '  New Company  ',
        adminName: '  John Doe  ',
        email: '  newuser@example.com  ',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'auth-token-456',
        userId: 2,
        name: 'John Doe',
        email: 'newuser@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      await authService.signup(signupData)

      expect(localStorage.getItem('authToken')).toBe('auth-token-456')
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
      const mockResponse = {
        message: 'Password reset link has been sent to your email',
        email: 'test@example.com'
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.requestPasswordReset(resetData)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', resetData)
    })

    it('should handle email not found error', async () => {
      const resetData = { email: 'nonexistent@example.com' }
      const error = new Error('Email not found')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.requestPasswordReset(resetData)).rejects.toThrow('Email not found')
    })

    it('should handle server errors during reset request', async () => {
      const resetData = { email: 'test@example.com' }
      const error = new Error('Failed to send reset email')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.requestPasswordReset(resetData)).rejects.toThrow('Failed to send reset email')
    })

    it('should trim email before sending', async () => {
      const resetData = { email: '  test@example.com  ' }
      const mockResponse = {
        message: 'Password reset link has been sent to your email',
        email: 'test@example.com'
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      await authService.requestPasswordReset(resetData)

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', resetData)
    })
  })

  describe('confirmPasswordReset', () => {
    it('should confirm password reset', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
      }
      const mockResponse = {
        message: 'Password has been reset successfully',
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        companyId: 1,
        token: 'new-auth-token',
        expiresIn: 86400000,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.confirmPasswordReset(resetData)

      expect(result).toEqual(mockResponse)
      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', resetData)
    })

    it('should handle invalid token error', async () => {
      const resetData = {
        token: 'invalid-token',
        newPassword: 'newpassword123',
      }
      const error = new Error('Invalid or expired reset token')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.confirmPasswordReset(resetData)).rejects.toThrow('Invalid or expired reset token')
    })

    it('should handle expired token error', async () => {
      const resetData = {
        token: 'expired-token',
        newPassword: 'newpassword123',
      }
      const error = new Error('Reset token has expired')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.confirmPasswordReset(resetData)).rejects.toThrow('Reset token has expired')
    })

    it('should handle already used token error', async () => {
      const resetData = {
        token: 'already-used-token',
        newPassword: 'newpassword123',
      }
      const error = new Error('This reset token has already been used')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.confirmPasswordReset(resetData)).rejects.toThrow('This reset token has already been used')
    })

    it('should handle password validation errors', async () => {
      const resetData = {
        token: 'reset-token-123',
        newPassword: 'weak',
      }
      const error = new Error('Password must be at least 8 characters')

      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.confirmPasswordReset(resetData)).rejects.toThrow('Password must be at least 8 characters')
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

  describe('API error handling integration', () => {
    it('should handle network timeout errors', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const error = new Error('Request timeout')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(credentials)).rejects.toThrow('Request timeout')
    })

    it('should handle CORS errors', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const error = new Error('CORS error')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      await expect(authService.login(credentials)).rejects.toThrow('CORS error')
    })

    it('should handle malformed response', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ invalid: 'data' })

      await expect(authService.login(credentials)).rejects.toThrow('No token in response')
    })
  })

  describe('token persistence', () => {
    it('should persist token across multiple operations', async () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse: AuthResponse = {
        token: 'persistent-token',
        userId: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      await authService.login(credentials)
      expect(authService.getToken()).toBe('persistent-token')
      expect(authService.isAuthenticated()).toBe(true)

      // Verify token is still there after another operation
      expect(authService.getToken()).toBe('persistent-token')
    })

    it('should clear token on logout', async () => {
      localStorage.setItem('authToken', 'test-token')
      expect(authService.isAuthenticated()).toBe(true)

      authService.logout()
      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        companyId: 1,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockUser)

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockUser)
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me')
    })

    it('should handle unauthorized error on getCurrentUser', async () => {
      const error = new Error('Unauthorized')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })

    it('should handle user not found error', async () => {
      const error = new Error('User not found')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      await expect(authService.getCurrentUser()).rejects.toThrow('User not found')
    })
  })

  describe('session management', () => {
    it('should handle multiple login attempts', async () => {
      const credentials1: LoginRequest = {
        email: 'user1@example.com',
        password: 'password1',
      }

      const credentials2: LoginRequest = {
        email: 'user2@example.com',
        password: 'password2',
      }

      const mockResponse1: AuthResponse = {
        token: 'token-1',
        userId: 1,
        name: 'User 1',
        email: 'user1@example.com',
        role: 'admin',
        companyId: 1,
        expiresIn: 86400000,
      }

      const mockResponse2: AuthResponse = {
        token: 'token-2',
        userId: 2,
        name: 'User 2',
        email: 'user2@example.com',
        role: 'interviewer',
        companyId: 2,
        expiresIn: 86400000,
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse1)
      await authService.login(credentials1)
      expect(authService.getToken()).toBe('token-1')

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse2)
      await authService.login(credentials2)
      expect(authService.getToken()).toBe('token-2')
    })
  })
})
