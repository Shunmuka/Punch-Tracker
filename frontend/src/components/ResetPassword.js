import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Use relative paths to leverage the proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No reset token provided');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('No reset token provided');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await axios.post(`${API_BASE_URL}/auth/reset`, {
        token,
        new_password: password
      });
      
      setMessage('Password reset successfully! You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.detail || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-surface2 p-8 rounded-xl border border-[#242a35]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Reset Password</h1>
            <p className="text-muted">Enter your new password below</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-[#242a35] rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-[#242a35] rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary-600 transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
