import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import Card from './ui/Card';
import Metric from './ui/Metric';
import { chartTheme } from './charts/Theme';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(1);

  useEffect(() => {
    fetchSessions();
    fetchWeeklyAnalytics();
    fetchAnalytics();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sessions?limit=20`);
      setSessions(response.data.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const fetchWeeklyAnalytics = async () => {
    setWeeklyLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/weekly`);
      setWeeklyAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch weekly analytics:', err);
    } finally {
      setWeeklyLoading(false);
    }
  };

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
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted">Loading analytics...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Error Loading Dashboard</h3>
            <p className="text-muted mb-6">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-muted">No analytics data available</p>
          </div>
        </Card>
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

  // Pie chart data for punch types
  const pieData = Object.entries(analytics.punch_types).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count
  }));

  const COLORS = ['#E53935', '#FF6A00', '#FF9500', '#FFB74D'];

  return (
    <div className="space-y-8">
      {/* Session Filter Bar */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text mb-1">Training Dashboard</h2>
            <p className="text-muted">Track your boxing performance and progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <label htmlFor="sessionSelect" className="text-sm font-medium text-muted">
              Session:
            </label>
            <select
              id="sessionSelect"
              value={sessionId}
              onChange={handleSessionChange}
              className="bg-surface2 border border-[#242a35] text-text rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-w-48"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({new Date(session.started_at).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button 
              onClick={fetchAnalytics}
              className="bg-primary hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      </Card>

      {/* Weekly Analytics Section */}
      {weeklyAnalytics && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text">Weekly Progress</h3>
          
          {/* Weekly Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Metric
              label="This Week vs Last Week"
              value={`${weeklyAnalytics.delta_percent > 0 ? '+' : ''}${weeklyAnalytics.delta_percent}%`}
              accent="primary"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            
            <Metric
              label="This Week Punches"
              value={weeklyAnalytics.this_week.total_punches}
              accent="primary"
              icon="🥊"
            />
            
            <Metric
              label="Streak"
              value="7 days"
              accent="primary"
              icon="🔥"
            />
            
            <Metric
              label="Fatigue (beta)"
              value={weeklyAnalytics.fatigue_proxy ? `${weeklyAnalytics.fatigue_proxy.toFixed(2)}` : 'N/A'}
              accent="primary"
              icon="⚡"
            />
          </div>

          {/* Weekly Sparkline */}
          <Card title="4-Week Trend" subtitle="Punch count over the last 4 weeks">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyAnalytics.sparkline_data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} />
                  <XAxis 
                    dataKey="date" 
                    stroke={chartTheme.colors.muted}
                    fontSize={11}
                    fontFamily="Inter, system-ui, sans-serif"
                  />
                  <YAxis 
                    stroke={chartTheme.colors.muted}
                    fontSize={11}
                    fontFamily="Inter, system-ui, sans-serif"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: chartTheme.recharts.tooltip.backgroundColor,
                      border: chartTheme.recharts.tooltip.border,
                      borderRadius: chartTheme.recharts.tooltip.borderRadius,
                      boxShadow: chartTheme.recharts.tooltip.boxShadow,
                      color: chartTheme.recharts.tooltip.color
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_punches" 
                    stroke={chartTheme.colors.primary} 
                    strokeWidth={3}
                    dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric
          label="Total Punches"
          value={analytics.total_punches}
          accent="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <Metric
          label="Average Speed"
          value={`${analytics.average_speed} mph`}
          accent="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        
        <Metric
          label="Session Duration"
          value={analytics.session_duration_minutes 
            ? `${Math.round(analytics.session_duration_minutes)} min`
            : 'N/A'
          }
          accent="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <Metric
          label="ML Classification"
          value={analytics.ml_classification || 'N/A'}
          accent="primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Punch Types Distribution */}
        <Card title="Punch Types Distribution" subtitle="Breakdown of punch types in this session">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={punchTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} />
                <XAxis 
                  dataKey="type" 
                  stroke={chartTheme.colors.muted}
                  fontSize={11}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <YAxis 
                  stroke={chartTheme.colors.muted}
                  fontSize={11}
                  fontFamily="Inter, system-ui, sans-serif"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(42, 47, 58, 0.72)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                    color: '#CED4DE',
                    padding: '10px 12px'
                  }}
                  labelStyle={{ color: '#9AA4AF', fontWeight: 600 }}
                  itemStyle={{ color: '#CED4DE', opacity: 0.9 }}
                  formatter={(value) => [`${value}`, 'Count']}
                  labelFormatter={(label) => label}
                />
                <Bar 
                  dataKey="count" 
                  fill={chartTheme.colors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Punch Types Pie Chart */}
        <Card title="Punch Distribution" subtitle="Visual breakdown of punch types">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(42, 47, 58, 0.72)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                    color: '#CED4DE',
                    padding: '10px 12px'
                  }}
                  labelStyle={{ color: '#9AA4AF', fontWeight: 600 }}
                  itemStyle={{ color: '#CED4DE', opacity: 0.9 }}
                  formatter={(value) => [`${value}`, 'Count']}
                  labelFormatter={(label) => label}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Speed Analysis */}
      <Card title="Speed Analysis" subtitle="Average punch speed performance">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.colors.grid} />
              <XAxis 
                dataKey="name" 
                stroke={chartTheme.colors.muted}
                fontSize={11}
                fontFamily="Inter, system-ui, sans-serif"
              />
              <YAxis 
                stroke={chartTheme.colors.muted}
                fontSize={11}
                fontFamily="Inter, system-ui, sans-serif"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: chartTheme.recharts.tooltip.backgroundColor,
                  border: chartTheme.recharts.tooltip.border,
                  borderRadius: chartTheme.recharts.tooltip.borderRadius,
                  boxShadow: chartTheme.recharts.tooltip.boxShadow,
                  color: chartTheme.recharts.tooltip.color
                }}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke={chartTheme.colors.primary} 
                strokeWidth={3}
                dot={{ fill: chartTheme.colors.primary, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: chartTheme.colors.primary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Session Details */}
      <Card title="Session Details" subtitle="Additional session information">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Session ID</p>
            <p className="text-lg font-semibold text-text">{analytics.session_id}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Punch Types</p>
            <p className="text-lg font-semibold text-text">{Object.keys(analytics.punch_types).length}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Most Common</p>
            <p className="text-lg font-semibold text-text">
              {Object.entries(analytics.punch_types).reduce((a, b) => a[1] > b[1] ? a : b, ['None', 0])[0]}
            </p>
          </div>
        </div>
      </Card>

      {/* Future Features Note */}
      <Card>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Coming Soon</h3>
          <p className="text-muted mb-4">This is an MVP dashboard. Future versions will include:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Historical session comparisons</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Advanced ML fatigue detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Real-time coaching feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Video analysis integration</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
