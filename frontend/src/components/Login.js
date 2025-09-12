import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock authentication for MVP
    if (username.trim()) {
      setIsLoggedIn(true);
      localStorage.setItem('user', username);
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    setUsername('');
  };

  // Check if user is already logged in
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);

  if (isLoggedIn) {
    return (
      <div className="card">
        <h2>Welcome back, {username}!</h2>
        <p>You are logged in. Ready to track your punches?</p>
        <div>
          <button className="btn" onClick={() => navigate('/log-punch')}>
            Log New Punch
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </button>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ marginLeft: '10px' }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Login to PunchTracker</h2>
      <p>Enter your username to get started (mock authentication for MVP)</p>
      
      <form onSubmit={handleLogin} className="punch-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        
        <button type="submit" className="btn">
          Login
        </button>
      </form>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Demo Credentials:</h4>
        <p>Username: <strong>testuser</strong></p>
        <p>This is a mock login for the MVP. In production, this would integrate with a real authentication system.</p>
      </div>
    </div>
  );
}

export default Login;
