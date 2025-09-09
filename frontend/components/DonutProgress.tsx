'use client'

interface DonutProgressProps {
  label: string
  value: number
  percent: number
  color?: string
}

export default function DonutProgress({ 
  label, 
  value, 
  percent, 
  color = "#C8F560" 
}: DonutProgressProps) {
  const radius = 60
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="card text-center">
      <h3 className="text-lg font-bold text-text mb-4">{label}</h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#374151"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-text">{percent}%</div>
            <div className="text-xs text-subtext">{value}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
