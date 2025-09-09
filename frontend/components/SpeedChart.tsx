'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SpeedChartProps {
  data: Array<{
    session: number
    speed: number
  }>
}

export default function SpeedChart({ data }: SpeedChartProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold gradient-text">Speed Over Time</h3>
        <div className="text-sm text-gray-400">m/s</div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="session" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Session', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Speed (m/s)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                color: 'white',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#22D3EE', fontWeight: 'bold' }}
              formatter={(value: any) => [`${value} m/s`, 'Speed']}
            />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="url(#speedGradient)" 
              strokeWidth={3}
              dot={{ fill: '#22D3EE', strokeWidth: 3, r: 6, stroke: '#0B0F14' }}
              activeDot={{ r: 8, stroke: '#22D3EE', strokeWidth: 2, fill: '#0B0F14' }}
            />
            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
