// src/app/components/auth/EditInfoModal.jsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDispatch, useSelector } from 'react-redux';
// import { updateUserInfo as updateUserInfoApi } from '@/api/auth';
import { editUserInfo, updateUserInfo } from '@/redux/auth/authSlices';
import { selectUser } from '@/redux/auth/authSlices';
import toast from 'react-hot-toast';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

export default function EditInfoModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await editUserInfo(form);
      dispatch(updateUserInfo({ user: data.user }));
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to update info');
      toast.error('Failed to update info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>

        {/* Modal Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Edit Profile Information
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                        <option value="">Select Country</option>
                        {[
                            'United States', 'India', 'United Kingdom', 'Canada', 'Australia',
                            'Germany', 'France', 'Brazil', 'China', 'Japan', 'South Korea', 'Mexico',
                            'Italy', 'Spain', 'Russia', 'Netherlands', 'Singapore', 'South Africa',
                            'Indonesia', 'New Zealand', 'Bangladesh', 'Pakistan', 'Sri Lanka'
                        ].map((country) => (
                            <option key={country} value={country}>
                            {country}
                            </option>
                        ))}
                  </select>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 text-sm text-white rounded-md ${
                      loading
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
