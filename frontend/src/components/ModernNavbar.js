import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ModernNavbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const settingsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(event) {
      if (!isAuthenticated) return;
      
      // Only trigger if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
      
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault();
          // Toggle workout start/stop
          if (activeWorkout) {
            // Stop workout logic here
            console.log('Stop workout');
          } else {
            // Start workout logic here
            console.log('Start workout');
          }
          break;
        case 'p':
          event.preventDefault();
          navigate('/log-punch');
          break;
        case 'g':
          event.preventDefault();
          navigate('/dashboard');
          break;
        case ',':
          event.preventDefault();
          setShowSettingsMenu(!showSettingsMenu);
          break;
      }
    }
    
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isAuthenticated, activeWorkout, navigate]);
  
  // Poll for active workout
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const pollWorkout = async () => {
      try {
        const response = await fetch('/api/workouts/active', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setActiveWorkout(data);
        }
      } catch (error) {
        console.error('Error fetching active workout:', error);
      }
    };
    
    pollWorkout();
    const interval = setInterval(pollWorkout, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  const mainNavItems = [
    { path: '/coach', label: 'Coach', icon: '👨‍🏫', requireAuth: true, requireRole: 'coach' }
  ];
  
  const quickActionsItems = [
    { path: '/log-punch', label: 'Log Punch', icon: '🥊', requireAuth: true, shortcut: 'P' }
  ];
  
  const settingsItems = [
    { path: '/settings/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/device', label: 'Device API', icon: '📱' }
  ];

  // Recording chip component
  const RecordingChip = () => {
    if (!activeWorkout) {
      return (
        <button
          onClick={() => console.log('Start workout')}
          className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface"
          title="Start Workout (S)"
        >
          Start Workout
        </button>
      );
    }

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <button
        onClick={() => console.log('Stop workout')}
        className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface flex items-center space-x-2"
        title="Stop Workout (S)"
      >
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>Recording</span>
        <span className="text-red-100">•</span>
        <span className="font-mono">{formatTime(activeWorkout.duration || 0)}</span>
      </button>
    );
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-surface border-b border-[#242a35] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-black">
          <span className="text-text">PUNCH</span>
          <span className="text-primary">TRACKER</span>
        </Link>
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="h-10 px-6 bg-primary hover:bg-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-surface border-b border-[#242a35] px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile layout */}
        <div className="flex items-center justify-between lg:hidden">
          {/* Left: Brand */}
          <Link to="/dashboard" className="text-xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span>
          </Link>
          
          {/* Right: Primary CTA + Mobile Menu */}
          <div className="flex items-center space-x-3">
            <RecordingChip />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-muted hover:text-text hover:bg-surface2 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Left: Brand */}
          <Link to="/dashboard" className="text-2xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span> 🥊
          </Link>
          
          {/* Center: Nav links */}
          <div className="flex items-center space-x-1">
            {mainNavItems
              .filter(item => !item.requireAuth || isAuthenticated)
              .filter(item => !item.requireRole || user?.role === item.requireRole)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`h-10 px-4 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface ${
                    location.pathname === item.path
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-muted hover:text-text hover:bg-surface2'
                  }`}
                  title={`${item.label} (${item.shortcut})`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
          </div>
          
          {/* Right: Primary CTA → Settings → User */}
          <div className="flex items-center space-x-3">
            {/* Primary CTA */}
            <RecordingChip />
            
            {/* Quick Actions Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="h-10 px-4 rounded-full font-medium text-muted hover:text-text hover:bg-surface2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface flex items-center"
                title="Quick Actions (,)"
              >
                <span className="mr-2">⚡</span>
                Quick
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-[#242a35] rounded-xl shadow-xl z-50">
                  {/* Quick Actions */}
                  <div className="px-3 py-2 border-b border-[#242a35]">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide">Quick Actions</div>
                  </div>
                  {quickActionsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-4 py-3 text-sm text-muted hover:text-text hover:bg-surface2 transition-all duration-200"
                      onClick={() => setShowSettingsMenu(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                      <span className="ml-auto text-xs text-muted">({item.shortcut})</span>
                    </Link>
                  ))}
                  
                  {/* Settings */}
                  <div className="px-3 py-2 border-t border-[#242a35]">
                    <div className="text-xs font-semibold text-muted uppercase tracking-wide">Settings</div>
                  </div>
                  {settingsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-4 py-3 text-sm text-muted hover:text-text hover:bg-surface2 transition-all duration-200"
                      onClick={() => setShowSettingsMenu(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-3 border-l border-[#242a35]">
              {/* Role Badge */}
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'coach' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.role}
              </span>
              
              {/* Username */}
              <span className="text-sm font-medium text-text">
                {user?.username}
              </span>
              
              {/* Logout Icon */}
              <button
                onClick={logout}
                className="p-2 text-muted hover:text-red-400 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation sheet */}
        {showMobileMenu && (
          <div className="lg:hidden mt-4 pt-4 border-t border-[#242a35]" ref={mobileMenuRef}>
            <div className="space-y-3">
              {/* Main Navigation */}
              <div className="flex flex-wrap gap-2">
                {mainNavItems
                  .filter(item => !item.requireAuth || isAuthenticated)
                  .filter(item => !item.requireRole || user?.role === item.requireRole)
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`h-10 px-4 rounded-full font-medium transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-primary text-white shadow-lg'
                          : 'text-muted hover:text-text hover:bg-surface2'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
              </div>
              
              {/* Quick Actions */}
              <div className="pt-3 border-t border-[#242a35]">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Quick Actions</div>
                <div className="flex flex-wrap gap-2">
                  {quickActionsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="h-10 px-4 rounded-full font-medium text-muted hover:text-text hover:bg-surface2 transition-all duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Settings */}
              <div className="pt-3 border-t border-[#242a35]">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Settings</div>
                <div className="flex flex-wrap gap-2">
                  {settingsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="h-10 px-4 rounded-full font-medium text-muted hover:text-text hover:bg-surface2 transition-all duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* User Info */}
              <div className="pt-3 border-t border-[#242a35]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.role === 'coach' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user?.role}
                    </span>
                    <span className="text-sm font-medium text-text">{user?.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-muted hover:text-red-400 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default ModernNavbar;
