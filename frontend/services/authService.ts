import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: string;
  companyId: number;
  expiresIn: number;
  message?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

const authService = {
  // User login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const authData = (response as any)?.data || response;
      if (authData?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', authData.token);
        }
        return authData as AuthResponse;
      }
      throw new Error('No token in response');
    } catch (error) {
      throw error;
    }
  },

  // User signup
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/signup', data);
      const authData = (response as any)?.data || response;
      if (authData?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', authData.token);
        }
        return authData as AuthResponse;
      }
      throw new Error('No token in response');
    } catch (error) {
      throw error;
    }
  },

  // User logout
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },

  // Request password reset
  requestPasswordReset: async (
    data: PasswordResetRequest
  ): Promise<any> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response;
  },

  // Confirm password reset
  confirmPasswordReset: async (
    data: PasswordResetConfirm
  ): Promise<any> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  },

  // Get stored auth token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
};

export default authService;
