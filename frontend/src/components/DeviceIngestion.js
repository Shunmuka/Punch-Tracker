import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';


const DeviceIngestion = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/device/keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      setMessage('');
      const response = await axiosInstance.post('/device/keys', {
        name: newKeyName.trim()
      });
      setNewKey(response.data);
      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to create API key:', error);
      setMessage('Failed to create API key. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      setDeleting(keyId);
      await axiosInstance.delete(`/device/keys/${keyId}`);
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setMessage('Failed to delete API key. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-text mb-6">Device Ingestion</h1>
      
      {message && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
          {message}
        </div>
      )}

      {/* New Key Creation */}
      <div className="bg-surface2 p-6 rounded-xl border border-[#242a35] mb-8">
        <h2 className="text-xl font-semibold text-text mb-4">Create API Key</h2>
        <form onSubmit={createApiKey} className="flex space-x-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Enter key name (e.g., 'My Device')"
            className="flex-1 px-4 py-2 bg-surface border border-[#242a35] rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create Key'}
          </button>
        </form>
      </div>

      {/* New Key Display */}
      {newKey && (
        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-green-400 mb-2">API Key Created!</h3>
          <p className="text-sm text-muted mb-4">
            Save this secret key securely. It won't be shown again.
          </p>
          <div className="bg-surface p-4 rounded-lg font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text break-all">{newKey.secret}</span>
              <button
                onClick={() => copyToClipboard(newKey.secret)}
                className="ml-4 px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary-600 transition-all duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Keys */}
      <div className="bg-surface2 p-6 rounded-xl border border-[#242a35] mb-8">
        <h2 className="text-xl font-semibold text-text mb-4">Your API Keys</h2>
        {apiKeys.length === 0 ? (
          <p className="text-muted">No API keys created yet.</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                <div>
                  <div className="font-semibold text-text">{key.name}</div>
                  <div className="text-sm text-muted">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && (
                      <span> • Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteApiKey(key.id)}
                  disabled={deleting === key.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all duration-200 disabled:opacity-60"
                >
                  {deleting === key.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="bg-surface2 p-6 rounded-xl border border-[#242a35]">
        <h2 className="text-xl font-semibold text-text mb-4">Integration Guide</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-text mb-2">1. Endpoint</h3>
            <div className="bg-surface p-4 rounded-lg font-mono text-sm">
              POST /api/device/ingest
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-text mb-2">2. Headers</h3>
            <div className="bg-surface p-4 rounded-lg font-mono text-sm">
              <div>Content-Type: application/json</div>
              <div>X-Signature: sha256=your_hmac_signature</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-text mb-2">3. Request Body</h3>
            <div className="bg-surface p-4 rounded-lg font-mono text-sm">
              <pre>{`{
  "user_api_key": "your_api_key_here",
  "events": [
    {
      "ts": "2024-01-01T12:00:00Z",
      "punch_type": "jab",
      "speed": 25.5,
      "count": 1
    }
  ]
}`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-text mb-2">4. HMAC Signature</h3>
            <p className="text-muted mb-2">
              Create HMAC-SHA256 signature of the request body using your API key as the secret:
            </p>
            <div className="bg-surface p-4 rounded-lg font-mono text-sm">
              <div>HMAC-SHA256(body, api_key) → hex digest</div>
              <div>Header: X-Signature: sha256=hex_digest</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-text mb-2">5. Rate Limits</h3>
            <p className="text-muted">
              60 requests per minute per API key. Requests exceeding this limit will return HTTP 429.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceIngestion;