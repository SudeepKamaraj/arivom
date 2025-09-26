import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  skills: string[];
  interests: string;
  careerObjective: string;
}

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    skills: [],
    interests: '',
    careerObjective: ''
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const skillOptions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Data Science', 'Machine Learning',
    'UI/UX Design', 'Web Development', 'Mobile Development', 'Cloud Computing',
    'DevOps', 'Cybersecurity', 'Blockchain', 'AI', 'Database', 'Testing',
    'Java', 'C++', 'Angular', 'Vue.js', 'PHP', 'Ruby', 'Go', 'Kotlin'
  ];

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
        if (value.trim().length < 1) return 'Last name must be at least 1 characters';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (success) {
          setSuccess('Login successful! Redirecting...');
          // Redirect to dashboard or home page
        } else {
          setError('Invalid email or password');
        }
      } else {
        success = await register(formData.username, formData.email, formData.password, formData.firstName, formData.lastName, selectedSkills, formData.interests, formData.careerObjective);
        if (success) {
          setSuccess('Registration successful! You can now login.');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', skills: [], interests: '', careerObjective: '' });
          setSelectedSkills([]);
        } else {
          setError('Registration failed. User might already exist.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
    setSuccess('');
    setFieldErrors({});
    setFormData({ username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', skills: [], interests: '', careerObjective: '' });
    setSelectedSkills([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back!' : 'Join Our Platform'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to continue your learning journey'
              : 'Start your learning journey with personalized courses and expert guidance'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Choose a unique username"
                    required
                  />
                  {fieldErrors.username && (
                    <p className="text-xs mt-1 text-red-600">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="First Name"
                      required
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs mt-1 text-red-600">
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        fieldErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Last Name"
                      required
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
                  <div className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border rounded-lg ${
                    fieldErrors.skills ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}>
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-blue-600 text-white shadow-sm'
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interests
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Web development, AI, Cloud"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Career Objective
                  </label>
                  <textarea
                    name="careerObjective"
                    value={formData.careerObjective}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Become a full-stack developer"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
              {fieldErrors.email && (
                <p className="text-xs mt-1 text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={isLogin ? "Enter your password" : "Enter a strong password"}
                required
              />
              {fieldErrors.password && (
                <p className="text-xs mt-1 text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs mt-1 text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;