import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LandingPage from './LandingPage';
import OtpVerificationPage from './OtpVerificationPage';
import SkillsInterestsSelection from './SkillsInterestsSelection';

type AuthStep = 'landing' | 'otp-verification' | 'skills-interests';

interface AuthFlowState {
  step: AuthStep;
  email: string;
  isSignup: boolean;
}

export default function AuthenticationFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authState, setAuthState] = useState<AuthFlowState>({
    step: 'landing',
    email: '',
    isSignup: false
  });

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');
  
  useEffect(() => {
    // If there's a selected course in session storage, we came from course selection
    const selectedCourse = sessionStorage.getItem('selectedCourse');
    if (selectedCourse) {
      console.log('User came from course selection:', JSON.parse(selectedCourse));
    }
  }, []);

  const handleNavigateToOtp = (email: string, isSignup: boolean) => {
    setAuthState({
      step: 'otp-verification',
      email,
      isSignup
    });
  };

  const handleLoginSuccess = async (user: any) => {
    // Only new signup users need to complete skills/interests selection
    if (authState.isSignup && (!user.skillsSelected || user.skillsSelected === false)) {
      setAuthState(prev => ({
        ...prev,
        step: 'skills-interests'
      }));
    } else {
      // Existing users or login users go directly to their destination
      if (redirectUrl) {
        // Clear the selected course from session storage
        sessionStorage.removeItem('selectedCourse');
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
      // No need for page reload, the context should update automatically
    }
  };

  const handleSkillsInterestsComplete = async (data: { skills: string[], interests: string[], experienceLevel: string, completedCourses: string[] }) => {
    try {
      // Save skills and interests to user profile
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/api/users/profile/skills-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Update user data and complete login
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Generate course recommendations based on user inputs and redirect appropriately
        if (redirectUrl) {
          // Clear the selected course from session storage
          sessionStorage.removeItem('selectedCourse');
          navigate(redirectUrl);
        } else {
          navigate('/recommendations'); // Show recommendations instead of dashboard for new users
        }
        // No need for page reload, the context should update automatically
      } else {
        console.error('Failed to save skills and interests');
        // Still proceed even if skills/interests save fails
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error saving skills and interests:', error);
      // Still proceed even if there's an error
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleBackToLanding = () => {
    setAuthState({
      step: 'landing',
      email: '',
      isSignup: false
    });
  };

  switch (authState.step) {
    case 'landing':
      return (
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToOtp={handleNavigateToOtp}
        />
      );
    
    case 'otp-verification':
      return (
        <OtpVerificationPage
          onBack={handleBackToLanding}
          email={authState.email}
          isSignup={authState.isSignup}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    
    case 'skills-interests':
      return (
        <SkillsInterestsSelection
          onComplete={handleSkillsInterestsComplete}
        />
      );
    
    default:
      return (
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToOtp={handleNavigateToOtp}
        />
      );
  }
}