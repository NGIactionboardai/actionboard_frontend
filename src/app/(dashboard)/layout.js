// src/app/(dashboard)/layout.js
import Navbar from '@/app/components/layout/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import NewNavbar from '../components/layout/NewNavbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <NewNavbar />
      <ProtectedRoute>
        <main className="mt-20 p-0">{children}</main>
      </ProtectedRoute>
    </div>
  );
}
