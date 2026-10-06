import React, { useState } from 'react';
import { 
  Menu, 
  MapPin, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export default function Topbar({ 
  onToggleMobileMenu, 
  theme, 
  onToggleTheme, 
  backendOnline, 
  currentLocation, 
  onChangeLocation 
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Peak Rush Alert', desc: 'Predicted delay surges at 11:00 AM (Est. ~48 min wait).', time: '10m ago', unread: true },
    { id: 2, title: 'Staffing Recommendation', desc: 'Consider opening Counter #3 to reduce wait times by 14 min.', time: '25m ago', unread: true },
    { id: 3, title: 'Model Performance Verified', desc: 'Random Forest test accuracy confirmed (R²: 0.9857).', time: '1h ago', unread: false }
  ];

  return (
    <header className="saas-topbar">
      {/* Left Area: Mobile Trigger & Location Selector */}
      <div className="topbar-left">
        <button 
          className="menu-toggle-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        {/* Current Location / Service Center */}
        <div className="location-selector">
          <MapPin size={14} color="var(--brand-primary)" />
          <select
            value={currentLocation}
            onChange={(e) => onChangeLocation(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Central Service Hub - Desk A">Central Service Hub — Desk A</option>
            <option value="North Metro Care Facility">North Metro Care Facility</option>
            <option value="Downtown Financial Service Center">Downtown Financial Service Center</option>
          </select>
        </div>

        {/* Backend Connectivity Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: backendOnline ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
          border: `1px solid ${backendOnline ? 'var(--emerald-border)' : 'var(--rose-border)'}`,
          fontSize: '0.74rem',
          fontWeight: 600,
          color: backendOnline ? 'var(--emerald-text)' : 'var(--rose-text)'
        }}>
          <span className="pulse-dot" style={{ backgroundColor: backendOnline ? 'var(--emerald)' : 'var(--rose)' }} />
          <span>{backendOnline ? 'AI Prediction Engine Active' : 'Connecting to API...'}</span>
        </div>
      </div>

      {/* Right Area: Actions, Theme Toggle & User Avatar */}
      <div className="topbar-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            id="notifications-btn"
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '320px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Operational Alerts</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--brand-text)', fontWeight: 600 }}>2 unread</span>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: n.unread ? 'var(--bg-subtle)' : 'transparent',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{n.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.76rem' }}>{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          id="theme-toggle-btn"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label="Toggle Dark/Light Mode"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Profile Avatar */}
        <div className="user-profile-badge">
          <div className="user-avatar">AC</div>
          <div className="user-meta" style={{ display: 'none' }}>
            <span className="user-name">Alex Chen</span>
            <span className="user-role">Operations Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
}
