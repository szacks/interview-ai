import Card from '../components/common/Card';

export default function DashboardPage() {
  // Mock data for dashboard metrics
  const metrics = {
    activeInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0,
    totalCandidates: 0,
  };

  const recentInterviews = [
    // Example structure for recent interviews
    // {
    //   id: '1',
    //   candidateName: 'John Doe',
    //   position: 'Senior Engineer',
    //   status: 'in-progress' | 'completed' | 'pending',
    //   scheduledDate: '2024-01-15',
    //   duration: 60,
    // }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your interview dashboard. Manage your interviews and view candidate results.
          </p>
        </div>

        {/* Key Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Interviews Card */}
            <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Interviews</p>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {metrics.activeInterviews}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <span className="text-blue-600 text-lg">▶</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">Currently in progress</p>
            </Card>

            {/* Completed Interviews Card */}
            <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {metrics.completedInterviews}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">Finished interviews</p>
            </Card>

            {/* Pending Interviews Card */}
            <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">
                    {metrics.pendingInterviews}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <span className="text-yellow-600 text-lg">⏱</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">Awaiting scheduling</p>
            </Card>

            {/* Total Candidates Card */}
            <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="mt-2 text-3xl font-bold text-purple-600">
                    {metrics.totalCandidates}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">All candidates</p>
            </Card>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <Card variant="elevated" padding="md">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Schedule Interview
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                View Candidates
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                Analytics
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Interviews Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Interviews</h2>
          <Card variant="elevated" padding="md">
            {recentInterviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <p className="text-gray-600 font-medium">No interviews yet</p>
                <p className="mt-1 text-sm text-gray-500">Create one to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Candidate
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Scheduled
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInterviews.map((interview) => (
                      <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{interview.candidateName}</td>
                        <td className="px-4 py-3 text-gray-600">{interview.position}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              interview.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : interview.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {interview.status.charAt(0).toUpperCase() +
                              interview.status.slice(1).replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{interview.scheduledDate}</td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
