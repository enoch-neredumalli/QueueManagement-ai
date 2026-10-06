import React from 'react';

export default function CongestionMeter({ waitMinutes = 0 }) {
  // Compute percentage location across 0 to 60 minutes
  const clamped = Math.max(0, Math.min(60, Number(waitMinutes) || 0));
  const percentage = Math.round((clamped / 60) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
        <span>0m (Minimal)</span>
        <span>10m (Low)</span>
        <span>25m (Moderate)</span>
        <span>45m+ (Critical)</span>
      </div>

      {/* Segmented meter bar */}
      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: '999px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        gap: '2px',
        padding: '1px'
      }}>
        {/* Segment 1: Low (0-10m = 16.7%) */}
        <div style={{ width: '17%', backgroundColor: 'var(--emerald)', opacity: clamped <= 10 ? 1 : 0.65, borderRadius: '999px 0 0 999px' }} />
        {/* Segment 2: Moderate (10-25m = 25%) */}
        <div style={{ width: '25%', backgroundColor: 'var(--amber)', opacity: clamped > 10 && clamped <= 25 ? 1 : 0.65 }} />
        {/* Segment 3: High (25-45m = 33.3%) */}
        <div style={{ width: '33%', backgroundColor: '#f97316', opacity: clamped > 25 && clamped <= 45 ? 1 : 0.65 }} />
        {/* Segment 4: Critical (45m+ = 25%) */}
        <div style={{ width: '25%', backgroundColor: 'var(--rose)', opacity: clamped > 45 ? 1 : 0.65, borderRadius: '0 999px 999px 0' }} />

        {/* Current position needle */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          bottom: '-2px',
          left: `calc(${percentage}% - 3px)`,
          width: '6px',
          backgroundColor: 'var(--text-primary)',
          borderRadius: '2px',
          boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          transition: 'left 0.4s ease'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Queue Load Meter: <strong>{waitMinutes}m calculated delay</strong>
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: clamped < 10 ? 'var(--emerald-text)' : clamped < 25 ? 'var(--amber-text)' : 'var(--rose-text)' }}>
          {clamped < 10 ? 'Optimal Flow' : clamped < 25 ? 'Normal Traffic' : clamped < 45 ? 'Heavy Load' : 'SLA Breach Risk'}
        </span>
      </div>
    </div>
  );
}
