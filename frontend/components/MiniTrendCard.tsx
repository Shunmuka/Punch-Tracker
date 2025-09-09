'use client'

import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface MiniTrendCardProps {
  title: string
  data: Array<{ day: string; value: number }>
  color?: string
}

export default function MiniTrendCard({ 
  title, 
  data, 
  color = "#22D3EE" 
}: MiniTrendCardProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text mb-3">{title}</h3>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9FB3C8' }}
            />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
