import type { FC } from 'react';
import type { User } from '../../stores/authStore';

export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-card border-b border-border">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-base font-medium text-foreground">{user?.email || 'User'}</span>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 text-base font-medium text-foreground bg-card border border-border hover:bg-secondary rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
