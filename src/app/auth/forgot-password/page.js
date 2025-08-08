// Updated ForgotPasswordPage with full 4-step flow
'use client';
import { useEffect, useRef, useState } from 'react';
import { Mail, ArrowLeft, Check, X, Send, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { makeApiCall } from '@/app/utils/api';
import { Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset, 4=success

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ''); // allow only digits
    if (!value) return;
  
    const newOtp = [...otpDigits];
    newOtp[index] = value[0];
    setOtpDigits(newOtp);
  
    // Move to next input
    if (index < 5 && value) {
      otpRefs.current[index + 1]?.focus();
    }
  
    setError('');
  };
  
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index]) {
        // Just clear the current box
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      } else if (index > 0) {
        // Move back
        otpRefs.current[index - 1]?.focus();
      }
    } else if (e.key.length === 1 && /\d/.test(e.key)) {
      // Auto-fill from paste-like typing
      e.preventDefault();
      const newOtp = [...otpDigits];
      newOtp[index] = e.key;
      setOtpDigits(newOtp);
      if (index < 5) otpRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle pasting full OTP
  // useEffect(() => {
  //   const handlePaste = (e) => {
  //     const paste = e.clipboardData.getData('text').replace(/\D/g, '');
  //     if (paste.length === 6) {
  //       const pasteArray = paste.split('');
  //       setOtpDigits(pasteArray);
  //       otpRefs.current[5]?.focus();
  //     }
  //   };
  
  //   otpRefs.current.forEach((input) => {
  //     if (input) input.addEventListener('paste', handlePaste);
  //   });
  
  //   return () => {
  //     otpRefs.current.forEach((input) => {
  //       if (input) input.removeEventListener('paste', handlePaste);
  //     });
  //   };
  // }, []);

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (paste.length === 6) {
      const pasteArray = paste.split('').slice(0, 6);
      setOtpDigits(pasteArray);
      
      // Move focus to the last field
      otpRefs.current[5]?.focus();
    }
  };
  

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setIsSubmitting(true);
    setError('');
  
    try {
      const res = await makeApiCall(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password/request-otp/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to send reset email');
      }
  
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  
    setIsSubmitting(false);
  };
  

  const handleOtpSubmit = async () => {
    const fullOtp = otpDigits.join('').trim();  // join the 6 parts
  
    if (fullOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
  
    try {
      const res = await makeApiCall(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password/verify-otp/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: fullOtp }),
        }
      );
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Invalid OTP');
      }
  
      setStep(3); // move to next step
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
  
    setIsSubmitting(false);
  };
  

  const handleResetPassword = async () => {
    const passwordRequirements = [
      (pwd) => pwd.length >= 8,
      (pwd) => /[A-Z]/.test(pwd),
      (pwd) => /[a-z]/.test(pwd),
      (pwd) => /\d/.test(pwd),
      (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    ];
  
    if (!newPassword.trim()) {
      setError('Password is required');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    const isValid = passwordRequirements.every((rule) => rule(newPassword));
    if (!isValid) {
      setError('Password does not meet all requirements');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
  
    try {
      const res = await makeApiCall(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password/reset/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, new_password: newPassword }),
        }
      );
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to reset password');
      }
  
      setStep(4); // Success step
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  
    setIsSubmitting(false);
  };
  
  

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleEmailSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              {isSubmitting ? 'Sending...' : 'Send OTP'}
            </button>

            <button type="button" onClick={handleBackToLogin} className="w-full text-sm text-gray-600 hover:underline">
              Back to Sign In
            </button>
          </div>
        </form>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Enter OTP</h2>
          <p className="text-sm text-gray-600">
            An OTP has been sent to <strong>{email}</strong>
          </p>
    
          <div className="flex space-x-2 justify-center">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (otpRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={(e) => handlePaste(e)} // ✅ use this!
                className="w-10 h-12 text-center text-lg border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            ))}
          </div>
    
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    
          <button
            onClick={handleOtpSubmit}
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm"
          >
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>
    
          {/* Back Button */}
          <button
            onClick={() => {
              setStep(1);
              setOtpDigits(['', '', '', '', '', '']);
              setError('');
            }}
            className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-lg text-sm"
          >
            ← Back
          </button>
        </div>
      );
    }
    
    

    if (step === 3) {
      const passwordRequirements = [
        { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
        { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
        { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
        { label: 'Contains number', test: (pwd) => /\d/.test(pwd) },
        { label: 'Contains special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
      ];
    
      return (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Set New Password</h2>
    
          {/* New Password Field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-sm border-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
    
          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-sm border-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
    
          {/* Password Requirements */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
            <div className="grid grid-cols-1 gap-1">
              {passwordRequirements.map((req, index) => {
                const isValid = req.test(newPassword);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                      isValid ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {isValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{req.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
    
          {error && <p className="text-sm text-red-500">{error}</p>}
    
          <button
            onClick={handleResetPassword}
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm"
          >
            {isSubmitting ? 'Setting...' : 'Set Password'}
          </button>
    
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setOtpDigits(['', '', '', '', '', '']);
              setError('');
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            &larr; Back to Email
          </button>
        </div>
      );
    }
    

    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-green-700">Password Reset Successful!</h2>
        <p className="text-sm text-gray-600">You can now login with your new password.</p>
        <button
          onClick={handleBackToLogin}
          className="text-indigo-600 hover:underline font-medium text-sm"
        >
          Go to Login
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        </div>
        {renderStep()}
      </div>
    </div>
  );
}
