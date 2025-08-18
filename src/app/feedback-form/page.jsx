'use client';

import { useState } from 'react';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback submitted:', form);
    // 🔗 Connect to API here
  };

  const ratingEmojis = ['😞', '😕', '😐', '😊', '🤩'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-10 border border-gray-100">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Share Your Feedback
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Help us improve ActionBoard by sharing your experience ✨
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
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Section: Rating */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Overall Experience
            </h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="rating"
                min="1"
                max="5"
                value={form.rating}
                onChange={handleChange}
                className="w-full accent-indigo-600"
              />
              <span className="text-2xl">{ratingEmojis[form.rating - 1]}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">1 = Poor, 5 = Excellent</p>
          </div>

          {/* Section: Text Questions */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What do you like most about ActionBoard?
              </label>
              <textarea
                name="likes"
                value={form.likes}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What do you find confusing or difficult?
              </label>
              <textarea
                name="difficulties"
                value={form.difficulties}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features you wish were added/improved
              </label>
              <textarea
                name="features"
                value={form.features}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any other comments/suggestions
              </label>
              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
