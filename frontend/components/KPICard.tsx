interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
}

export default function KPICard({ title, value, subtitle, className = "" }: KPICardProps) {
  return (
    <div className={`kpi-card ${className}`}>
      <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-neon-cyan mb-1">{value}</div>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}
