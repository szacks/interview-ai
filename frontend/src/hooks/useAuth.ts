import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook that provides auth utilities and navigation
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogin = (user: any, token: string) => {
    login(user, token);
    navigate('/dashboard');
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    setLoading,
    setError,
    clearError,
  };
};

/**
 * Hook for checking if user needs to be redirected
 */
export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const redirectIfAuthenticated = (path: string = '/dashboard') => {
    if (isAuthenticated) {
      navigate(path);
    }
  };

  const redirectIfNotAuthenticated = (path: string = '/login') => {
    if (!isAuthenticated) {
      navigate(path);
    }
  };

  return { redirectIfAuthenticated, redirectIfNotAuthenticated };
};
