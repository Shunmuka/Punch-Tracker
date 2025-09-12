import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function PunchLogger() {
  const [punchData, setPunchData] = useState({
    session_id: 1, // Default to session 1 for MVP
    punch_type: '',
    speed: '',
    count: 1,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [currentSession, setCurrentSession] = useState(null);

  const punchTypes = [
    { value: 'jab', label: 'Jab' },
    { value: 'cross', label: 'Cross' },
    { value: 'hook', label: 'Hook' },
    { value: 'uppercut', label: 'Uppercut' }
  ];

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      setMessage('Please login first');
      return;
    }

    // For MVP, we'll use session ID 1
    setCurrentSession({ id: 1, name: 'Current Training Session' });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPunchData(prev => ({
      ...prev,
      [name]: name === 'speed' || name === 'count' ? parseFloat(value) || 0 : value
    }));
  };

  const handlePunchTypeSelect = (punchType) => {
    setPunchData(prev => ({
      ...prev,
      punch_type: punchType
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/punches`, punchData);
      
      setMessage('Punch logged successfully!');
      
      // Reset form
      setPunchData({
        session_id: 1,
        punch_type: '',
        speed: '',
        count: 1,
        notes: ''
      });
      
    } catch (error) {
      console.error('Error logging punch:', error);
      setMessage(`Error: ${error.response?.data?.detail || 'Failed to log punch'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="card">
        <h2>Log Punch Session</h2>
        <div className="alert alert-error">
          Please login first to log punches.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Log Punch Session</h2>
      <p>Current Session: <strong>{currentSession.name}</strong> (ID: {currentSession.id})</p>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="punch-form">
        <div className="form-group">
          <label>Punch Type:</label>
          <div className="punch-type-grid">
            {punchTypes.map(type => (
              <button
                key={type.value}
                type="button"
                className={`punch-type-btn ${punchData.punch_type === type.value ? 'selected' : ''}`}
                onClick={() => handlePunchTypeSelect(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="speed">Speed (mph):</label>
          <input
            type="number"
            id="speed"
            name="speed"
            value={punchData.speed}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            required
            placeholder="Enter punch speed"
          />
        </div>

        <div className="form-group">
          <label htmlFor="count">Count:</label>
          <input
            type="number"
            id="count"
            name="count"
            value={punchData.count}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional):</label>
          <textarea
            id="notes"
            name="notes"
            value={punchData.notes}
            onChange={handleInputChange}
            rows="3"
            placeholder="Add any notes about this punch"
          />
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={isSubmitting || !punchData.punch_type}
        >
          {isSubmitting ? 'Logging...' : 'Log Punch'}
        </button>
      </form>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Instructions:</h4>
        <ul>
          <li>Select the type of punch you performed</li>
          <li>Enter the speed in miles per hour</li>
          <li>Specify how many punches of this type</li>
          <li>Add optional notes about your technique or form</li>
        </ul>
      </div>
    </div>
  );
}

export default PunchLogger;
