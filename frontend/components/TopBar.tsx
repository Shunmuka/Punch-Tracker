'use client'

import { Bell, User } from 'lucide-react'

interface TopBarProps {
  userName?: string
}

export default function TopBar({ userName = "Athlete" }: TopBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-bg">
      {/* Left - Avatar */}
      <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-bg" />
      </div>
      
      {/* Center - Greeting */}
      <div className="text-center">
        <h1 className="text-lg font-bold text-text">Hi, {userName}</h1>
        <p className="text-xs text-subtext">Stay sharp today</p>
      </div>
      
      {/* Right - Notifications */}
      <div className="relative">
        <Bell className="w-5 h-5 text-subtext hover:text-accent-primary transition-colors cursor-pointer" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-primary rounded-full"></div>
      </div>
    </div>
  )
}
