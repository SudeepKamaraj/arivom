import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, BookOpen } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    skills: [] as string[],
    interests: '',
    careerObjective: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [availability, setAvailability] = useState<{
    username: { available: boolean | null; message: string };
    email: { available: boolean | null; message: string };
  }>({
    username: { available: null, message: '' },
    email: { available: null, message: '' }
  });
  const { login, register } = useAuth();

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20) return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) return 'Password must contain at least one special character';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'First name must be at least 2 characters';
        if (value.trim().length > 50) return 'First name must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'First name can only contain letters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Last name must be at least 2 characters';
        if (value.trim().length > 50) return 'Last name must be less than 50 characters';
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Last name can only contain letters';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!isLogin) {
      // Registration validation
      Object.keys(formData).forEach(key => {
        if (key !== 'skills' && key !== 'interests' && key !== 'careerObjective') {
          const error = validateField(key, formData[key as keyof typeof formData] as string);
          if (error) errors[key] = error;
        }
      });
      
      if (selectedSkills.length === 0) {
        errors.skills = 'Please select at least one skill';
      }
    } else {
      // Login validation
      const emailError = validateField('email', formData.email);
      if (emailError) errors.email = emailError;
      
      if (!formData.password) errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkAvailability = async (field: 'username' | 'email', value: string) => {
    if (!value.trim()) {
      setAvailability(prev => ({
        ...prev,
        [field]: { available: null, message: '' }
      }));
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });

      const data = await response.json();
      
      if (data.available) {
        setAvailability(prev => ({
          ...prev,
          [field]: { available: true, message: `${field} is available` }
        }));
      } else {
        setAvailability(prev => ({
          ...prev,
          [field]: { available: false, message: data.message }
        }));
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Data Science', 'Machine Learning',
    'UI/UX Design', 'Web Development', 'Mobile Development', 'Cloud Computing',
    'DevOps', 'Cybersecurity', 'Blockchain', 'AI', 'Database', 'Testing',
    'Java', 'C++', 'Angular', 'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      let success = false;
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        success = await register(formData.username, formData.email, formData.password, formData.firstName, formData.lastName, selectedSkills, formData.interests, formData.careerObjective);
        if (!success) {
          const specificError = (window as any).lastAuthError;
          setError(specificError || 'Registration failed. Please check if username/email is already taken and try again.');
        }
      }
      
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Check availability for username and email fields
    if (!isLogin && (name === 'username' || name === 'email')) {
      // Only check availability if field is valid
      if (!error) {
        setTimeout(() => {
          checkAvailability(name as 'username' | 'email', value);
        }, 500);
      }
    }
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    
    // Clear skills error if at least one skill is selected
    if (newSkills.length > 0 && fieldErrors.skills) {
      setFieldErrors(prev => ({
        ...prev,
        skills: ''
      }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFieldErrors({});
    setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', skills: [], interests: '', careerObjective: '' });
    setSelectedSkills([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back' : 'Join LearnHub'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      fieldErrors.username || availability.username.available === false 
                        ? 'border-red-300 bg-red-50' 
                        : availability.username.available === true 
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="Choose a unique username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  {fieldErrors.username && (
                    <p className="text-xs mt-1 text-red-600">
                      {fieldErrors.username}
                    </p>
                  )}
                  {!fieldErrors.username && availability.username.message && (
                    <p className={`text-xs mt-1 ${
                      availability.username.available ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {availability.username.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs mt-1 text-red-600">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        fieldErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs mt-1 text-red-600">
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Skills (Choose at least one) *
                  </label>
                  <div className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg ${
                    fieldErrors.skills ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}>
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {fieldErrors.skills && (
                    <p className="text-xs mt-1 text-red-600">
                      {fieldErrors.skills}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                  <input
                    type="text"
                    name="interests"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Web development, AI, Cloud"
                    value={formData.interests}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Objective</label>
                  <textarea
                    name="careerObjective"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Become a full-stack developer"
                    rows={3}
                    value={formData.careerObjective}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.email || (!isLogin && availability.email.available === false) 
                    ? 'border-red-300 bg-red-50' 
                    : !isLogin && availability.email.available === true 
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {fieldErrors.email && (
                <p className="text-xs mt-1 text-red-600">
                  {fieldErrors.email}
                </p>
              )}
              {!fieldErrors.email && !isLogin && availability.email.message && (
                <p className={`text-xs mt-1 ${
                  availability.email.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {availability.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={isLogin ? "Enter your password" : "Enter a strong password"}
                value={formData.password}
                onChange={handleInputChange}
              />
              {fieldErrors.password && (
                <p className="text-xs mt-1 text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs mt-1 text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-1">Demo Account:</p>
            <p>Email: demo@arivom.com</p>
            <p>Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;