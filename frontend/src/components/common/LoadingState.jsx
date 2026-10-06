import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function LoadingState({ message = 'Analyzing queue conditions...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '14px',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Loader2 size={36} className="spin" color="var(--brand-primary)" />
        <Sparkles size={14} color="var(--brand-primary)" style={{ position: 'absolute' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {message}
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Evaluating multi-server kinetics & Random Forest regression
        </p>
      </div>
    </div>
  );
}
