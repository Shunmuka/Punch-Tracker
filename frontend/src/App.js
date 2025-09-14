import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import PunchLogger from './components/PunchLogger';
import Dashboard from './components/Dashboard';
import CoachDashboard from './components/CoachDashboard';
import RecordingChip from './components/RecordingChip';
import WorkoutSummary from './components/WorkoutSummary';
import NotificationsSettings from './components/NotificationsSettings';
import Leaderboard from './components/Leaderboard';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import DeviceIngestion from './components/DeviceIngestion';
import './App.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <nav className="bg-surface border-b border-[#242a35] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-black">
            <span className="text-text">PUNCH</span>
            <span className="text-primary">TRACKER</span> 🥊
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="h-10 px-6 bg-primary hover:bg-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-surface border-b border-[#242a35] px-4 sm:px-6 py-3 h-16 flex items-center">
      <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
        {/* Left: Brand */}
        <Link to="/dashboard" className="text-xl lg:text-2xl font-black flex-shrink-0">
          <span className="text-text">PUNCH</span>
          <span className="text-primary">TRACKER</span> 🥊
        </Link>

        {/* Center: Nav links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-1 mx-4">
          {user?.role === 'coach' && (
            <Link
              to="/coach"
              className={`relative flex items-center px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                location.pathname === '/coach'
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              <span className="mr-2">👨‍🏫</span>
              Coach
            </Link>
          )}
        </div>

        {/* Right: Primary CTA, Settings, User Menu, Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Primary CTA: Start Workout / Recording Chip */}
          <RecordingChip />

          {/* Quick Actions (Log Punch) - Desktop */}
          <div className="hidden lg:flex">
            <Link
              to="/log-punch"
              className="px-4 py-2 rounded-full text-sm font-medium text-muted hover:text-text hover:bg-surface2 transition-all duration-200 flex items-center h-10"
            >
              <span className="mr-2">🥊</span>
              Log Punch
            </Link>
          </div>

          {/* User Menu & Logout - Desktop */}
          <div className="hidden lg:flex items-center space-x-3 pl-4 border-l border-[#242a35]">
            <span className="text-sm text-muted flex items-center">
              {user?.username}
              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${user?.role === 'coach' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                {user?.role}
              </span>
            </span>
            <button
              onClick={logout}
              className="p-2 text-muted hover:text-text hover:bg-surface2 rounded-full transition-all duration-200 h-10 w-10 flex items-center justify-center"
              title="Logout"
            >
              <span className="text-xl">🚪</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden relative">
            <button
              className="p-2 text-muted hover:text-text hover:bg-surface2 rounded-full transition-all duration-200 h-10 w-10 flex items-center justify-center"
              title="Menu"
            >
              <span className="text-xl">☰</span>
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
            <Route path="/workouts/:id/summary" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <WorkoutSummary />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/settings/notifications" element={
              <ProtectedRoute>
                <NotificationsSettings />
              </ProtectedRoute>
            } />
            <Route path="/coach/leaderboard" element={
              <ProtectedRoute requireRole="coach">
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/device" element={
              <ProtectedRoute>
                <DeviceIngestion />
              </ProtectedRoute>
            } />
            <Route path="/auth/verify" element={<EmailVerification />} />
            <Route path="/auth/forgot" element={<ForgotPassword />} />
            <Route path="/auth/reset" element={<ResetPassword />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
