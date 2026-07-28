import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
