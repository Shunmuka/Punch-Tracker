import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import PunchLogger from './components/PunchLogger';
import Dashboard from './components/Dashboard';
import CoachDashboard from './components/CoachDashboard';
import RecordingChip from './components/RecordingChip';
import WorkoutSummary from './components/WorkoutSummary';
import './App.css';

function Navigation() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  const navItems = [
    { path: '/log-punch', label: 'Log Punch', icon: '🥊', requireAuth: true },
    { path: '/dashboard', label: 'Dashboard', icon: '📊', requireAuth: true },
    { path: '/coach', label: 'Coach', icon: '👨‍🏫', requireAuth: true, requireRole: 'coach' }
  ];

  if (!isAuthenticated) {
    return (
      <nav className="bg-surface border-b border-[#242a35] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl font-semibold text-muted hover:text-text hover:bg-surface2 transition-all duration-200"
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
          <Link to="/" className="text-xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <RecordingChip />
            <button
              onClick={logout}
              className="px-2 py-1 text-xs text-muted hover:text-text hover:bg-surface2 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between">
          <Link to="/" className="text-2xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems
                .filter(item => !item.requireAuth || isAuthenticated)
                .filter(item => !item.requireRole || user?.role === item.requireRole)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-muted hover:text-text hover:bg-surface2'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-4 border-l border-[#242a35]">
              <span className="text-sm text-muted">
                {user?.username} ({user?.role})
              </span>
              <RecordingChip />
              <button
                onClick={logout}
                className="px-3 py-1 text-sm text-muted hover:text-text hover:bg-surface2 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        <div className="lg:hidden mt-4 pt-4 border-t border-[#242a35]">
          <div className="flex flex-wrap gap-2">
            {navItems
              .filter(item => !item.requireAuth || isAuthenticated)
              .filter(item => !item.requireRole || user?.role === item.requireRole)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-text hover:bg-surface2'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
          </div>
          <div className="mt-2 text-xs text-muted">
            {user?.username} ({user?.role})
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-bg">
          <Navigation />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/log-punch" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <PunchLogger />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/coach" element={
              <ProtectedRoute requireRole="coach">
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <CoachDashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/workouts/:id/summary" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <WorkoutSummary />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
