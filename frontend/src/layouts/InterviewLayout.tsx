import { Outlet } from 'react-router-dom';

export default function InterviewLayout() {
  return (
    <div className="h-screen bg-black flex flex-col">
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
