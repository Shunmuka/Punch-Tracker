import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(1); // Default to session 1 for MVP

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      setError('Please login first to view dashboard');
      setLoading(false);
      return;
    }

    fetchAnalytics();
  }, [sessionId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/analytics/${sessionId}`);
      setAnalytics(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(`Error: ${err.response?.data?.detail || 'Failed to load analytics'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (e) => {
    setSessionId(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <div className="alert alert-error">
          {error}
        </div>
        <button className="btn" onClick={fetchAnalytics}>
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const punchTypeData = Object.entries(analytics.punch_types).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: count
  }));

  const speedData = [
    { name: 'Average Speed', speed: analytics.average_speed }
  ];

  return (
    <div>
      <div className="card">
        <h2>Training Dashboard</h2>
        
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label htmlFor="sessionSelect">Session ID:</label>
          <input
            type="number"
            id="sessionSelect"
            value={sessionId}
            onChange={handleSessionChange}
            min="1"
            placeholder="Enter session ID"
          />
        </div>
      </div>

      <div className="grid">
        <div className="stat-card">
          <h3>Total Punches</h3>
          <p className="value">{analytics.total_punches}</p>
        </div>
        
        <div className="stat-card">
          <h3>Average Speed</h3>
          <p className="value">{analytics.average_speed} mph</p>
        </div>
        
        <div className="stat-card">
          <h3>Session Duration</h3>
          <p className="value">
            {analytics.session_duration_minutes 
              ? `${Math.round(analytics.session_duration_minutes)} min`
              : 'N/A'
            }
          </p>
        </div>
        
        <div className="stat-card">
          <h3>ML Classification</h3>
          <p className="value">{analytics.ml_classification || 'N/A'}</p>
        </div>
      </div>

      <div className="card">
        <h3>Punch Types Distribution</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={punchTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Speed Analysis</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="speed" stroke="#82ca9d" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Session Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Session ID:</strong> {analytics.session_id}
          </div>
          <div>
            <strong>Punch Types:</strong> {Object.keys(analytics.punch_types).length}
          </div>
          <div>
            <strong>Most Common:</strong> {
              Object.entries(analytics.punch_types).reduce((a, b) => a[1] > b[1] ? a : b, ['None', 0])[0]
            }
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Note:</h4>
        <p>This is an MVP dashboard. Future versions will include:</p>
        <ul>
          <li>Historical session comparisons</li>
          <li>Advanced ML fatigue detection</li>
          <li>Real-time coaching feedback</li>
          <li>Video analysis integration</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
