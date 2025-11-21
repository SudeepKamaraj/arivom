import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { API_CONFIG, getApiUrl } from '../config/api';

interface OtpVerificationPageProps {
  onBack: () => void;
  email: string;
  isSignup: boolean;
  onLoginSuccess: () => void;
  onSignupSuccess?: () => void;
}

export default function OtpVerificationPage({ onBack, email, isSignup, onLoginSuccess, onSignupSuccess }: OtpVerificationPageProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? getApiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP_VERIFY_OTP) : getApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await response.json();

      if (response.ok) {
        if (isSignup) {
          // For signup, show success message
          setVerificationSuccess(true);
          setError('');
        } else {
          // For login, store token and show success message
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setVerificationSuccess(true);
          setError('');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        throw new Error('Resend is unavailable during signup verification. Please restart signup if needed.');
      }
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN_REQUEST_OTP), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToHome = () => {
    if (isSignup) {
      // For signup, go back to login page
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        onBack();
      }
    } else {
      // For login, proceed to home
      onLoginSuccess();
    }
  };

  // Show success message if verification is complete
  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignup ? 'Account Created Successfully!' : 'Login Successful!'}
            </h2>
            
            <p className="text-gray-600">
              {isSignup 
                ? 'Your account has been verified and created. You can now log in with your credentials.'
                : 'Your email has been verified successfully. Welcome back!'
              }
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProceedToHome}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            {isSignup ? 'Go to Login' : 'Continue to Home'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>

          {/* Additional Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 text-center">
              {isSignup 
                ? '🎉 Welcome to our platform! Please login to get started.'
                : '🚀 Ready to explore your personalized learning journey!'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
          
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignup ? 'Verify Your Email' : 'Email Verification Required'}
          </h2>
          
          <p className="text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOtp}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          
          {canResend ? (
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend Code
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Resend code in {resendTimer}s
            </p>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 text-center">
            💡 Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
}
