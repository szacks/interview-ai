import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuthStore } from '../stores/authStore';

const DashboardLayout: FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={logout} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
