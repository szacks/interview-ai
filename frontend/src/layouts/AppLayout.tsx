import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthPage && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              InterviewAI
            </Link>
            <div className="flex gap-4">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === '/login'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === '/signup'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Signup
              </Link>
            </div>
          </div>
        </nav>
      )}
      <Outlet />
    </div>
  );
}
