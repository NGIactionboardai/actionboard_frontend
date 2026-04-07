// src/app/(dashboard)/auth/profile/page.js
'use client';

import { useState } from 'react';
import { User, Mail, Calendar, MapPin, Lock, Settings, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../../redux/auth/authSlices'; // Adjust path as needed
import ChangePasswordModal from '@/app/components/auth/ChangePasswordModal';
import AddPasswordModal from '@/app/components/auth/AddPasswordModal';
import EditInfoModal from '@/app/components/auth/EditInfoModal';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';
import { useRouter } from "next/navigation";
import axios from "axios";


function ProfilePage() {
  const user = useSelector(selectUser);
  const billing = useSelector((state) => state.billing);
  const sub = billing.subscription;

  const isFreePlan =
    !sub ||
    !sub.has_subscription ||
    sub?.plan?.name === "Free";

  const isPaidPlan =
    sub &&
    sub.has_subscription &&
    sub?.plan?.name !== "Free";
  const [isAddPasswordOpen, setIsAddPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const router = useRouter();


  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleCustomerPortal = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/billing/customer-portal/`,
      );
  
      window.location.href = res.data.url; // ✅ correct
    } catch (err) {
      console.error("Portal Error:", err.response?.data || err.message);
    }
  };


  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.name) {
      return user.name;
    }
    return 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // local date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/organizations");
            }
          }}
          className="absolute top-22 left-6 flex items-center gap-2 px-4 py-2 rounded-lg
          bg-blue-50 text-blue-700 text-sm font-medium
          border border-blue-200
          hover:bg-blue-100 hover:text-blue-800
          transition-all duration-200"
        >
          <ChevronLeft size={18} />
          Back
        </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
            
            {/* Avatar */}
            <div className="flex-shrink-0 self-center sm:self-auto">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                {getUserInitials()}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate"
                title={getUserDisplayName()} // tooltip shows full name
              >
                {getUserDisplayName()}
              </h1>
              <p
                className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base truncate"
                title={user.email} // tooltip shows full email
              >
                {user.email}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                {user.has_password ? (
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                  >
                    <Lock className="w-4 h-4 mr-1 sm:mr-2" />
                    Change Password
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddPasswordOpen(true)}
                    className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                  >
                    <Lock className="w-4 h-4 mr-1 sm:mr-2" />
                    Add Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
              Profile Information
            </h2>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-sm px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full sm:w-auto"
            >
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={user.first_name || user.firstName || ''}
                  readOnly
                  className="w-full pl-11 pr-4 py-2 sm:py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Not provided"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={user.last_name || user.lastName || ''}
                  readOnly
                  className="w-full pl-11 pr-4 py-2 sm:py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Not provided"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={user.email || ''}
                  readOnly
                  className="w-full pl-11 pr-4 py-2 sm:py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Not provided"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formatDate(user.date_of_birth)}
                  readOnly
                  className="w-full pl-11 pr-4 py-2 sm:py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={user.country || 'Not provided'}
                  readOnly
                  className="w-full pl-11 pr-4 py-2 sm:py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white mb-9 rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center sm:text-left">
            Account Status
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Account Active */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-green-800">Account Active</p>
              <p className="text-xs text-green-600 mt-1">Your account is verified and active</p>
            </div>

            {/* Email Verified */}
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-blue-800">Email Verified</p>
              <p className="text-xs text-blue-600 mt-1">Your email address is confirmed</p>
            </div>

            {/* Profile Complete */}
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-purple-800">Profile Complete</p>
              <p className="text-xs text-purple-600 mt-1">All required information provided</p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Subscription */}
      <div className="bg-white mb-7 rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Billing & Subscription
          </h2>

          {isFreePlan ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                You are currently on the free plan. Upgrade to unlock premium features.
              </p>

              <button
                onClick={() => router.push("/billing/upgrade")}
                className="w-full sm:w-auto bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                Upgrade Plan
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Update your payment method, download invoices, or cancel your subscription.
              </p>

              <button
                onClick={handleCustomerPortal}
                className="w-full sm:w-auto bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white px-4 py-2 rounded-lg hover:opacity-90"
              >
                Manage Subscription
              </button>

              <p className="text-xs text-gray-500 mt-2">
                You’ll be redirected to our secure billing partner (Stripe).
              </p>
            </>
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <AddPasswordModal
        isOpen={isAddPasswordOpen}
        onClose={() => setIsAddPasswordOpen(false)}
      />

      <EditInfoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

export default withProfileCompletionGuard(ProfilePage)
