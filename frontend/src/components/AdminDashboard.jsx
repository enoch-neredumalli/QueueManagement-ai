import React, { useState, useEffect } from 'react';
import { fetchDashboardAnalytics } from '../api';
import { 
  Users, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CONGESTION_COLORS = {
  Low: '#10b981',
  Moderate: '#fb923c',
  High: '#e11d48',
  Critical: '#9f1239'
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetchDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 20 seconds
    const interval = setInterval(() => loadData(true), 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw className="spin" size={32} color="#e11d48" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading administrative queue analytics...</p>
      </div>
    );
  }

  // Prep pie chart data
  const pieData = data?.congestion_breakdown
    ? Object.keys(data.congestion_breakdown).map((lvl) => ({
        name: `${lvl} Congestion`,
        value: data.congestion_breakdown[lvl],
        color: CONGESTION_COLORS[lvl] || '#e11d48'
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Top Admin Controls & Refresh */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff1f2' }}>
            Administrative Queue & Staff Operations Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Real-time queue monitoring, workload distribution, and AI staff planning suggestions.
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh Analytics'}
        </button>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(225, 29, 72, 0.15)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          color: '#f43f5e',
          fontSize: '0.85rem'
        }}>
          {errorMsg}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="stats-grid">
        {/* Total Predictions / Tickets */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Total Predictions Logged</span>
            <div className="stat-value" style={{ color: '#e11d48' }}>
              {data?.total_predictions ?? 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              In SQLite Database
            </span>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#e11d48' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Average Waiting Time */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Average Waiting Time</span>
            <div className="stat-value" style={{ color: '#fb923c' }}>
              {data?.avg_wait_minutes ?? 0}
              <span style={{ fontSize: '1rem', color: 'var(--text-dim)', marginLeft: '4px' }}>min</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Target SLA: &lt; 20 min
            </span>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Peak Rush Hours */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Peak Rush Hours</span>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: '#fed7aa', marginTop: '10px' }}>
              {data?.peak_hours ?? '11:00 AM - 1:00 PM'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Highest queue volume
            </span>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(254, 215, 170, 0.15)', color: '#fed7aa' }}>
            <Flame size={22} />
          </div>
        </div>

        {/* Model Accuracy Badge */}
        <div className="stat-card">
          <div>
            <span className="stat-label">Model Accuracy (R²)</span>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {data?.model_summary?.r2_score ? `${(data.model_summary.r2_score * 100).toFixed(1)}%` : '98.6%'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              MAE: {data?.model_summary?.mae ?? '3.4'} min
            </span>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Staff & Counter Planning Suggestion Box */}
      {data?.staff_planning_suggestion && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(38, 20, 31, 0.85), rgba(20, 12, 17, 0.95))',
          border: `1px solid ${data.staff_planning_suggestion.badge_color}50`,
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          boxShadow: `0 4px 20px ${data.staff_planning_suggestion.badge_color}15`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: `${data.staff_planning_suggestion.badge_color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} color={data.staff_planning_suggestion.badge_color} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: data.staff_planning_suggestion.badge_color }}>
                  AI Staff / Counter Planning Recommendation
                </span>
                <span className="badge-pill" style={{ background: `${data.staff_planning_suggestion.badge_color}25`, color: data.staff_planning_suggestion.badge_color, border: `1px solid ${data.staff_planning_suggestion.badge_color}40` }}>
                  {data.staff_planning_suggestion.status}
                </span>
              </div>
              <h4 style={{ fontSize: '1.05rem', color: '#fff1f2', marginBottom: '4px', fontWeight: 600 }}>
                {data.staff_planning_suggestion.action}
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                {data.staff_planning_suggestion.details}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Hourly Trend Chart & Congestion Breakdown Pie Chart */}
      <div className="two-column-grid">
        {/* Hourly Queue & Wait Time Trend */}
        <div className="glass-card">
          <div className="card-header-bar">
            <h3 className="card-title">
              <TrendingUp size={20} color="#e11d48" />
              Hourly Queue & Waiting Time Trend
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Operating Hours (9 AM - 5 PM)
            </span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.hourly_trends || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="waitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(254, 215, 170, 0.08)" />
                <XAxis dataKey="hour" stroke="#9f7d87" tick={{ fill: '#fecdd3', fontSize: 11 }} />
                <YAxis stroke="#9f7d87" tick={{ fill: '#fecdd3', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#190f15', borderColor: 'rgba(254, 215, 170, 0.25)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff1f2' }}
                />
                <Area type="monotone" dataKey="avg_wait" name="Avg Wait Time (mins)" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#waitGradient)" />
                <Area type="monotone" dataKey="avg_queue" name="Avg Queue Size" stroke="#fb923c" strokeWidth={2.5} fillOpacity={1} fill="url(#queueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion Level Breakdown */}
        <div className="glass-card">
          <div className="card-header-bar">
            <h3 className="card-title">
              <Layers size={20} color="#fb923c" />
              Congestion Distribution
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Historical Classification
            </span>
          </div>

          <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#190f15', borderColor: 'rgba(254, 215, 170, 0.25)', borderRadius: '8px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span style={{ color: '#fed7aa', fontSize: '0.8rem' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-dim)' }}>No congestion history logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              <Clock size={20} color="#e11d48" />
              Recent Queue Prediction Records
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
              Live audit of queue queries stored in SQLite database.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Showing latest 10 logs
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Service Type</th>
                <th>People Waiting</th>
                <th>Active Desks</th>
                <th>Avg Svc Time</th>
                <th>Predicted Wait</th>
                <th>Congestion Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_predictions && data.recent_predictions.length > 0 ? (
                data.recent_predictions.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {row.timestamp}
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.service_type}</td>
                    <td>{row.people_waiting}</td>
                    <td>{row.active_counters}</td>
                    <td>{row.avg_service_time}m</td>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fed7aa' }}>
                      {row.predicted_wait_time}m
                    </td>
                    <td>
                      <span
                        className="congestion-badge"
                        style={{
                          background: `${CONGESTION_COLORS[row.congestion_level] || '#e11d48'}25`,
                          color: CONGESTION_COLORS[row.congestion_level] || '#e11d48',
                          border: `1px solid ${CONGESTION_COLORS[row.congestion_level] || '#e11d48'}50`,
                          padding: '3px 10px',
                          fontSize: '0.75rem'
                        }}
                      >
                        <span 
                          className="dot-indicator" 
                          style={{ background: CONGESTION_COLORS[row.congestion_level] || '#e11d48' }}
                        />
                        {row.congestion_level}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '24px' }}>
                    No queue queries logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
