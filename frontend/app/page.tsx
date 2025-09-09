'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Zap, 
  TrendingUp, 
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react'
import TopBar from '../components/TopBar'
import HeroTipCard from '../components/HeroTipCard'
import KpiCard from '../components/KpiCard'
import TogglePills from '../components/TogglePills'
import SpeedChart from '../components/SpeedChart'
import DonutProgress from '../components/DonutProgress'
import MiniBarsCard from '../components/MiniBarsCard'
import MiniTrendCard from '../components/MiniTrendCard'
import RecentSessionsList from '../components/RecentSessionsList'
import BottomNav from '../components/BottomNav'

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
  const [activeTab, setActiveTab] = useState('home')
  const [chartType, setChartType] = useState('Speed')

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
  const accuracy = 78 // Mock accuracy for now
  const streak = 7 // Mock streak for now

  const chartData = sessions.map((session, index) => ({
    session: index + 1,
    speed: session.avg_speed,
    count: session.punch_count,
    accuracy: accuracy
  }))

  // Mock data for mini widgets
  const weeklyPunchesData = [
    { day: 'M', value: 45 },
    { day: 'T', value: 52 },
    { day: 'W', value: 38 },
    { day: 'T', value: 61 },
    { day: 'F', value: 47 },
    { day: 'S', value: 33 },
    { day: 'S', value: 29 }
  ]

  const weeklySpeedData = [
    { day: 'M', value: 8.2 },
    { day: 'T', value: 9.1 },
    { day: 'W', value: 7.8 },
    { day: 'T', value: 9.5 },
    { day: 'F', value: 8.7 },
    { day: 'S', value: 7.2 },
    { day: 'S', value: 6.9 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-2xl font-bold gradient-text">Loading PunchTracker...</div>
          <div className="text-subtext mt-2">Preparing your analytics dashboard</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Top Bar */}
      <TopBar userName="Athlete" />
      
      <div className="px-4 py-6">
        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-2xl mb-6"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </motion.div>
        )}

        {/* Hero Tip Card */}
        {sessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <button
              onClick={seedData}
              className="btn-primary text-lg px-8 py-4"
            >
              Load Sample Data
            </button>
          </motion.div>
        ) : (
          <HeroTipCard
            title="Stay Active"
            subtitle="Your Daily Boost Of Energy!"
            ctaLabel="Log Session"
            onCtaClick={() => console.log('Log session clicked')}
          />
        )}

        {/* KPI Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <KpiCard
            icon={Target}
            label="Total Punches"
            value={totalPunches.toLocaleString()}
            subtitle="This week"
            sparklineData={weeklyPunchesData.map(d => ({ value: d.value }))}
          />
          <KpiCard
            icon={Zap}
            label="Avg Speed"
            value={`${avgSpeed.toFixed(1)}`}
            subtitle="m/s"
            sparklineData={weeklySpeedData.map(d => ({ value: d.value }))}
          />
          <KpiCard
            icon={TrendingUp}
            label="Accuracy"
            value={`${accuracy}%`}
            subtitle="Hit rate"
          />
          <KpiCard
            icon={Calendar}
            label="Streak"
            value={streak}
            subtitle="Days"
          />
        </motion.div>

        {/* Charts Section */}
        {sessions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">Performance Trends</h3>
                <TogglePills
                  options={['Speed', 'Count', 'Accuracy']}
                  selected={chartType}
                  onSelect={setChartType}
                />
              </div>
              <SpeedChart data={chartData} chartType={chartType} />
            </div>
          </motion.div>
        )}

        {/* Goal Progress & Mini Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1">
            <DonutProgress
              label="Goal Progress"
              value="78%"
              percent={78}
            />
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <MiniBarsCard
              title="Punches by Day (7d)"
              data={weeklyPunchesData}
            />
            <MiniTrendCard
              title="Average Speed (7d)"
              data={weeklySpeedData}
            />
          </div>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <RecentSessionsList sessions={sessions} />
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
