import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">InterviewAI</h1>
      </div>

      <nav className="px-6 py-8 space-y-2">
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

      <div className="absolute bottom-0 w-64 p-6 border-t">
        <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition">
          Logout
        </button>
      </div>
    </div>
  );
}
