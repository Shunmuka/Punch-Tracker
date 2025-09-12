import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import PunchLogger from './components/PunchLogger';
import Dashboard from './components/Dashboard';
import CoachDashboard from './components/CoachDashboard';
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
    <nav className="bg-surface border-b border-[#242a35] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-muted hover:text-text hover:bg-surface2 rounded-lg transition-all duration-200"
            >
              Logout
            </button>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
