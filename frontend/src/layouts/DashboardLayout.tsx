import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import { useAuthStore } from '../stores/authStore';

const DashboardLayout: FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header user={user} onLogout={logout} />
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
