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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-bold gradient-text">Loading PunchTracker...</div>
          <div className="text-gray-400 mt-2">Preparing your analytics dashboard</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-4 tracking-tight">
            PunchTracker
          </h1>
          <p className="text-xl text-gray-400 font-medium">Professional Boxing Analytics Dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-6 py-4 rounded-2xl mb-8 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {/* Seed Data Button */}
        {sessions.length === 0 && (
          <div className="text-center mb-12">
            <button
              onClick={seedData}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Load Sample Data
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
            value={`${avgSpeed.toFixed(1)}`}
            subtitle="m/s across sessions"
          />
          <KPICard
            title="Latest Session"
            value={sessions.length > 0 ? `#${sessions[sessions.length - 1].id}` : 'None'}
            subtitle={sessions.length > 0 ? new Date(sessions[sessions.length - 1].created_at).toLocaleDateString() : ''}
          />
        </div>

        {/* Chart */}
        {sessions.length > 0 && (
          <div className="mb-12">
            <SpeedChart data={chartData} />
          </div>
        )}

        {/* Sessions List */}
        {sessions.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">Recent Sessions</h3>
              <div className="text-sm text-gray-400">Last 5 sessions</div>
            </div>
            <div className="overflow-hidden rounded-xl">
              <div className="min-w-full">
                {sessions.slice(-5).reverse().map((session, index) => (
                  <div key={session.id} className={`session-row flex justify-between items-center py-4 px-6 ${index !== sessions.slice(-5).length - 1 ? 'border-b border-gray-700' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{session.id}
                      </div>
                      <div>
                        <div className="font-semibold text-white">Session #{session.id}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(session.created_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neon-cyan">{session.punch_count}</div>
                        <div className="text-sm text-gray-400">punches</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-400">{session.avg_speed}</div>
                        <div className="text-sm text-gray-400">m/s avg</div>
                      </div>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
