import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  TrendingDown, 
  AlertCircle, 
  ChevronRight,
  Info,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import CongestionBadge from '../common/CongestionBadge';
import { fetchFutureForecast } from '../../api';

export default function RecommendationsView({ onNavigate }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchFutureForecast({
          service_type: 'Cash Transaction',
          avg_service_time: 5.5,
          day_of_week: 'Monday',
          is_holiday: 0,
          active_counters: 3,
          current_queue: 18,
        });
        setForecastData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const bestSlot = forecastData?.best_slot || { time: '3:00 PM', predicted_waiting_time: 18 };

  // Sample alternative slots if dynamic slots are loaded
  const slotsList = forecastData?.forecast_slots ? [
    ...forecastData.forecast_slots.slice(0, 5)
  ] : [
    { time: '3:00 PM', predicted_waiting_time: 18, congestion_level: 'Low', isRecommended: true },
    { time: '2:00 PM', predicted_waiting_time: 27, congestion_level: 'Moderate', isRecommended: false },
    { time: '4:00 PM', predicted_waiting_time: 31, congestion_level: 'Moderate', isRecommended: false },
    { time: '9:00 AM', predicted_waiting_time: 35, congestion_level: 'Moderate', isRecommended: false },
    { time: '11:00 AM', predicted_waiting_time: 58, congestion_level: 'High', isRecommended: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Smart Visit Recommendations
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          AI-powered schedule optimization to minimize waiting in line and avoid peak congestion windows.
        </p>
      </div>

      {/* Primary Hero Recommendation Card */}
      <div className="saas-card" style={{
        padding: '32px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--emerald-border)',
        borderLeft: '6px solid var(--emerald)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-pill" style={{ backgroundColor: 'var(--emerald-subtle)', color: 'var(--emerald-text)', border: '1px solid var(--emerald-border)' }}>
                Optimal Visiting Window
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Today's Best Recommendation
              </span>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Best Time to Visit
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '4px' }}>
                <span style={{ fontSize: '3.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {bestSlot.time}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--emerald-text)' }}>
                  {bestSlot.predicted_waiting_time} min expected wait
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '620px', marginTop: '12px' }}>
              This time slot features the lowest projected customer volume and balanced counter staffing, reducing your wait time by up to <strong>40 minutes</strong> compared to peak rush hours.
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            minWidth: '220px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Congestion Level</span>
              <CongestionBadge level="Low" size="sm" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Est. Line Ahead</span>
              <strong>~8 people</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Counters</span>
              <strong>3 Desks</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Alternative Slots & "Why this time?" Explanation */}
      <div className="grid-2">
        {/* Alternative Time Slots Table / Card List */}
        <div className="saas-card">
          <div className="card-title-group" style={{ marginBottom: '16px' }}>
            <h3 className="card-title">
              <Clock size={18} color="var(--brand-primary)" />
              Alternative Time Slots
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Compare Expected Delays
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {slotsList.map((slot, idx) => {
              const isBest = slot.time === bestSlot.time || slot.isRecommended;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isBest ? 'var(--emerald-subtle)' : 'var(--bg-subtle)',
                    border: `1px solid ${isBest ? 'var(--emerald-border)' : 'var(--border-subtle)'}`,
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isBest ? (
                      <CheckCircle2 size={18} color="var(--emerald)" />
                    ) : (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-dim)' }} />
                    )}
                    <div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isBest ? 'var(--emerald-text)' : 'var(--text-primary)' }}>
                        {slot.time}
                      </span>
                      {isBest && (
                        <span style={{ marginLeft: '8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald-text)', textTransform: 'uppercase' }}>
                          (Recommended)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isBest ? 'var(--emerald-text)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {slot.predicted_waiting_time} min
                    </span>
                    <CongestionBadge level={slot.congestion_level || (slot.predicted_waiting_time > 35 ? 'High' : 'Moderate')} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* "Why this time?" Deep Dive Card */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title-group" style={{ marginBottom: '16px' }}>
              <h3 className="card-title">
                <Info size={18} color="var(--brand-primary)" />
                Why this time?
              </h3>
              <span className="brand-badge">QueueAI Analytics</span>
            </div>

            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              "Based on current queue size, service rate, historical patterns, and predicted congestion."
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Post-Lunch Demand Dip:</strong> Customer arrival frequency typically drops by 45% between 2:30 PM and 3:45 PM before the late afternoon rush.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Full Counter Throughput:</strong> Operational staff shifts are fully staffed with 3 active desks, maintaining a high service rate capacity of ~11 customers/hour.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Zero Ticket Backlog:</strong> The morning ticket backlog clears around 2:00 PM, resulting in immediate counter dispatch without waiting delays.
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Need immediate service now?
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('predict')}
              style={{ fontSize: '0.82rem' }}
            >
              Check Current Wait
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
