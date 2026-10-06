import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({ 
  label, 
  value, 
  unit = '', 
  icon: Icon, 
  trend = null, 
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  subtitle = null 
}) {
  return (
    <div className="stat-card-clean">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span className="stat-value">{value}</span>
        {unit && (
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="stat-bottom">
          {trend && (
            <span className={`trend-pill ${trendType}`}>
              {trendType === 'up' && <ArrowUpRight size={14} />}
              {trendType === 'down' && <ArrowDownRight size={14} />}
              {trendType === 'neutral' && <Minus size={14} />}
              {trend}
            </span>
          )}
          {subtitle && (
            <span style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
