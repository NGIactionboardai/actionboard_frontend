'use client';

import { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { X, ArrowDown, Sparkles, Book, MessageCircle, Bug, Download, HelpCircle, Users, Clock, CheckCircle, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const scrollToContent = () => {
    document.getElementById("help-content")?.scrollIntoView({ 
      behavior: "smooth",
      block: "start"
    });
  };

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

  const stats = [
    { label: "Response Time", value: "< 2 hours", icon: <Clock className="w-6 h-6" /> },
    { label: "Issues Resolved", value: "10,000+", icon: <CheckCircle className="w-6 h-6" /> },
    { label: "Happy Users", value: "5,000+", icon: <Users className="w-6 h-6" /> },
    { label: "Satisfaction Rate", value: "99.5%", icon: <Star className="w-6 h-6" /> }
  ];

  // form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20">
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, -20, 0], 
            x: [0, 10, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, 20, 0], 
            x: [0, -15, 0],
            scale: [1, 0.9, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{ 
            y: [0, -15, 0], 
            x: [0, 20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-400 transform rotate-45"
          animate={{ 
            rotate: [45, 225, 45],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="mb-8"
          >
            <Badge className="px-4 py-2 bg-white/80 text-blue-700 border-blue-200 hover:bg-white/90 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Help & Support Center
            </Badge>
          </motion.div>

          {/* Title */}
          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-[#0A0DC4] via-[#8B0782] to-blue-800 bg-clip-text text-transparent">
              Help &
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#8B0782] via-pink-600 to-purple-800 bg-clip-text text-transparent">
              Support
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Find guidance, explore FAQs, and get the support you need to make 
            the most of Nous Meeting
          </motion.p>

          {/* Button */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={scrollToContent}
                className="px-8 py-4 text-lg bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white shadow-xl shadow-blue-500/25 rounded-full"
              >
                Get Help Now
                <ArrowDown className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Animated Arrow */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-blue-600"
          >
            <ArrowDown className="w-8 h-8 mx-auto opacity-60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-blue-600">{stat.icon}</div>
                </motion.div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Main Content */}
      <div id="help-content" className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        {/* User Manual Section */}
        <motion.section
          id="user-manual"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-blue-100 text-blue-700">
              Documentation
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              User Manual
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know to get started with Nous Meeting
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mr-4">
                  <Book className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Overview</h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Here's a quick overview of what you can do with Nous Meeting:
              </p>
              
              <ul className="list-disc pl-6 space-y-3 text-gray-700 mb-8">
                <li>Create organizations workspaces.</li>
                <li>Schedule and manage meetings directly inside Nous Meeting.</li>
                <li>Connect with Zoom for transcription, recording, and meeting sync.</li>
                <li>View meeting summaries, action items, and speaker sentiment analytics.</li>
                <li>Use the calendar to track all events and generate reports.</li>
              </ul>

              <motion.div
                className="flex flex-col sm:flex-row justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Desktop Manual */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/manuals/Nousmeeting_User_Manual.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
                            text-white rounded-lg shadow-lg hover:from-[#080aa8] hover:to-[#6d0668] 
                            transition-all duration-200"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Desktop User Manual (PDF)
                </motion.a>

                {/* Mobile Manual */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="/manuals/Nousmeeting_User_Manual_Mobile.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-700 
                            text-white rounded-lg shadow-lg hover:from-pink-700 hover:to-purple-800 
                            transition-all duration-200"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Mobile User Manual (PDF)
                </motion.a>
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* FAQs Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          id='faqs'
        >
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-purple-100 text-purple-700">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to the most frequently asked questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 border border-white/50"
              >
                <summary className="font-semibold text-gray-800 text-lg flex items-center">
                  <HelpCircle className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                  {faq.q}
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed pl-8">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.section>

        {/* Contact Form Section */}
        <motion.section
          id="contact"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <div className="text-center mb-12">
            <Badge className="mb-4 px-4 py-2 bg-emerald-100 text-emerald-700">
              Get in Touch
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Still have questions?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Contact our support team and we'll get back to you as soon as possible
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Send us a message</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 ${
                      errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-200 resize-none ${
                      errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Tell us more about your question..."
                  />
                  {errors.message && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                <div className="text-center pt-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-8 py-4 text-lg bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-white shadow-xl rounded-full transition-all duration-200 ${
                        loading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.section>

        {/* Bug Report Section */}
        <motion.section
          id="bug-report"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <div className="mb-8">
            <Badge className="mb-4 px-4 py-2 bg-orange-100 text-orange-700">
              Report Issues
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              Found a Bug?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us improve by reporting any issues you encounter
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setIsBugModalOpen(true)}
              className="inline-flex items-center px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl rounded-full transition-all duration-200"
            >
              <Bug className="w-5 h-5 mr-2" />
              Report a Bug
            </button>
          </motion.div>
        </motion.section>

      </div>

      {/* Bug Report Modal */}
      <BugReportModal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} />
    </div>
  );
};

export default HelpPage;