import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import Card from './ui/Card';

// Use relative paths to leverage the proxy

function secondsToHMS(total) {
  if (!total && total !== 0) return '-';
  const s = Math.max(0, Math.floor(total));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

const WorkoutSummary = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get(`/workouts/${id}/summary`);
        setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.detail || 'Failed to load summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  const rounds = useMemo(() => (data?.segments || []).filter(s => s.kind === 'active'), [data]);
  const rests = useMemo(() => (data?.segments || []).filter(s => s.kind === 'rest'), [data]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card>
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted">Loading workout summary...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card>
          <div className="py-12 text-center text-red-400">{error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-text">Workout Summary</h2>
        <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-text hover:bg-surface border border-[#242a35] transition-all duration-200">Back to Dashboard</Link>
      </div>

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-muted text-sm">Total Punches</div>
            <div className="text-2xl font-bold text-text">{data.total_punches}</div>
          </div>
          <div>
            <div className="text-muted text-sm">Avg Speed</div>
            <div className="text-2xl font-bold text-text">{data.average_speed} mph</div>
          </div>
          <div>
            <div className="text-muted text-sm">Duration</div>
            <div className="text-2xl font-bold text-text">{secondsToHMS(data.duration_seconds)}</div>
          </div>
          <div>
            <div className="text-muted text-sm">Rounds / Rests</div>
            <div className="text-2xl font-bold text-text">{data.rounds} / {data.rests}</div>
          </div>
        </div>
      </Card>

      <Card title="Rounds">
        <div className="space-y-3">
          {rounds.length === 0 && <div className="text-muted">No rounds detected yet.</div>}
          {rounds.map((r, i) => (
            <div key={r.id || i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-[#242a35]">
              <div className="text-text font-semibold">Round {i + 1}</div>
              <div className="text-muted text-sm">
                {new Date(r.started_at).toLocaleTimeString()} – {new Date(r.ended_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rests">
        <div className="space-y-3">
          {rests.length === 0 && <div className="text-muted">No rests detected.</div>}
          {rests.map((r, i) => (
            <div key={r.id || i} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-[#242a35]">
              <div className="text-text font-semibold">Rest {i + 1}</div>
              <div className="text-muted text-sm">
                {new Date(r.started_at).toLocaleTimeString()} – {new Date(r.ended_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WorkoutSummary;


