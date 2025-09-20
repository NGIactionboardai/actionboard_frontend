'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    rating: 3,
    likes: '',
    difficulties: '',
    features: '',
    comments: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (form.rating < 1 || form.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/support/feedback/submit/`,
        {
          name: form.name,
          email: form.email,
          overall_experience: form.rating,
          like_most: form.likes,
          confusing_or_difficult: form.difficulties,
          features_wished: form.features,
          other_comments: form.comments,
        }
      );

      toast.success('Thank you for your feedback! 🎉');
      setForm({
        name: '',
        email: '',
        rating: 3,
        likes: '',
        difficulties: '',
        features: '',
        comments: '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ratingOptions = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' },
  ];

  const featuresOptions = [
    'Smart Calendar',
    'Seamless Meeting Scheduling',
    'AI-Powered Summaries',
    'Cross-Platform Sync',
    'Beautiful UI/UX',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full mt-20 max-w-3xl bg-white shadow-2xl rounded-2xl p-6 sm:p-10 border border-gray-100">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Share Your Feedback
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Help us improve Nous Meeting by sharing your experience ✨
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Your Info</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Section: Rating */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Overall Experience
            </h2>
            <div className="flex flex-col gap-2">
              {ratingOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="rating"
                    value={opt.value}
                    checked={Number(form.rating) === opt.value}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
          </div>

          {/* Section: Text + Dropdown */}
          <div className="space-y-6">
            {/* Likes dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What do you like most about Nous Meeting?
              </label>
              <select
                name="likes"
                value={form.likes}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition bg-white"
              >
                <option value="">Select an option</option>
                {featuresOptions.map((feature, idx) => (
                  <option key={idx} value={feature}>
                    {feature}
                  </option>
                ))}
              </select>
            </div>

            {/* Other text inputs */}
            {[
              { label: 'What do you find confusing or difficult?', name: 'difficulties' },
              { label: 'Features you wish were added/improved', name: 'features' },
              { label: 'Any other comments/suggestions', name: 'comments' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;