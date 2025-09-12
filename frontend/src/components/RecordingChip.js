import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${m}:${String(sec).padStart(2, '0')}`;
}

const RecordingChip = ({ className = '' }) => {
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nowTs, setNowTs] = useState(Date.now());
  const [templates, setTemplates] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const navigate = useNavigate();

  const fetchActive = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/workouts/active`);
      setActive(res.data || null);
    } catch (error) {
      // Silently ignore to avoid navbar noise
    }
  }, []);

  useEffect(() => {
    // Initial fetch and polling
    fetchActive();
    const pollId = setInterval(fetchActive, 8000);
    return () => clearInterval(pollId);
  }, [fetchActive]);

  useEffect(() => {
    // Fetch templates
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/workouts/templates`);
        setTemplates(res.data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Ticker to update elapsed time display
    const tickId = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, []);

  const startedAtMs = useMemo(() => (active?.started_at ? new Date(active.started_at).getTime() : null), [active]);
  const elapsedLabel = useMemo(() => {
    if (!startedAtMs) return null;
    const diffSec = (nowTs - startedAtMs) / 1000;
    return formatDuration(diffSec);
  }, [nowTs, startedAtMs]);

  const handleStart = async (templateName = null) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/workouts/start`, {
        template_name: templateName
      });
      setActive(res.data);
      setShowTemplates(false);
    } catch (error) {
      console.error('Failed to start workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      console.log('Stop clicked, active workout:', active);
      const currentId = active?.id;
      const res = await axios.post(`${API_BASE_URL}/workouts/stop`);
      console.log('Stop API response:', res.data);
      setActive(null);
      const workoutId = res?.data?.id || currentId;
      console.log('Workout ID for navigation:', workoutId);
      if (workoutId) {
        console.log('Navigating to:', `/workouts/${workoutId}/summary`);
        setTimeout(() => navigate(`/workouts/${workoutId}/summary`), 50);
      }
    } catch (error) {
      // Fallback: navigate to current active workout summary if available
      console.error('Failed to stop workout:', error);
      console.log('Error details:', error.response?.data);
      const currentId = active?.id;
      setActive(null);
      if (currentId) {
        console.log('Fallback navigation to:', `/workouts/${currentId}/summary`);
        setTimeout(() => navigate(`/workouts/${currentId}/summary`), 50);
      }
    } finally {
      setLoading(false);
    }
  };

  if (active) {
    return (
      <div className={`flex items-center space-x-1 sm:space-x-3 ${className}`}>
        <div className="flex items-center px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/30">
          <span className="relative flex h-2 w-2 mr-1 sm:mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Recording</span>
          {elapsedLabel && (
            <span className="ml-1 sm:ml-2 text-xs text-red-200/80">{elapsedLabel}</span>
          )}
        </div>
        <button
          onClick={handleStop}
          disabled={loading}
          className="px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm bg-surface2 text-muted hover:text-text hover:bg-surface border border-[#242a35] transition-all duration-200 disabled:opacity-60"
        >
          {loading ? 'Stopping...' : 'Stop'}
        </button>
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-surface2 border border-[#242a35] rounded-xl shadow-lg z-50">
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-text">Select Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-muted hover:text-text text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleStart()}
                disabled={loading}
                className="w-full text-left p-2 sm:p-3 rounded-lg bg-surface hover:bg-surface2 border border-[#242a35] transition-all duration-200"
              >
                <div className="font-semibold text-text text-sm">Free Training</div>
                <div className="text-xs text-muted">No structure, just log punches</div>
              </button>
              {Object.entries(templates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleStart(key)}
                  disabled={loading}
                  className="w-full text-left p-2 sm:p-3 rounded-lg bg-surface hover:bg-surface2 border border-[#242a35] transition-all duration-200"
                >
                  <div className="font-semibold text-text text-sm">{template.name}</div>
                  <div className="text-xs text-muted">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowTemplates(true)}
      disabled={loading}
      className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-600 transition-all duration-200 disabled:opacity-60 ${className}`}
    >
      {loading ? 'Starting...' : <span className="hidden sm:inline">Start Workout</span>}
      {loading ? '' : <span className="sm:hidden">Start</span>}
    </button>
  );
};

export default RecordingChip;


