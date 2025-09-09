'use client'

import { Home, BarChart3, Video, Users, User } from 'lucide-react'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'compare', label: 'Compare', icon: BarChart3 },
    { id: 'media', label: 'Media', icon: Video },
    { id: 'coach', label: 'Coach', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-700/30 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-full transition-all duration-200 ${
              activeTab === id
                ? 'pill-active'
                : 'text-subtext hover:text-text'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${
              activeTab === id ? 'text-bg' : 'text-subtext'
            }`} />
            <span className={`text-xs font-medium ${
              activeTab === id ? 'text-bg' : 'text-subtext'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
