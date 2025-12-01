import type { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import authService from '../../services/authService';

const Sidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">InterviewAI</h1>
      </div>

      <nav className="px-6 py-8 space-y-2 flex-1">
        <Link
          to="/dashboard"
          className={`block px-4 py-3 rounded-lg font-medium transition ${
            isActive('/dashboard')
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/interviews"
          className={`block px-4 py-3 rounded-lg font-medium transition ${
            isActive('/interviews')
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Interviews
        </Link>

        <Link
          to="/candidates"
          className={`block px-4 py-3 rounded-lg font-medium transition ${
            isActive('/candidates')
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Candidates
        </Link>

        {isAdmin && (
          <Link
            to="/teams"
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              isActive('/teams')
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Team Management
          </Link>
        )}

        <Link
          to="/settings"
          className={`block px-4 py-3 rounded-lg font-medium transition ${
            isActive('/settings')
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Settings
        </Link>
      </nav>

      <div className="px-6 pb-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg font-medium transition bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
