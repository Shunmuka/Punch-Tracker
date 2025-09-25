import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const RecordingChip = ({ className = '' }) => {
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    let interval = null;
    
    if (active && active.started_at) {
      const startTime = new Date(active.started_at).getTime();
      
      // Update immediately
      const updateElapsed = () => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };
      
      updateElapsed(); // Initial update
      interval = setInterval(updateElapsed, 1000); // Update every second
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [active]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check for active workout on mount and periodically
  useEffect(() => {
    const checkActiveWorkout = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axiosInstance.get('/workouts/active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setActive(response.data);
        } else {
          setActive(null);
        }
      } catch (error) {
        console.error('Error checking active workout:', error);
      }
    };
    
    checkActiveWorkout();
    
    // Check every 5 seconds for active workouts
    const interval = setInterval(checkActiveWorkout, 5000);
    
    // Listen for punch logged events to refresh immediately
    const handlePunchLogged = () => {
      checkActiveWorkout();
    };
    
    window.addEventListener('punchLogged', handlePunchLogged);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('punchLogged', handlePunchLogged);
    };
  }, []);

  const handleStart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Starting workout with token:', token ? 'present' : 'missing');
      
      const res = await axiosInstance.post('/workouts/start', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Workout started successfully:', res.data);
      setActive(res.data);
    } catch (error) {
      console.error('Failed to start workout:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axiosInstance.post('/workouts/stop', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setActive(null);
      const workoutId = res?.data?.id;
      if (workoutId) {
        navigate(`/workouts/${workoutId}/summary`);
      }
    } catch (error) {
      console.error('Failed to stop workout:', error);
      setActive(null);
    } finally {
      setLoading(false);
    }
  };

  if (active) {
    return (
      <button
        onClick={handleStop}
        disabled={loading}
        className={`flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 h-10 ${className}`}
      >
        <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></div>
        <span>Recording</span>
        <span>•</span>
        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className={`px-6 py-2 bg-primary hover:bg-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 h-10 ${className}`}
    >
      {loading ? 'Starting...' : 'Start Workout'}
    </button>
  );
};

export default RecordingChip;