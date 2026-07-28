import './StatCard.css'

export default function StatCard({ title, value, type = 'default', icon }) {
  return (
    <div className={`stat-card stat-card-${type}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  )
}
