interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
}

export default function KPICard({ title, value, subtitle, className = "" }: KPICardProps) {
  return (
    <div className={`kpi-card ${className}`}>
      <h3 className="text-sm font-medium text-gray-400 mb-3 tracking-wide uppercase">{title}</h3>
      <div className="text-4xl font-black text-neon-cyan mb-2 tracking-tight">{value}</div>
      {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
    </div>
  )
}
