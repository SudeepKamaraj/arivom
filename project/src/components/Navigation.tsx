import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, Bell, Search } from 'lucide-react';
import ArivomLogo from './ArivomLogo';

const Navigation: React.FC = () => {

  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; description?: string; date?: string; read?: boolean }[]>([]);
  const [navSearch, setNavSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!notifications.length) {
      // Seed with a couple of helpful starters so the bell feels functional
      setNotifications([
        { id: 'n1', title: 'Welcome to Arivom!', description: 'Explore courses and start learning today.', date: new Date().toISOString(), read: false },
        { id: 'n2', title: 'Tip', description: 'Visit your Dashboard to track progress.', date: new Date().toISOString(), read: false }
      ]);
    }
  };

  const handleNavSearchSubmit = () => {
    const query = navSearch.trim();
    if (query.length === 0) return;
    navigate(`/all-courses?q=${encodeURIComponent(query)}`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <ArivomLogo size="md" variant="full" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-cyber-grape' : 'text-dark-gunmetal dark:text-gray-200 hover:text-cyber-grape'}`}
              >
                Home
              </Link>
              <Link
                to="/all-courses"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/all-courses' ? 'text-cyber-grape' : 'text-dark-gunmetal dark:text-gray-200 hover:text-cyber-grape'}`}
              >
                Courses
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-cyber-grape' : 'text-dark-gunmetal dark:text-gray-200 hover:text-cyber-grape'}`}
              >
                Dashboard
              </Link>
              <Link
                to="/recommendations"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/recommendations' ? 'text-cyber-grape' : 'text-dark-gunmetal dark:text-gray-200 hover:text-cyber-grape'}`}
              >
                Recommendations
              </Link>
              {(user?.role === 'admin' || user?.role === 'instructor') && (
                <Link
                  to="/admin-courses"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/admin-courses' ? 'text-cyber-grape' : 'text-dark-gunmetal dark:text-gray-200 hover:text-cyber-grape'}`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNavSearchSubmit(); }}
                className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-dark-gunmetal dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-grape focus:border-transparent text-sm"
              />
              <button
                onClick={handleNavSearchSubmit}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-cyber-grape text-white rounded-md hover:bg-cyber-grape-dark"
              >
                Search
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={toggleNotifications} className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-persimmon"></span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Notifications</span>
                    {!!notifications.length && (
                      <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`px-4 py-3 border-t border-gray-100 dark:border-gray-800 ${n.read ? 'bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</div>
                          {n.description && <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{n.description}</div>}
                          {n.date && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.date).toLocaleString()}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{user.firstName}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/all-courses"
              onClick={() => setIsMenuOpen(false)}
              className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Courses
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/recommendations"
              onClick={() => setIsMenuOpen(false)}
              className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              Recommendations
            </Link>
            
            {user && (
              <>
                <hr className="my-2" />
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left w-full text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-blue-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;