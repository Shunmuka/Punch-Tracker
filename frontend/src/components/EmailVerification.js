import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying');
      await axiosInstance.post('/auth/verify', { token });
      setStatus('success');
      setMessage('Email verified successfully! You can now receive notifications.');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Email verification failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Email verification failed. The token may be invalid or expired.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-muted';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-surface2 p-8 rounded-xl border border-[#242a35] text-center">
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          
          <h1 className="text-2xl font-bold text-text mb-4">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>
          
          <p className={`text-lg ${getStatusColor()} mb-6`}>
            {message}
          </p>
          
          {status === 'verifying' && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Redirecting to dashboard in 3 seconds...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
