import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Layers, 
  Activity, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import StatCard from '../common/StatCard';
import CongestionBadge from '../common/CongestionBadge';
import CongestionMeter from '../common/CongestionMeter';
import AIInsightCard from '../common/AIInsightCard';
import { fetchDashboardAnalytics } from '../../api';

export default function DashboardView({ onNavigate, currentPrediction }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboardAnalytics();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live or benchmark values
  const currentQueue = currentPrediction?.people_waiting ?? 23;
  const currentWait = currentPrediction?.predicted_waiting_time ?? 47;
  const activeCounters = currentPrediction?.active_counters ?? 2;
  const congestionLevel = currentPrediction?.congestion?.level ?? (currentWait > 35 ? 'High' : currentWait > 20 ? 'Moderate' : 'Low');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {getGreeting()}, Alex
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Here's your current queue overview and real-time operational status.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('forecast')}
          >
            <Calendar size={15} />
            View Day Schedule
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('predict')}
          >
            <Clock size={15} />
            Predict Waiting Time
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="stats-grid-4">
        {/* Current Queue */}
        <StatCard
          label="Current Queue"
          value={currentQueue}
          unit="people"
          icon={Users}
          trend="+4 in last 30m"
          trendType="down" // in queues, increase is caution
          subtitle="Waiting in line"
        />

        {/* Estimated Wait */}
        <StatCard
          label="Estimated Wait"
          value={currentWait}
          unit="min"
          icon={Clock}
          trend={currentWait > 25 ? 'Exceeds SLA' : 'Within Target'}
          trendType={currentWait > 25 ? 'down' : 'up'}
          subtitle="Target SLA < 20 min"
        />

        {/* Active Counters */}
        <StatCard
          label="Active Counters"
          value={activeCounters}
          unit="desks"
          icon={Layers}
          trend="2 of 6 open"
          trendType="neutral"
          subtitle="Capacity utilization: 85%"
        />

        {/* Queue Status */}
        <div className="stat-card-clean">
          <div className="stat-top">
            <span className="stat-label">Queue Status</span>
            <div className="stat-icon">
              <Activity size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '36px' }}>
            <CongestionBadge level={congestionLevel} size="md" />
          </div>
          <div className="stat-bottom">
            <span style={{ color: 'var(--text-muted)' }}>
              {congestionLevel === 'High' ? 'Peak backlog active' : 'Normal queue throughput'}
            </span>
          </div>
        </div>
      </div>

      {/* CURRENT QUEUE STATUS — Large Visual Hero Card */}
      <div className="saas-card" style={{ padding: '28px' }}>
        <div className="card-title-group" style={{ marginBottom: '16px' }}>
          <div>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em',
              display: 'block',
              marginBottom: '4px'
            }}>
              Current Queue Status
            </span>
            <h3 className="card-title">Live Waiting Delay & Congestion Assessment</h3>
          </div>
          <CongestionBadge level={congestionLevel} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '32px',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          {/* Wait time big highlight */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                fontSize: '4.2rem', 
                fontWeight: 800, 
                letterSpacing: '-0.04em',
                lineHeight: 1, 
                fontFeatureSettings: '"tnum"',
                color: congestionLevel === 'High' || congestionLevel === 'Critical' ? 'var(--rose-text)' : congestionLevel === 'Moderate' ? 'var(--amber-text)' : 'var(--emerald-text)'
              }}>
                {currentWait}
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                minutes
              </span>
            </div>

            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '18px' }}>
              Estimated waiting time for incoming customers
            </p>

            <CongestionMeter waitMinutes={currentWait} />
          </div>

          {/* Quick summary stats & action */}
          <div style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Facility Queue Headcount</span>
              <strong style={{ fontSize: '0.92rem' }}>{currentQueue} people</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active Service Counters</span>
              <strong style={{ fontSize: '0.92rem' }}>{activeCounters} Desks Open</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Lowest Wait Window Today</span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--brand-text)' }}>3:00 PM (~18 min)</strong>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('recommendations')}
              style={{ marginTop: '4px', width: '100%' }}
            >
              <TrendingDown size={15} color="var(--emerald)" />
              View Optimal Visiting Times
            </button>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles size={18} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Real-Time AI Operational Insights
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <AIInsightCard
            title="Queue Congestion Acceleration"
            description="Queue congestion is expected to increase over the next 45 minutes as the morning rush peaks between 10:00 AM and 11:30 AM."
            actionText="Inspect Future Forecast"
            onAction={() => onNavigate('forecast')}
          />
          <AIInsightCard
            title="Optimal Window Identified"
            description="3:00 PM currently has the lowest predicted waiting time (~18 min) due to steady counter pace and historical afternoon lulls."
            actionText="View Smart Recommendations"
            onAction={() => onNavigate('recommendations')}
          />
          <AIInsightCard
            title="Counter Optimization Suggestion"
            description="Activating 1 additional service desk during peak hours will reduce average customer wait time from 47 min to approximately 28 min."
            actionText="Review Admin Staffing"
            onAction={() => onNavigate('admin')}
          />
        </div>
      </div>
    </div>
  );
}
