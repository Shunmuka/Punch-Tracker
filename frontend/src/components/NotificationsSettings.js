import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';



const NotificationsSettings = () => {
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    webhook_enabled: false,
    webhook_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/notifications/prefs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPrefs(response.data);
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const token = localStorage.getItem('token');
      await axiosInstance.patch('/notifications/prefs', prefs, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('/notifications/test', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage(`Test notification sent! ${response.data.results.emails_sent} email(s), ${response.data.results.webhooks_sent} webhook(s)`);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to send test notification. Please try again.';
      setMessage(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  const handleChange = (field, value) => {
    setPrefs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface2 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-surface2 rounded"></div>
            <div className="h-4 bg-surface2 rounded w-3/4"></div>
            <div className="h-4 bg-surface2 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-text mb-6">Notification Settings</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('successfully') || message.includes('sent')
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-surface2 p-6 rounded-xl border border-[#242a35]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Email Notifications</h3>
              <p className="text-sm text-muted">Receive weekly progress reports via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email_enabled}
                onChange={(e) => handleChange('email_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Webhook Notifications */}
        <div className="bg-surface2 p-6 rounded-xl border border-[#242a35]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text">Webhook Notifications</h3>
              <p className="text-sm text-muted">Send weekly reports to a custom webhook URL</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.webhook_enabled}
                onChange={(e) => handleChange('webhook_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {prefs.webhook_enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-text mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                value={prefs.webhook_url}
                onChange={(e) => handleChange('webhook_url', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full px-4 py-2 bg-surface border border-[#242a35] rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleTest}
            disabled={testing || (!prefs.email_enabled && !prefs.webhook_enabled)}
            className="px-6 py-2 bg-surface2 text-text rounded-lg font-semibold hover:bg-surface border border-[#242a35] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {testing ? 'Sending...' : 'Send Test Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
