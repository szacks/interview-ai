import type { FC } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import authService from '../../services/authService';

const Sidebar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold text-sidebar-primary">InterviewAI</h1>
      </div>

      <nav className="px-4 py-6 space-y-1 flex-1">
        <Link
          to="/dashboard"
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive('/dashboard')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          Dashboard
        </Link>

        <Link
          to="/interviews"
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive('/interviews')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          Interviews
        </Link>

        <Link
          to="/candidates"
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive('/candidates')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          Candidates
        </Link>

        <Link
          to="/settings"
          className={`block px-4 py-3 rounded-lg text-sm font-medium transition ${
            isActive('/settings')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
        >
          Settings
        </Link>
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg text-sm font-medium transition bg-destructive text-destructive-foreground hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
