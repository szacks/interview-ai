import { useAuthStore } from '../stores/authStore';

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (requiredRole: string): boolean => {
  const { user } = useAuthStore();
  return user?.role === requiredRole;
};

/**
 * Hook to check if user has one of the specified roles
 */
export const useHasAnyRole = (requiredRoles: string[]): boolean => {
  const { user } = useAuthStore();
  return user ? requiredRoles.includes(user.role) : false;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { user } = useAuthStore();
  return user;
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuthStore();
  return user?.role === 'admin';
};

/**
 * Hook to check if user is interviewer
 */
export const useIsInterviewer = (): boolean => {
  const { user } = useAuthStore();
  return user?.role === 'interviewer';
};

/**
 * Check if token is expired based on expiration time
 */
export const isTokenExpired = (expirationTime: number): boolean => {
  const now = Date.now();
  return now > expirationTime;
};

/**
 * Get remaining token validity time in seconds
 */
export const getTokenExpiresIn = (expirationTime: number): number => {
  const now = Date.now();
  const remaining = expirationTime - now;
  return remaining > 0 ? Math.floor(remaining / 1000) : 0;
};
