import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  companyName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    companyName: string;
    role: string;
  };
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
        localStorage.setItem('authToken', authData.token);
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
        localStorage.setItem('authToken', authData.token);
        return authData as AuthResponse;
      }
      throw new Error('No token in response');
    } catch (error) {
      throw error;
    }
  },

  // User logout
  logout: (): void => {
    localStorage.removeItem('authToken');
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
    return !!localStorage.getItem('authToken');
  },

  // Get stored auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },
};

export default authService;
