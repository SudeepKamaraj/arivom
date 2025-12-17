import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Shield, Phone as PhoneIcon } from 'lucide-react';
import { Page } from '../App';

interface SignupPageProps {
  navigate: (page: Page, options?: { id?: string; email?: string; isSignup?: boolean }) => void;
}

interface SignupFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface SignupErrors {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export function SignupPage({ navigate }: SignupPageProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    // Username must start with a letter; simple reliable domain pattern
    const re = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return re.test(email.trim());
  };

  // First name: one or more letters, may include space, ', ., -
  const validateFirstName = (name: string) => {
    const re = /^[A-Za-z]{1,}[A-Za-z\s'.-]{0,48}$/;
    return re.test(name.trim());
  };

  // Middle name: one or more letters, may include space, ', ., - (optional but if provided must be valid)
  const validateMiddleName = (name: string) => {
    if (!name) return true; // optional
    const re = /^[A-Za-z]{1,}[A-Za-z\s'.-]{0,48}$/;
    return re.test(name.trim());
  };

  
  const validatePassword = (password: string) => {
    // At least 8 chars, one upper, one lower, one number
    const lengthOk = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    return lengthOk && upper && lower && number;
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone.trim());
  };

  const validate = (data: SignupFormData): SignupErrors => {
    const nextErrors: SignupErrors = {};

    if (!validateFirstName(data.firstName)) {
      nextErrors.firstName = 'Enter a valid first name (letters, spaces, min 1 character).';
    }
    if (!validateMiddleName(data.middleName)) {
      nextErrors.middleName = 'Enter a valid middle name (letters, spaces, min 1 character).';
    }
    
    if (!validateEmail(data.email)) {
      nextErrors.email = 'Enter a valid email address (e.g., name@example.com).';
    }
    if (!validatePhone(data.phone)) {
      nextErrors.phone = 'Phone must be exactly 10 digits.';
    }
    if (!validatePassword(data.password)) {
      nextErrors.password = 'Password must be 8+ chars with uppercase, lowercase, and a number.';
    }
    if (data.confirmPassword !== data.password) {
      nextErrors.confirmPassword = "Passwords don't match.";
    }

    return nextErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    setErrors(prev => ({ ...prev, [name]: undefined, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const foundErrors = validate(formData);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      setSubmitting(true);
      const fullNameParts = [formData.firstName.trim(), formData.middleName.trim(), formData.lastName.trim()].filter(Boolean);
      const fullName = fullNameParts.join(' ');
      const payload = {
        name: fullName,
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await fetch('http://localhost:5000/api/auth/signup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let data: any = {};
      try { data = await res.json(); } catch { /* ignore parse error */ }

      if (!res.ok) {
        const message = data?.message || (res.status === 0 ? 'Network error. Please check connection or server.' : `Signup failed (${res.status})`);
        throw new Error(message);
      }
      
      navigate('otp-verification', { email: formData.email.trim(), isSignup: true });
    } catch (err: any) {
      const msg = err?.name === 'AbortError' ? 'Request timed out. Please try again.' : (err?.message || 'Something went wrong');
      setErrors(prev => ({ ...prev, form: msg }));
    } finally {
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  const inputBase =
    'appearance-none relative block w-full px-12 py-3 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none transition-all duration-300';

  const inputClass = (hasError: boolean) =>
    `${inputBase} border ${hasError ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 animate-fade-in">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Shield className="h-10 w-10 text-red-600" />
              <span className="text-3xl font-bold text-gray-900">Auth System</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join our secure platform today</p>
          </div>

          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                  {errors.form}
                </div>
              )}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputClass(!!errors.firstName)}
                    placeholder="Enter your first name"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                </div>
                {errors.firstName && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange}
                    className={inputClass(!!errors.middleName)}
                    placeholder="Enter your middle name (optional)"
                    aria-invalid={!!errors.middleName}
                    aria-describedby={errors.middleName ? 'middleName-error' : undefined}
                  />
                </div>
                {errors.middleName && (
                  <p id="middleName-error" className="mt-1 text-sm text-red-600">{errors.middleName}</p>
                )}
              </div>

              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass(!!errors.email)}
                    placeholder="Enter your email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass(!!errors.phone)}
                    placeholder="10-digit phone number"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                </div>
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass(!!errors.password)}
                    placeholder="Create a password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Must be 8+ characters and include upper, lower, and a number.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass(!!errors.confirmPassword)}
                    placeholder="Confirm your password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  />
                </div>
                {errors.confirmPassword && (
                  <p id="confirm-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 hover:scale-105 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="flex items-center">
                  {submitting ? 'Creating account...' : 'Create account'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('landing')}
                    className="font-medium text-red-600 hover:text-red-500 transition-colors duration-300"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}