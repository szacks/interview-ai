import { Outlet, useParams } from 'react-router-dom';

export default function InterviewLayout() {
  const { interviewId } = useParams<{ interviewId: string }>();

  return (
    <div className="h-screen bg-black flex flex-col">
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Interview Room</h1>
            <p className="text-sm text-gray-400">Interview ID: {interviewId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Time Remaining</p>
              <p className="text-lg font-bold text-white">30:00</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
