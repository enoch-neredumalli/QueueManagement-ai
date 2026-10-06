import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ 
  title = 'Unable to generate prediction', 
  message = 'Please check the queue information and try again.', 
  onRetry = null 
}) {
  return (
    <div style={{
      background: 'var(--rose-subtle)',
      border: '1px solid var(--rose-border)',
      borderRadius: 'var(--radius-md)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--rose-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertCircle size={22} />
        </div>

        <div>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--rose-text)', marginBottom: '2px' }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '7px 14px' }}
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}
