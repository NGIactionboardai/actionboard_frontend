'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const platforms = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave'];
const categories = ['Login', 'Calendar', 'Meeting', 'Other'];
const severities = ['Low', 'Medium', 'High', 'Critical'];

export default function BugReportModal({ isOpen, onClose }) {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedSeverity, setSelectedSeverity] = useState(severities[0]);

  // form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setDescription('');
      setSteps('');
      setSelectedPlatform(platforms[0]);
      setSelectedCategory(categories[0]);
      setSelectedSeverity(severities[0]);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!description.trim()) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const payload = {
        title: `${selectedCategory} issue on ${selectedPlatform}`,
        description,
        steps_to_reproduce: steps,
        severity: selectedSeverity.toLowerCase(),
        reporter_email: email,
        reporter_name: name,
      };
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/support/bug-reports/`;
      await axios.post(url, payload);
      toast.success('Bug report submitted successfully!');
      onClose();
    } catch (err) {
      console.error('Failed to submit bug report', err.response?.data || err.message);
      toast.error('Something went wrong. Please try again.');
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

        {/* Center Modal */}
        <div className="fixed inset-0 overflow-visible">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    Report a Bug
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Bug Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <div className="relative">
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8"
                      >
                        {platforms.map((platform, idx) => (
                          <option key={idx} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8"
                      >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description of the issue
                    </label>
                    <textarea
                      rows="3"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Steps */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Steps to reproduce (optional)
                    </label>
                    <textarea
                      rows="3"
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={steps}
                      onChange={(e) => setSteps(e.target.value)}
                    />
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white appearance-none pr-8"
                      >
                        {severities.map((sev, idx) => (
                          <option key={idx} value={sev}>
                            {sev}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm text-white rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Bug'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
