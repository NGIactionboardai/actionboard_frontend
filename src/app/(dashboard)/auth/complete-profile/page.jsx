'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { editUserInfo, updateUserInfo } from '@/redux/auth/authSlices';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";

// Always register English locale
countries.registerLocale(enLocale);

const CompleteProfilePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dobError, setDobError] = useState('');

  // Build ordered list: [{code, name}]
  const countryOptions = useMemo(() => {
    const names = countries.getNames('en'); // { US: 'United States', ... }
    const arr = Object.entries(names).map(([code, name]) => ({ code, name }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, []);

  useEffect(() => {
    if (user?.country && user?.date_of_birth) {
      router.replace('/auth/profile');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'date_of_birth') {
      validateDob(value);
    }
  };

  const validateDob = (value) => {
    if (!value) {
      setDobError('Date of birth is required');
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
      setDobError('Date of birth cannot be in the future');
      return false;
    } else if (age < 13) {
      setDobError('You must be at least 13 years old');
      return false;
    } else if (age > 120) {
      setDobError('Please enter a valid date of birth');
      return false;
    }
    setDobError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

  

    if (!formData.country) {
      setError('Country is required.');
      return;
    }
    if (!validateDob(formData.date_of_birth)) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await editUserInfo(formData);
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
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
                className={`w-full pl-3 pr-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed border-gray-200 hover:border-gray-300`}
                required
              >
                <option value="">Select your country</option>
                {countryOptions.map(({ code, name }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* DOB Field */}
            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth <span className="text-gray-400">(mm/dd/yyyy)</span>
              </label>
              <DatePicker
                id="date_of_birth"
                selected={
                  formData.date_of_birth
                    ? parse(formData.date_of_birth, "yyyy-MM-dd", new Date())
                    : null
                }
                onChange={(date) => {
                  const isoDate = date ? format(date, "yyyy-MM-dd") : "";
                  handleChange({ target: { name: "date_of_birth", value: isoDate } });
                }}
                dateFormat="MM/dd/yyyy"
                placeholderText="MM/DD/YYYY"
                maxDate={new Date()}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                className="w-full border-2 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-200 hover:border-gray-300"
                required
              />
              {dobError && (
                <p className="mt-1 text-sm text-red-600">{dobError}</p>
              )}
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
