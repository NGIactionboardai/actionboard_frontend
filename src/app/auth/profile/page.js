'use client';

import { useState } from 'react';
import { User, Mail, Calendar, MapPin, Lock, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../redux/auth/authSlices'; // Adjust path as needed
import ChangePasswordModal from '@/app/components/auth/ChangePasswordModal';
import AddPasswordModal from '@/app/components/auth/AddPasswordModal';
import EditInfoModal from '@/app/components/auth/EditInfoModal';
import withProfileCompletionGuard from '@/app/components/withProfileCompletionGuard';

function ProfilePage() {
  const user = useSelector(selectUser);
  const [isAddPasswordOpen, setIsAddPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


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
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {getUserDisplayName()}
              </h1>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{user.email}</p>
              
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


      {/* Security Section */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security & Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                  <p className="text-xs text-gray-500">
                    {user.has_password ? 'Last updated recently' : 'No password set yet'}
                  </p>
                </div>
              </div>

              {user.has_password ? (
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              ) : (
                <button
                  onClick={() => setIsAddPasswordOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Add Password
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
              </div>
              <Link
                href="/security/2fa"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                Setup
              </Link>
            </div>
          </div>
        </div>
      </div> */}

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
