// src/app/(ai-chat)/layout.js
import Navbar from '@/app/components/layout/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import NewNavbar from '../components/layout/NewNavbar';

export default function AiChatLayout({ children }) {
  return (
    <div className="h-screen bg-gray-50">
      {/* <Navbar /> */}
      <NewNavbar />
      <ProtectedRoute>
        <main className="p-0 pt-20 overflow-y-hidden">{children}</main>
      </ProtectedRoute>
    </div>
  );
}
