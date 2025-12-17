import { useState } from 'react';
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface LandingPageProps {
  navigate: (page: string, data?: any) => void;
}

export default function LandingPage({ navigate }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' });

  const handleStartExplore = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setActiveTab('login');
      setError('Please login first to start exploring');
    } else {
      setError('Welcome! You are successfully logged in.');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.needsVerification) {
        navigate('otp-verification', { email: loginData.email, isSignup: false });
      } else if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('travel-main');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Basic client-side validation
  const nameOk1 = /^[A-Za-z][A-Za-z\s'.-]{1,48}$/.test(signupData.firstName.trim());
    const lastNameOk = /^[A-Za-z][A-Za-z\s'.-]{0,48}$/.test(signupData.lastName.trim());
    const emailOk = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(signupData.email.trim());
    const pass = signupData.password;
    const passOk = pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /[0-9]/.test(pass);
  if (!nameOk1) return setError('Enter a valid first name (letters/spaces, min 2 characters).');
  if (!emailOk) return setError('Enter a valid email address (e.g., name@example.com).');
  if (!lastNameOk) return setError('Enter a valid last name (letters/spaces).');
  if (!/^\d{10}$/.test(signupData.phone.trim())) return setError('Phone must be exactly 10 digits.');
  if (!passOk) return setError('Password must be 8+ chars with uppercase, lowercase, and a number.');
  if (signupData.confirmPassword !== signupData.password) return setError("Passwords don't match.");

    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    try {
  const response = await fetch('http://localhost:5000/api/auth/signup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.firstName.trim(),
          lastName: signupData.lastName.trim(),
          email: signupData.email.trim(),
          phone: signupData.phone.trim(),
          password: signupData.password,
          confirmPassword: signupData.confirmPassword
        }),
        signal: controller.signal
      });

      let data: any = {};
      try { data = await response.json(); } catch {}

      if (response.ok) {
        navigate('otp-verification', { email: signupData.email.trim(), isSignup: true });
      } else {
        setError(data?.message || `Signup failed (${response.status})`);
      }
    } catch (err: any) {
      setError(err?.name === 'AbortError' ? 'Request timed out. Please try again.' : 'Network error. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-10 w-10 text-red-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Auth System</h1>
        </div>
        <p className="text-xl text-gray-600">Secure authentication system</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Start Explore Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleStartExplore}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
🔐 Test Login
          </button>
        </div>

        {/* Auth Section: Two-column layout */}
        <div className="bg-white rounded-2xl shadow-xl max-w-5xl mx-auto p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Auth content */}
            <div className="p-8">
              {/* Tab Navigation */}
              <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Signup
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={loading || !loginData.email || !loginData.password}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              )}

              {/* Signup Form */}
              {activeTab === 'signup' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={signupData.firstName}
                          onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter your first name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={signupData.lastName}
                          onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="10-digit phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                 
                  <button
                    onClick={handleSignup}
                    disabled={
                      loading ||
                      !signupData.firstName ||
                      !signupData.phone ||
                      !signupData.email ||
                      !signupData.password ||
                      !signupData.confirmPassword
                    }
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating Account...' : 'Create account'}
                  </button>
                </div>
              )}

            </div>

            {/* Right: Security Visual */}
            <div className="hidden md:block bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Secure Access</h3>
                <p className="text-gray-600">Protected authentication system with OTP verification</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
