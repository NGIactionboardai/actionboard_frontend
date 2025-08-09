'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editUserInfo, updateUserInfo } from '@/redux/auth/authSlices'; // keep your existing imports
import { selectUser } from '@/redux/auth/authSlices';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

if (!countries.getNames('en')) {
  countries.registerLocale(enLocale);
}

export default function EditInfoModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Normalize incoming country (if user.country might be a name or a code)
  const normalizeToCode = (value) => {
    if (!value) return '';
    // If already looks like a 2-letter code, return uppercase
    if (typeof value === 'string' && value.length === 2) return value.toUpperCase();
    // Try to map name -> alpha2 code
    const code = countries.getAlpha2Code(String(value), 'en');
    return code || ''; // empty if we couldn't map
  };

  // Build ordered list of country options: [{code, name}]
  const countryOptions = useMemo(() => {
    const names = countries.getNames('en'); // { US: 'United States', ...}
    const arr = Object.entries(names).map(([code, name]) => ({ code, name }));
    // Sort by name
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, []);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    country: '',        // always store ISO alpha-2 code here
    date_of_birth: '',
  });

  // Reset form whenever modal opens (and populate with user)
  useEffect(() => {
    if (isOpen) {
      setForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        country: normalizeToCode(user?.country || ''), // ensure ISO code
        date_of_birth: user?.date_of_birth || '',
      });
      setError('');
      setLoading(false);
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleCountrySelect = (e) => {
    setForm((s) => ({ ...s, country: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // send country as ISO code (form.country)
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

        {/* Panel */}
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

                <div className="space-y-4">
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {/* Styled native select for countries (matches other inputs) */}
                  <div className="relative">
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleCountrySelect}
                      className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Country</option>
                      {countryOptions.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>

                    {/* small arrow to mimic select styling consistently */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

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
                      loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
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
