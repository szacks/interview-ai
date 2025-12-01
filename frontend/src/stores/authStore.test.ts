import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    })
  })

  describe('Initial state', () => {
    it('should have correct initial state', () => {
      const store = useAuthStore.getState()
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }
      useAuthStore.getState().setUser(testUser)
      expect(useAuthStore.getState().user).toEqual(testUser)
    })

    it('should set user to null', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }
      useAuthStore.getState().setUser(testUser)
      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should set token', () => {
      const token = 'test-token-123'
      useAuthStore.getState().setToken(token)
      expect(useAuthStore.getState().token).toBe(token)
    })

    it('should set token to null', () => {
      useAuthStore.getState().setToken('test-token')
      useAuthStore.getState().setToken(null)
      expect(useAuthStore.getState().token).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useAuthStore.getState().setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)
    })

    it('should set loading to false', () => {
      useAuthStore.getState().setLoading(true)
      useAuthStore.getState().setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      const errorMsg = 'Authentication failed'
      useAuthStore.getState().setError(errorMsg)
      expect(useAuthStore.getState().error).toBe(errorMsg)
    })

    it('should set error to null', () => {
      useAuthStore.getState().setError('error')
      useAuthStore.getState().setError(null)
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('setAuthenticated', () => {
    it('should set authenticated to true', () => {
      useAuthStore.getState().setAuthenticated(true)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    it('should set authenticated to false', () => {
      useAuthStore.getState().setAuthenticated(true)
      useAuthStore.getState().setAuthenticated(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('should set user, token, and authenticated on login', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }
      const token = 'auth-token'

      useAuthStore.getState().login(testUser, token)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(testUser)
      expect(state.token).toBe(token)
      expect(state.isAuthenticated).toBe(true)
    })

    it('should clear error and loading on login', () => {
      useAuthStore.setState({
        isLoading: true,
        error: 'Previous error',
      })

      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }

      useAuthStore.getState().login(testUser, 'token')

      const state = useAuthStore.getState()
      expect(state.error).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and token on logout', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }
      useAuthStore.setState({
        user: testUser,
        token: 'auth-token',
        isAuthenticated: true,
      })

      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should clear error on logout', () => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', role: 'interviewer' },
        token: 'token',
        isAuthenticated: true,
        error: 'Some error',
      })

      useAuthStore.getState().logout()

      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user properties', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
      }
      useAuthStore.getState().setUser(testUser)

      useAuthStore.getState().updateUser({ email: 'newemail@example.com' })

      const updated = useAuthStore.getState().user
      expect(updated?.email).toBe('newemail@example.com')
      expect(updated?.id).toBe('1')
    })

    it('should do nothing if user is null', () => {
      useAuthStore.getState().updateUser({ email: 'test@example.com' })
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('should update multiple properties', () => {
      const testUser: User = {
        id: '1',
        email: 'test@example.com',
        role: 'interviewer',
        companyName: 'Old Company',
      }
      useAuthStore.getState().setUser(testUser)

      useAuthStore.getState().updateUser({
        email: 'newemail@example.com',
        companyName: 'New Company',
      })

      const updated = useAuthStore.getState().user
      expect(updated?.email).toBe('newemail@example.com')
      expect(updated?.companyName).toBe('New Company')
    })
  })

  describe('clearError', () => {
    it('should clear error message', () => {
      useAuthStore.setState({ error: 'Some error' })
      useAuthStore.getState().clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('should work when error is already null', () => {
      useAuthStore.setState({ error: null })
      useAuthStore.getState().clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })
  })

  describe('Persistence middleware', () => {
    it('should have persist middleware configured', () => {
      const store = useAuthStore
      expect(store.persist).toBeDefined()
    })
  })
})
