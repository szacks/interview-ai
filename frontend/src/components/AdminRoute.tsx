import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const AdminRoute = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role?.toUpperCase() !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
