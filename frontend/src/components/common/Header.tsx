import type { FC } from 'react';
import type { User } from '../../stores/authStore';

export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Welcome</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-900">{user?.email || 'User'}</span>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
