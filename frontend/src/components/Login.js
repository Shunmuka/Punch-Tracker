import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'athlete'
  });
  
  const navigate = useNavigate();
  const { login, signup, user, isAuthenticated } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await signup(
      signupData.username,
      signupData.email,
      signupData.password,
      signupData.role
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    // Mock social login for future expansion
    console.log(`Social login with ${provider}`);
    alert(`Social login with ${provider} - Coming soon!`);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-soft">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-text mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted">Ready to track your punches?</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/log-punch')}
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-button"
            >
              Log New Punch
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-surface2 hover:bg-border-gray text-text font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
            >
              View Dashboard
            </button>
            {user?.role === 'coach' && (
              <button 
                onClick={() => navigate('/coach')}
                className="w-full bg-surface2 hover:bg-border-gray text-text font-semibold py-4 px-6 rounded-2xl transition-all duration-200"
              >
                Coach Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-punch-orange/10 rounded-full blur-3xl"></div>
      
      {/* Main Login Card */}
      <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-soft relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-black text-text mb-2">
              <span className="text-text">PUNCH</span>
              <span className="text-primary">TRACKER</span>
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">
            {showSignup ? 'Sign Up' : 'Log In'}
          </h2>
          <p className="text-muted text-sm">
            {showSignup 
              ? 'Create your account to start tracking your training'
              : 'Enter your email and password to access your dashboard'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {!showSignup ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-text text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-text text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-text transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 text-primary bg-surface2 border-[#242a35] rounded focus:ring-primary focus:ring-2"
                />
                <span className="ml-2 text-muted text-sm">Keep me logged in</span>
              </label>
              <Link
                to="/auth/forgot"
                className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-200 ${
                email && password && !isLoading
                  ? 'bg-primary hover:bg-primary-600 text-white shadow-button'
                  : 'bg-surface2 text-muted cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="signup-username" className="block text-text text-sm font-semibold mb-2">
                Username
              </label>
              <input
                type="text"
                id="signup-username"
                value={signupData.username}
                onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                placeholder="Choose a username"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="signup-email" className="block text-text text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="signup-email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                placeholder="Enter your email"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signup-password" className="block text-text text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                id="signup-password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                placeholder="Create a password"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="signup-confirm-password" className="block text-text text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="signup-confirm-password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-text text-sm font-semibold mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSignupData({...signupData, role: 'athlete'})}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    signupData.role === 'athlete'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-[#242a35] bg-surface2 text-muted hover:border-primary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🥊</div>
                    <div className="font-semibold">Athlete</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSignupData({...signupData, role: 'coach'})}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    signupData.role === 'coach'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-[#242a35] bg-surface2 text-muted hover:border-primary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👨‍🏫</div>
                    <div className="font-semibold">Coach</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading || !signupData.username || !signupData.email || !signupData.password}
              className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-200 ${
                signupData.username && signupData.email && signupData.password && !isLoading
                  ? 'bg-primary hover:bg-primary-600 text-white shadow-button'
                  : 'bg-surface2 text-muted cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-[#242a35]"></div>
          <span className="px-4 text-muted text-sm">or</span>
          <div className="flex-1 border-t border-[#242a35]"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          
          <button
            onClick={() => handleSocialLogin('Apple')}
            className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </button>
          
          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
        </div>

        {/* Toggle Signup/Login */}
        <div className="text-center">
          <span className="text-muted text-sm">
            {showSignup ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button 
            onClick={() => setShowSignup(!showSignup)}
            className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors duration-200"
          >
            {showSignup ? 'Log In' : 'Sign Up'}
          </button>
        </div>
        
        {!showSignup && (
          <div className="text-center">
            <Link 
              to="/auth/forgot"
              className="text-primary text-sm hover:text-primary/80 transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
