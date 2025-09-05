'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import BugReportModal from '../../components/BugReportModal';

const HelpPage = () => {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const faqs = [
    { q: 'How do I create an organization?', a: 'Go to the Organizations page, click "+ Add Organization", and follow the form to create a new workspace. You can later invite members via email.' },
    { q: 'Can I integrate with Zoom?', a: 'Yes. Navigate to Configure Meeting Tools > Zoom. From there, connect your Zoom account and manage the integration, including enabling automatic recording and transcription.' },
    { q: 'Do I need Zoom for Nous Meeting to work?', a: 'No, Nous Meeting works without Zoom, but Zoom integration unlocks features like meeting creation, transcription, AI Meeting insights etc' },
    { q: 'Where can I find my meeting reports?', a: 'Go to Calendar > Reports. Reports include total meetings, participant breakdown, organization-level summaries, action items, and speaker sentiment analytics.' },
    { q: 'How do I view transcripts and summaries?', a: 'Open a meeting from the Meetings page. You’ll see a speaker-based transcript, key highlights, summaries, and sentiment analysis in the meeting details view.' },
    { q: 'How do I reset my password?', a: 'On the login page, click "Forgot Password". Enter your email, verify the OTP, and set a new password. You’ll be automatically logged in afterwards.' },
    { q: 'How can I update my profile information?', a: 'Go to Profile > Edit Info. You can update your name, email, country, date of birth, and password. Changes are saved immediately.' },
    { q: 'What happens if my session expires?', a: 'If your session expires, Nous Meeting will refresh it automatically in the background. If refresh fails, you’ll be redirected to the login page.' },
    { q: 'Is my data secure?', a: 'Yes. Nous Meeting employs encryption and secure storage for all your meeting data, including transcripts and reports. Data is never sold or shared with third parties.' },
    { q: 'What platforms does Nous Meeting support?', a: 'Nous Meeting is currently supports only zoom' },
  ];

  // form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // validate form
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  // handle submit query
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
      const payload = { ...form };
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/support/queries/`;
      await axios.post(url, payload);
      toast.success('Your query has been submitted successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit query', err.response?.data || err.message);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        {/* Header */}
        <div className="text-center px-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            Help & Support
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Find guidance, FAQs, and report issues
          </p>
        </div>
  
        {/* User Manual */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            User Manual
          </h2>
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-3 text-gray-700">
            <p className="mb-2 text-sm sm:text-base">
              Here’s a quick overview of what you can do with Nous Meeting:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base">
              <li>Create organizations workspaces.</li>
              <li>Schedule and manage meetings directly inside Nous Meeting.</li>
              <li>Connect with Zoom for transcription, recording, and meeting sync.</li>
              <li>View meeting summaries, action items, and speaker sentiment analytics.</li>
              <li>Use the calendar to track all events and generate reports.</li>
            </ul>
  
            {/* Download Button */}
            <div className="mt-6">
              <a
                href="/manuals/Nousmeeting_User_Manual.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Download Full User Manual (PDF)
              </a>
            </div>
          </div>
        </section>
  
        {/* FAQs */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-white rounded-lg shadow p-3 sm:p-4 cursor-pointer"
              >
                <summary className="font-semibold text-gray-800 text-sm sm:text-base">
                  {faq.q}
                </summary>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Us / Query Form */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
            Still have questions? Contact Us
          </h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4 max-w-2xl mx-auto"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow transition-all duration-200 ${
                  loading
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </section>
  
        {/* Bug Report */}
        <section className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            Need more help?
          </h2>
          <button
            onClick={() => setIsBugModalOpen(true)}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white text-sm sm:text-base rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            Report a Bug
          </button>
        </section>
      </div>
  
      {/* Bug Report Modal */}
      <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </div>
  );
};

export default HelpPage;
