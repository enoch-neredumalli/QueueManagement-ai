import React from 'react';

export default function CongestionBadge({ level = 'Low', showDot = true, size = 'md' }) {
  const normalized = (level || 'Low').toLowerCase();
  
  let badgeClass = 'badge-low';
  let dotColor = 'var(--emerald)';
  let label = level;

  if (normalized.includes('mod') || normalized.includes('med')) {
    badgeClass = 'badge-medium';
    dotColor = 'var(--amber)';
    label = 'Moderate';
  } else if (normalized.includes('crit')) {
    badgeClass = 'badge-critical';
    dotColor = 'var(--rose)';
    label = 'Critical';
  } else if (normalized.includes('high')) {
    badgeClass = 'badge-high';
    dotColor = 'var(--rose)';
    label = 'High';
  } else {
    badgeClass = 'badge-low';
    dotColor = 'var(--emerald)';
    label = 'Low';
  }

  const paddingStyle = size === 'sm' ? { padding: '2px 8px', fontSize: '0.72rem' } : {};

  return (
    <span className={`congestion-badge ${badgeClass}`} style={paddingStyle}>
      {showDot && (
        <span 
          className="pulse-dot" 
          style={{ 
            backgroundColor: dotColor, 
            boxShadow: `0 0 0 2px ${badgeClass.includes('low') ? 'var(--emerald-subtle)' : badgeClass.includes('med') ? 'var(--amber-subtle)' : 'var(--rose-subtle)'}` 
          }} 
        />
      )}
      {label}
    </span>
  );
}
