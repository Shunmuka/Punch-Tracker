'use client'

import { useState, useEffect } from 'react'
import KPICard from '../components/KPICard'
import SpeedChart from '../components/SpeedChart'

interface SessionSummary {
  id: number
  created_at: string
  punch_count: number
  avg_speed: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_URL}/sessions`)
      if (!response.ok) throw new Error('Failed to fetch sessions')
      const data = await response.json()
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const seedData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/seed`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to seed data')
      await fetchSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed data')
    }
  }

  const totalPunches = sessions.reduce((sum, session) => sum + session.punch_count, 0)
  const avgSpeed = sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + session.avg_speed, 0) / sessions.length 
    : 0

  const chartData = sessions.map((session, index) => ({
    session: index + 1,
    speed: session.avg_speed
  }))

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-neon-cyan text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neon-cyan mb-2">PunchTracker</h1>
          <p className="text-gray-400">Boxing Analytics Dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Seed Data Button */}
        {sessions.length === 0 && (
          <div className="text-center mb-8">
            <button
              onClick={seedData}
              className="bg-neon-cyan text-dark-bg px-6 py-3 rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Load Sample Data
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Total Sessions"
            value={sessions.length}
            subtitle="All time"
          />
          <KPICard
            title="Total Punches"
            value={totalPunches.toLocaleString()}
            subtitle="Punches thrown"
          />
          <KPICard
            title="Avg Speed"
            value={`${avgSpeed.toFixed(1)} m/s`}
            subtitle="Across all sessions"
          />
          <KPICard
            title="Latest Session"
            value={sessions.length > 0 ? `#${sessions[sessions.length - 1].id}` : 'None'}
            subtitle={sessions.length > 0 ? new Date(sessions[sessions.length - 1].created_at).toLocaleDateString() : ''}
          />
        </div>

        {/* Chart */}
        {sessions.length > 0 && (
          <SpeedChart data={chartData} />
        )}

        {/* Sessions List */}
        {sessions.length > 0 && (
          <div className="card mt-8">
            <h3 className="text-lg font-semibold mb-4 text-neon-cyan">Recent Sessions</h3>
            <div className="space-y-2">
              {sessions.slice(-5).reverse().map((session) => (
                <div key={session.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <span className="font-medium">Session #{session.id}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-neon-cyan font-semibold">{session.punch_count} punches</div>
                    <div className="text-sm text-gray-400">{session.avg_speed} m/s avg</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
