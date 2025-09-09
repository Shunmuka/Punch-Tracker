'use client'

import { Zap } from 'lucide-react'

interface HeroTipCardProps {
  title: string
  subtitle: string
  ctaLabel: string
  onCtaClick?: () => void
}

export default function HeroTipCard({ 
  title, 
  subtitle, 
  ctaLabel, 
  onCtaClick 
}: HeroTipCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent-primary/20 to-transparent p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-bg" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">{title}</h2>
            <p className="text-sm text-subtext">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onCtaClick}
          className="btn-primary text-sm px-4 py-2"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
