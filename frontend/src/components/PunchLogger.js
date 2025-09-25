import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import Card from './ui/Card';
import { useAuth } from '../contexts/AuthContext';

// Use relative paths to leverage the proxy

function PunchLogger() {
  const { user } = useAuth();
  const [punchData, setPunchData] = useState({
    session_id: '',
    punch_type: '',
    speed: '',
    count: 1,
    notes: ''
  });
  const [sessions, setSessions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  const punchTypes = [
    { value: 'jab', label: 'Jab', icon: '👊' },
    { value: 'cross', label: 'Cross', icon: '🥊' },
    { value: 'hook', label: 'Hook', icon: '💥' },
    { value: 'uppercut', label: 'Uppercut', icon: '⚡' }
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/sessions?limit=50');
      setSessions(response.data.sessions);
      if (response.data.sessions.length > 0) {
        setPunchData(prev => ({
          ...prev,
          session_id: response.data.sessions[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setMessage('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = () => {
    setNewSessionName('');
    setShowSessionModal(true);
  };

  const submitNewSession = async () => {
    if (!newSessionName.trim()) return;
    try {
      setCreatingSession(true);
      const response = await axiosInstance.post('/sessions', {
        name: newSessionName.trim()
      });
      setSessions(prev => [response.data, ...prev]);
      setPunchData(prev => ({
        ...prev,
        session_id: response.data.id
      }));
      setMessage('New session created!');
      setShowSessionModal(false);
      setNewSessionName('');
    } catch (err) {
      console.error('Failed to create session:', err);
      setMessage('Failed to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPunchData(prev => ({
      ...prev,
      // Keep numeric inputs as strings while typing so users can clear them
      [name]: (name === 'speed' || name === 'count') ? value : value
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
    if (!punchData.session_id) {
      setMessage('Please select a session');
      return;
    }

    // Convert numeric strings to numbers with validation
    const parsedSpeed = punchData.speed === '' ? 0 : parseFloat(punchData.speed);
    const parsedCount = punchData.count === '' ? 0 : parseInt(punchData.count, 10);
    if (isNaN(parsedSpeed) || isNaN(parsedCount) || parsedCount < 1) {
      setMessage('Please enter valid numbers for speed and count');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/punches', {
        ...punchData,
        speed: parsedSpeed,
        count: parsedCount
      });
      setMessage('Punch logged successfully!');
      setPunchData(prev => ({
        ...prev,
        punch_type: '',
        speed: '',
        count: 1,
        notes: ''
      }));
      
      // Trigger a custom event to notify other components that a punch was logged
      // This will help the RecordingChip component know to refresh its state
      window.dispatchEvent(new CustomEvent('punchLogged'));
    } catch (error) {
      console.error('Error logging punch:', error);
      setMessage(`Error: ${error.response?.data?.detail || 'Failed to log punch'}`);
    }

    finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading sessions...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Card */}
      <Card>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text mb-4">Log Punch Session</h2>
          
          {/* Session Selection */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <label htmlFor="sessionSelect" className="text-sm font-medium text-muted">
              Select Session:
            </label>
            <select
              id="sessionSelect"
              value={punchData.session_id}
              onChange={(e) => setPunchData(prev => ({ ...prev, session_id: parseInt(e.target.value) }))}
              className="bg-surface2 border border-[#242a35] text-text rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-w-48"
            >
              <option value="">Select a session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({new Date(session.started_at).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button
              onClick={createNewSession}
              className="bg-primary hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
            >
              New Session
            </button>
          </div>
          
          {punchData.session_id && (
            <p className="text-muted">
              Selected: <span className="text-primary font-semibold">
                {sessions.find(s => s.id === punchData.session_id)?.name}
              </span>
            </p>
          )}
        </div>
      </Card>

      {/* Message Alert */}
      {message && (
        <Card>
          <div className={`flex items-center space-x-3 ${
            message.includes('Error') ? 'text-red-400' : 'text-green-400'
          }`}>
            <div className="flex-shrink-0">
              {message.includes('Error') ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className="font-medium">{message}</p>
          </div>
        </Card>
      )}

      {/* Punch Form */}
      <Card title="Punch Details" subtitle="Record your training data">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Punch Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-text mb-4">Punch Type</label>
            <div className="grid grid-cols-2 gap-4">
              {punchTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handlePunchTypeSelect(type.value)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    punchData.punch_type === type.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-[#242a35] bg-surface2 text-muted hover:border-primary/50 hover:text-text'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-semibold">{type.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Speed and Count Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="speed" className="block text-sm font-semibold text-text mb-2">
                Speed (mph)
              </label>
              <input
                type="text"
                id="speed"
                name="speed"
                value={punchData.speed}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                required
                placeholder="Speed in MPH"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-semibold text-text mb-2">
                Count
              </label>
              <input
                type="text"
                id="count"
                name="count"
                value={punchData.count}
                onChange={handleInputChange}
                min="1"
                required
                placeholder="Number of Punches"
                className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-text mb-2">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={punchData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add any notes about your technique or form..."
              className="w-full bg-surface2 border border-[#242a35] text-text placeholder-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || !punchData.punch_type || !punchData.session_id}
            className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-200 ${
              punchData.punch_type && punchData.session_id && !isSubmitting
                ? 'bg-primary hover:bg-primary-600 text-white shadow-button'
                : 'bg-surface2 text-muted cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Logging...</span>
              </div>
            ) : (
              'Log Punch'
            )}
          </button>
        </form>
      </Card>

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSessionModal(false)}></div>
          <div className="relative bg-surface2 border border-[#242a35] rounded-2xl shadow-soft w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-text mb-2">New Session</h3>
            <p className="text-sm text-muted mb-4">Enter a name for your training session.</p>
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="e.g., Morning Drills"
              className="w-full bg-surface border border-[#242a35] text-text placeholder-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 rounded-xl text-muted hover:text-text hover:bg-surface transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewSession}
                disabled={creatingSession || !newSessionName.trim()}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  newSessionName.trim() && !creatingSession ? 'bg-primary hover:bg-primary-600 text-white' : 'bg-surface text-muted cursor-not-allowed'
                }`}
              >
                {creatingSession ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <div className="text-center">
          <h4 className="text-lg font-bold text-text mb-4">How to Use</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">1</div>
              <span>Select the type of punch you performed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">2</div>
              <span>Enter the speed in miles per hour</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">3</div>
              <span>Specify how many punches of this type</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">4</div>
              <span>Add optional notes about your technique</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PunchLogger;
