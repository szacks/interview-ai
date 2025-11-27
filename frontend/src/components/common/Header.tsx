export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Welcome</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="text-sm font-medium text-gray-900">User</span>
          </div>
        </div>
      </div>
    </header>
  );
}
