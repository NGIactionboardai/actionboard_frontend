// src/app/(dashboard)/layout.js
import Navbar from '@/app/components/layout/Navbar';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProtectedRoute>
        <main className="p-0">{children}</main>
      </ProtectedRoute>
    </div>
  );
}
