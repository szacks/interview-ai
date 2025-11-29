import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// Define API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Create axios instance with default configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle error responses
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
      code: error.code,
    };

    if (error.response) {
      // Server responded with error status
      apiError.message = error.response.data?.error || error.response.data?.message || 'Server error';
      apiError.status = error.response.status;

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          apiError.message = 'Access denied';
          break;
        case 404:
          apiError.message = 'Resource not found';
          break;
        case 500:
          apiError.message = 'Internal server error';
          break;
        default:
          break;
      }
    } else if (error.request) {
      // Request made but no response
      apiError.message = 'No response from server';
    } else {
      // Error setting up request
      apiError.message = error.message || 'Request setup failed';
    }

    console.error('API Error:', apiError);
    return Promise.reject(apiError);
  }
);

export default apiClient;
