'use client'

import { ChevronRight, Calendar, Zap, Target } from 'lucide-react'

interface Session {
  id: number
  created_at: string
  punch_count: number
  avg_speed: number
}

interface RecentSessionsListProps {
  sessions: Session[]
}

export default function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text">Recent Sessions</h3>
        <span className="text-sm text-subtext">Last 5 sessions</span>
      </div>
      
      <div className="space-y-2">
        {sessions.slice(-5).reverse().map((session, index) => (
          <div 
            key={session.id} 
            className={`session-row flex items-center justify-between p-4 rounded-xl ${
              index !== sessions.slice(-5).length - 1 ? 'border-b border-gray-700/30' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-bg">#{session.id}</span>
              </div>
              <div>
                <div className="font-semibold text-text">Session #{session.id}</div>
                <div className="text-sm text-subtext flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(session.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-accent-primary">{session.punch_count}</div>
                  <div className="text-xs text-subtext">punches</div>
                </div>
                <Zap className="w-4 h-4 text-accent-primary" />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-lg font-bold text-accent-secondary">{session.avg_speed}</div>
                  <div className="text-xs text-subtext">m/s avg</div>
                </div>
                <Target className="w-4 h-4 text-accent-secondary" />
              </div>
              
              <button className="p-2 hover:bg-surface rounded-full transition-colors">
                <ChevronRight className="w-4 h-4 text-subtext" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
