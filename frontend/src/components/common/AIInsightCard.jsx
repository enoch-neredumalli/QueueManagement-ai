import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIInsightCard({ 
  title, 
  description, 
  icon: Icon = Sparkles,
  tag = 'QueueAI Engine',
  actionText = null,
  onAction = null
}) {
  return (
    <div className="ai-insight-box">
      <div className="ai-insight-icon">
        <Icon size={18} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <h4 className="ai-insight-title">{title}</h4>
          {tag && (
            <span style={{ 
              fontSize: '0.68rem', 
              fontWeight: 700, 
              color: 'var(--brand-text)', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {tag}
            </span>
          )}
        </div>

        <p className="ai-insight-desc">{description}</p>

        {actionText && (
          <button 
            onClick={onAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--brand-text)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginTop: '6px'
            }}
          >
            {actionText} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
