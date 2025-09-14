import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/coach/leaderboard?range=week`);
      setLeaderboard(response.data.entries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-muted';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface2 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface2 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-text mb-6">This Week's Leaderboard</h1>
        <div className="text-center text-muted">
          <p>No athletes found. Invite athletes to see the leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-text mb-6">This Week's Leaderboard</h1>
      
      <div className="grid gap-6">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.athlete_id}
            className="bg-surface2 p-6 rounded-xl border border-[#242a35] hover:bg-surface transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text">{entry.athlete_name}</h3>
                  <p className="text-sm text-muted">Rank #{entry.rank}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-text">{entry.total_punches}</div>
                <div className="text-sm text-muted">Total Punches</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-text">{entry.avg_speed}</div>
                <div className="text-sm text-muted">Avg Speed (mph)</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-text">
                  {Math.max(...entry.daily_punches)}
                </div>
                <div className="text-sm text-muted">Best Day</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-text">
                  {entry.daily_punches.reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-muted">7-Day Total</div>
              </div>
            </div>
            
            {/* Daily Progress Chart */}
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={entry.daily_punches.map((punches, dayIndex) => ({
                  day: dayIndex + 1,
                  punches: punches
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242a35" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9AA4AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9AA4AF"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 36, 48, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      color: '#EAECEF'
                    }}
                    labelStyle={{ color: '#9AA4AF' }}
                    itemStyle={{ color: '#EAECEF' }}
                    formatter={(value) => [`${value} punches`, 'Punches']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="punches" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
