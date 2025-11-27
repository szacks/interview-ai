import { useParams } from 'react-router-dom';

export default function InterviewPage() {
  const { interviewId } = useParams();

  return (
    <div className="h-full flex flex-col bg-black text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold">Interview Room</h1>
        <p className="text-gray-400 text-sm">Interview ID: {interviewId}</p>
      </header>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-900 rounded-lg overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="font-semibold">Code Editor</h2>
          </div>
          <div className="flex-1 bg-gray-950 p-4 font-mono text-sm overflow-auto">
            <p className="text-gray-500">Code editor will be integrated here</p>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-4">
          <div className="flex-1 flex flex-col bg-gray-900 rounded-lg overflow-hidden">
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <h2 className="font-semibold">Chat</h2>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <p className="text-gray-500 text-sm">Chat messages will appear here</p>
            </div>
            <div className="border-t border-gray-700 p-4">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-shrink-0 bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Timer</h3>
            <div className="text-4xl font-mono font-bold text-center text-blue-400">
              30:00
            </div>
            <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
