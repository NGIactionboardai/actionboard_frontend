'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Check, X, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  verifyOtp, 
  resendOtp,
  clearError, 
  clearSuccess, 
  clearMessages,
  resetRegistration,
  selectAuth,
  selectRegistrationFlow,
  selectAuthError,
  selectSuccessMessage,
  selectAuthLoading
} from '../../../redux/auth/authSlices';

export default function OtpVerificationPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Redux state selectors
  const auth = useSelector(selectAuth);
  const registrationFlow = useSelector(selectRegistrationFlow);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectSuccessMessage);
  const loading = useSelector(selectAuthLoading);
  
  // Component state
  const [otpData, setOtpData] = useState({
    otp: ['', '', '', '', '', '']
  });
  
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState('');
  
  // Get and persist email from multiple sources
  useEffect(() => {
    // Priority order: URL params > Redux state > sessionStorage > redirect to register
    const urlEmail = searchParams.get('email');
    const reduxEmail = registrationFlow.email;
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null;
    
    if (urlEmail) {
      setEmail(urlEmail);
      // Store in sessionStorage for persistence across refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingVerificationEmail', urlEmail);
      }
    } else if (reduxEmail) {
      setEmail(reduxEmail);
      // Store in sessionStorage for persistence across refreshes
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingVerificationEmail', reduxEmail);
      }
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // No email found, redirect to registration
      router.push('/auth/register');
    }
  }, [searchParams, registrationFlow.email, router]);

  // Handle successful verification - redirect to dashboard
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // Clear stored email from sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pendingVerificationEmail');
      }
      // Registration and verification complete
      router.push('/dashboard');
    }
  }, [auth.isAuthenticated, auth.user, router]);

  // Set initial resend timer when component mounts
  useEffect(() => {
    setResendTimer(180); // 3 minutes initial timer
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => dispatch(clearMessages()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // Calculate OTP expiration time remaining
  const getOtpTimeRemaining = () => {
    if (!registrationFlow.otpExpiresAt) return null;
    const now = new Date().getTime();
    const expiresAt = new Date(registrationFlow.otpExpiresAt).getTime();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    return remaining > 0 ? remaining : 0;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otpData.otp];
    newOtp[index] = value;
    setOtpData({ otp: newOtp });
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtpData({ otp: newOtp });
      // Focus last input
      const lastInput = document.getElementById(`otp-5`);
      if (lastInput) lastInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otpData.otp.join('');
    
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter complete 6-digit verification code' });
      return;
    }
    
    // Clear any existing messages
    dispatch(clearMessages());
    
    // Dispatch OTP verification
    dispatch(verifyOtp({ 
      email: email, 
      otp: otpString 
    }));
  };

  const handleResendOtp = () => {
    if (resendTimer > 0 || loading) return;
    
    // Clear any existing messages
    dispatch(clearMessages());
    
    // Dispatch resend OTP
    dispatch(resendOtp({ 
      email: email 
    }));
    
    setResendTimer(60); // 1 minute timer after resend
  };

  const goBackToRegister = () => {
    setOtpData({ otp: ['', '', '', '', '', ''] });
    setErrors({});
    dispatch(resetRegistration());
    // Clear stored email from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingVerificationEmail');
    }
    // Navigate back to registration page
    router.push('/auth/register');
  };

  const otpTimeRemaining = getOtpTimeRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We sent a 6-digit code to</p>
          <p className="text-indigo-600 font-medium break-all">
            {email}
          </p>
          {otpTimeRemaining !== null && otpTimeRemaining > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Code expires in {Math.floor(otpTimeRemaining / 60)}:{(otpTimeRemaining % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        {/* OTP Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleOtpSubmit}>
            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter 6-digit verification code
              </label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otpData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    aria-label={`Digit ${index + 1}`}
                    disabled={auth.verifying || loading}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 justify-center">
                  <X className="w-4 h-4" />
                  {errors.otp}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={auth.verifying || loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {auth.verifying || loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-4 text-center">
            <button
              onClick={goBackToRegister}
              disabled={loading}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Registration
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Please check your email inbox and spam folder for the verification code. The code will expire in 10 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}