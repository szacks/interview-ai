import axios from 'axios';
import type { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { apiConfig } from '@/config/app.config';

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

// Create axios instance with configuration from centralized config
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    // Don't throw on any status code; let interceptor handle it
    return true;
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Adding auth token to request:', config.url);
    } else {
      console.log('[API Client] No auth token found for request:', config.url);
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
    // With validateStatus: () => true, all responses come here, including error statuses
    const status = response.status;

    if (status >= 200 && status < 300) {
      // Success response
      console.log('[API Client] Successful response:', response.config.url, status);
      // For binary responses (arraybuffer, blob), return the full response
      // For JSON responses, return just the data
      if (response.config.responseType === 'arraybuffer' || response.config.responseType === 'blob') {
        return response;
      }
      return response.data;
    }

    // Error response
    const apiError: ApiError = {
      message: 'An error occurred',
      status: status,
      code: response.statusText,
    };

    apiError.message = response.data?.error || response.data?.message || 'Server error';

    // Handle specific status codes
    switch (status) {
      case 401:
        // Unauthorized - only redirect if not on login/signup page
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        }
        console.error('[API Client] Unauthorized:', { url: response.config.url });
        break;
      case 403:
        apiError.message = 'Access denied';
        console.error('[API Client] Forbidden:', { url: response.config.url });
        break;
      case 404:
        apiError.message = 'Resource not found';
        console.error('[API Client] Not found:', { url: response.config.url });
        break;
      case 500:
        apiError.message = 'Internal server error';
        console.error('[API Client] Server error:', { url: response.config.url, data: response.data });
        break;
      default:
        console.error('[API Client] Error response:', {
          url: response.config.url,
          status: status,
          message: apiError.message,
        });
    }

    return Promise.reject(apiError);
  },
  (error: AxiosError<ApiResponse>) => {
    // This handles network errors, not HTTP errors
    const apiError: ApiError = {
      message: error.message || 'Request failed',
      code: error.code,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.message = error.response.data?.error || error.response.data?.message || error.message;
      console.error('[API Client] Response error:', { url: error.config?.url, status: error.response.status });
    } else if (error.request) {
      apiError.message = 'No response from server';
      console.error('[API Client] No response:', error.config?.url);
    } else {
      console.error('[API Client] Request setup error:', error.message);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
