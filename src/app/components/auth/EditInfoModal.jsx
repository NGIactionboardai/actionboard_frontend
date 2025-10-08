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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";

countries.registerLocale(enLocale);

export default function EditInfoModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dobError, setDobError] = useState("");

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
      setDobError('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    if (e.target.name === "date_of_birth") {
       validateDob(e.target.value);
    }
  };

  const handleCountrySelect = (e) => {
    setForm((s) => ({ ...s, country: e.target.value }));
  };
  const validateDob = (value) => {
   if (!value) {
     setDobError("Date of birth is required");
     return false;
   }
   const dob = new Date(value);
   const today = new Date();
   let age = today.getFullYear() - dob.getFullYear();
   const monthDiff = today.getMonth() - dob.getMonth();
   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
     age--;
   }

   if (dob > today) {
     setDobError("Date of birth cannot be in the future");
     return false;
   } else if (age < 13) {
     setDobError("You must be at least 13 years old");
     return false;
   } else if (age > 120) {
     setDobError("Please enter a valid date of birth");
     return false;
   }
   setDobError("");
   return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setDobError('');
  
    // basic required checks
    if (!form.first_name.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }
    if (!form.last_name.trim()) {
      setError("Last name is required");
      setLoading(false);
      return;
    }
    if (!form.country) {
      setError("Country is required");
      setLoading(false);
      return;
    }
    if (!form.date_of_birth) {
      setDobError("Date of birth is required");
      setLoading(false);
      return;
    }
  
    //  Restrict special characters
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/; // only letters + spaces
    if (!nameRegex.test(form.first_name) || !nameRegex.test(form.last_name)) {
      setError("Names can only contain letters and spaces");
      setLoading(false);
      return;
    }
  
    // length enforcement
    if (form.first_name.length > 30 || form.last_name.length > 50) {
      setError("Names cannot exceed 30 characters");
      setLoading(false);
      return;
    }
  
    // validate DOB
    if (!validateDob(form.date_of_birth)) {
      setLoading(false);
      return;
    }
  
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
                  {/* Global error */}
                  {error && (
                    <div className="p-2 rounded-md bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      maxLength={30}
                      required
                      placeholder="Enter your first name"
                      className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      maxLength={50}
                      required
                      placeholder="Enter your last name"
                      className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <div className="relative">
                      <select
                        id="country"
                        name="country"
                        value={form.country}
                        onChange={handleCountrySelect}
                        required
                        className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm bg-white appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Country</option>
                        {countryOptions.map(({ code, name }) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>

                      {/* Dropdown arrow */}
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>


                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="date_of_birth"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date of Birth <span className="text-gray-400">(mm/dd/yyyy)</span>
                    </label>

                    <DatePicker
                      id="date_of_birth"
                      selected={
                        form.date_of_birth
                          ? parse(form.date_of_birth, "yyyy-MM-dd", new Date()) // convert ISO string to Date
                          : null
                      }
                      onChange={(date) => {
                        handleChange({
                          target: {
                            name: "date_of_birth",
                            value: date ? format(date, "yyyy-MM-dd") : "", // keep backend-friendly yyyy-mm-dd
                          },
                        });
                      }}
                      dateFormat="MM/dd/yyyy" // 👈 force mm/dd/yyyy display
                      placeholderText="MM/DD/YYYY"
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      required
                      className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    {dobError && (
                      <p className="mt-1 text-sm text-red-600">{dobError}</p>
                    )}
                  </div>
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
