import React from 'react';
import { 
  LayoutDashboard, 
  Timer, 
  LineChart, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  MapPin,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', label: 'Predict Wait', icon: Timer },
  { id: 'forecast', label: 'Future Forecast', icon: LineChart },
  { id: 'analytics', label: 'Queue Analytics', icon: BarChart3 },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'admin', label: 'Admin', icon: ShieldCheck },
];

export default function Sidebar({ activeTab, onSelectTab, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`saas-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <Layers size={18} />
          </div>

          <div className="sidebar-brand-text">
            <span className="brand-name">
              QueueAI
              <span className="brand-badge">SaaS</span>
            </span>
            <span className="brand-tagline">
              Predict. Plan. Avoid the Wait.
            </span>
          </div>

          {mobileOpen && (
            <button 
              onClick={onCloseMobile}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Navigation</div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <Icon size={17} className="nav-item-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info: Facility Location & Engine Status */}
        <div className="sidebar-footer">
          <div className="service-hub-badge">
            <span className="status-dot-pulse" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                Central Service Hub
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Active Facility Node #04
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
