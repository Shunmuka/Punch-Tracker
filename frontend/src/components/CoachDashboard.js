import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './ui/Card';
import Metric from './ui/Metric';
import axios from 'axios';

// Use relative paths to leverage the proxy
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function CoachDashboard() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/coach/athletes');
      setAthletes(response.data.athletes);
    } catch (err) {
      console.error('Failed to fetch athletes:', err);
      setError('Failed to load athletes');
    } finally {
      setLoading(false);
    }
  };

  const inviteAthlete = async (email) => {
    try {
      await axios.post(`${API_BASE_URL}/api/coach/invite`, {
        athlete_email: email
      });
      alert('Invite sent successfully!');
    } catch (err) {
      console.error('Failed to send invite:', err);
      alert('Failed to send invite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading athletes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-text mb-2">
          Coach Dashboard
        </h1>
        <p className="text-muted">
          Monitor your athletes' progress and performance
        </p>
        <div className="mt-4">
          <a
            href="/coach/leaderboard"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200"
          >
            🏆 View Leaderboard
          </a>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric
          label="Total Athletes"
          value={athletes.length}
          icon="👥"
          accent="primary"
        />
        <Metric
          label="Active This Week"
          value={athletes.filter(a => a.last_session_date && 
            new Date(a.last_session_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length}
          icon="🔥"
          accent="primary"
        />
        <Metric
          label="Total Sessions"
          value={athletes.reduce((sum, a) => sum + a.sessions_count, 0)}
          icon="📊"
          accent="primary"
        />
      </div>

      {/* Athletes List */}
      <Card title="Your Athletes" subtitle="Click on an athlete to view their detailed dashboard">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {athletes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold text-text mb-2">No Athletes Yet</h3>
            <p className="text-muted mb-6">
              Invite athletes to start tracking their progress
            </p>
            <button
              onClick={() => {
                const email = prompt('Enter athlete email:');
                if (email) inviteAthlete(email);
              }}
              className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Invite Athlete
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {athletes.map((athlete) => (
              <div
                key={athlete.id}
                className="bg-surface2 rounded-2xl p-6 border border-[#242a35] hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  // In a real app, this would navigate to athlete's dashboard
                  alert(`Viewing ${athlete.username}'s dashboard - Coming soon!`);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                      {athlete.username}
                    </h3>
                    <p className="text-sm text-muted">{athlete.email}</p>
                  </div>
                  <div className="text-2xl">🥊</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{athlete.total_punches}</div>
                    <div className="text-xs text-muted">Total Punches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{athlete.average_speed}</div>
                    <div className="text-xs text-muted">Avg Speed (mph)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {athlete.sessions_count} sessions
                  </span>
                  <span className="text-muted">
                    {athlete.last_session_date 
                      ? `Last: ${new Date(athlete.last_session_date).toLocaleDateString()}`
                      : 'No sessions yet'
                    }
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#242a35]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">Click to view details</span>
                    <div className="text-primary group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              const email = prompt('Enter athlete email:');
              if (email) inviteAthlete(email);
            }}
            className="p-4 bg-surface2 hover:bg-primary/10 border border-[#242a35] hover:border-primary rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">➕</div>
              <div>
                <div className="font-semibold text-text group-hover:text-primary">Invite Athlete</div>
                <div className="text-sm text-muted">Send an invitation to a new athlete</div>
              </div>
            </div>
          </button>

          <button
            onClick={fetchAthletes}
            className="p-4 bg-surface2 hover:bg-primary/10 border border-[#242a35] hover:border-primary rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🔄</div>
              <div>
                <div className="font-semibold text-text group-hover:text-primary">Refresh Data</div>
                <div className="text-sm text-muted">Update athlete statistics</div>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}

export default CoachDashboard;
