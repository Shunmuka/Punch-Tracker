'use client'

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface MiniBarsCardProps {
  title: string
  data: Array<{ day: string; value: number }>
  color?: string
}

export default function MiniBarsCard({ 
  title, 
  data, 
  color = "#C8F560" 
}: MiniBarsCardProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text mb-3">{title}</h3>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9FB3C8' }}
            />
            <YAxis hide />
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
