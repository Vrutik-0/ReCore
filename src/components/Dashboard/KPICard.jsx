import './KPICard.css';

export default function KPICard({ icon, label, value, trend, color = 'accent', onClick }) {
  return (
    <div
      className={`kpi-card kpi-${color} ${onClick ? 'kpi-clickable' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="kpi-icon-wrap">
        {icon}
      </div>
      <div className="kpi-info">
        <span className="kpi-value">{value}</span>
        <span className="kpi-label">{label}</span>
      </div>
      {trend !== undefined && (
        <span className={`kpi-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
        </span>
      )}
    </div>
  );
}
