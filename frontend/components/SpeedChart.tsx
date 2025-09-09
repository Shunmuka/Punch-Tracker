'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SpeedChartProps {
  data: Array<{
    session: number
    speed: number
    count: number
    accuracy: number
  }>
  chartType?: string
}

export default function SpeedChart({ data, chartType = 'Speed' }: SpeedChartProps) {
  const getDataKey = () => {
    switch (chartType) {
      case 'Count': return 'count'
      case 'Accuracy': return 'accuracy'
      default: return 'speed'
    }
  }

  const getYAxisLabel = () => {
    switch (chartType) {
      case 'Count': return 'Punches'
      case 'Accuracy': return 'Accuracy (%)'
      default: return 'Speed (m/s)'
    }
  }

  const getFormatter = () => {
    switch (chartType) {
      case 'Count': return (value: any) => [`${value}`, 'Punches']
      case 'Accuracy': return (value: any) => [`${value}%`, 'Accuracy']
      default: return (value: any) => [`${value} m/s`, 'Speed']
    }
  }

  const dataKey = getDataKey()
  const yAxisLabel = getYAxisLabel()
  const formatter = getFormatter()

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="session" 
            stroke="#9FB3C8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Session', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9FB3C8' } }}
          />
          <YAxis 
            stroke="#9FB3C8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9FB3C8' } }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#171C28',
              border: '1px solid #374151',
              borderRadius: '12px',
              color: '#E6F1FF',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            labelStyle={{ color: '#C8F560', fontWeight: 'bold' }}
            formatter={formatter}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey}
            stroke="url(#chartGradient)" 
            strokeWidth={3}
            dot={{ fill: '#C8F560', strokeWidth: 3, r: 6, stroke: '#0A0D12' }}
            activeDot={{ r: 8, stroke: '#C8F560', strokeWidth: 2, fill: '#0A0D12' }}
          />
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C8F560" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
