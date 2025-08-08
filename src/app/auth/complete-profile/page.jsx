'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { CountryDropdown } from 'react-country-region-selector';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { editUserInfo, updateUserInfo } from '@/redux/auth/authSlices';

const CompleteProfilePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [country, setCountry] = useState(user?.country || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.country && user?.date_of_birth) {
      router.replace('/auth/profile');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!country || !dob) {
      setError('Both fields are required.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await editUserInfo({ country, date_of_birth: dob });
      dispatch(updateUserInfo({ user: data.user }));
      toast.success('Profile completed!');
      router.push('/organizations');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] rounded-full mb-4 shadow-lg">
            <span className="text-white text-xl font-bold">+</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Just one more step to get started</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <CountryDropdown
                value={country}
                onChange={(val) => setCountry(val)}
                classes="w-full border-2 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200 hover:border-gray-300"
              />
            </div>

            {/* DOB Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border-2 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200 hover:border-gray-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>

        {/* Optional Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          You can update this info later in your profile settings.
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
