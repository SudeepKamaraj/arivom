import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OtpVerificationPage from './components/OtpVerificationPage';
import { SignupPage } from './pages/SignupPage';

export type Page = string;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const savedPage = localStorage.getItem('currentPage');
    return savedPage || 'landing';
  });
  const [otpData, setOtpData] = useState<{ email: string; isSignup: boolean } | null>(null);

  // Hydrate session from localStorage so refresh doesn't log out
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        // User is logged in, but we don't need to track state
        // Do not override currentPage on refresh
      }
    } catch {}
  }, []);

  const navigate = (page: Page, data?: any) => {
    if (page === 'otp-verification' && data) {
      setOtpData(data);
    }
    setCurrentPage(page);
    localStorage.setItem('currentPage', page);
  };

  const handleLogin = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    
    // For now, just stay on landing page after successful login
    // since we've removed all other pages
    navigate('landing');
  };


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigate={navigate} />;
      case 'signup':
        return <SignupPage navigate={navigate} />;
      case 'otp-verification':
        return <OtpVerificationPage 
          navigate={navigate} 
          email={otpData?.email || ''} 
          isSignup={otpData?.isSignup || false}
          onLogin={handleLogin}
        />;
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
    </div>
  );
}

export default App;