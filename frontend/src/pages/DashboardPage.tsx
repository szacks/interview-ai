import Card from '../components/common/Card';
import InterviewList from '../components/InterviewList';

export default function DashboardPage() {
  // Mock data for dashboard metrics
  const metrics = {
    activeInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0,
    totalCandidates: 0,
  };


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
          <InterviewList />
        </div>
      </div>
    </div>
  );
}
