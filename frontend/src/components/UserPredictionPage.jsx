import React, { useState, useEffect } from 'react';
import { 
  predictQueueTime, 
  fetchFutureForecast 
} from '../api';
import { 
  Clock, 
  Users, 
  Layers, 
  Calendar, 
  Sparkles, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const SERVICE_OPTIONS = [
  { value: 'General Inquiry', label: 'General Inquiry', defaultTime: 3.5, desc: 'Quick tokens, form submissions' },
  { value: 'Cash Transaction', label: 'Cash Deposit / Withdrawal', defaultTime: 5.5, desc: 'Teller cash counting & issuance' },
  { value: 'Document Verification', label: 'Document Verification', defaultTime: 8.0, desc: 'KYC check, attested certificates' },
  { value: 'Account Opening', label: 'Account Opening', defaultTime: 14.0, desc: 'Data enrollment, digital signing' },
  { value: 'Loan Consultation', label: 'Loan Consultation', defaultTime: 20.0, desc: 'Advisory, eligibility profiling' },
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function UserPredictionPage() {
  // Form State
  const [serviceType, setServiceType] = useState('Cash Transaction');
  const [peopleWaiting, setPeopleWaiting] = useState(14);
  const [activeCounters, setActiveCounters] = useState(3);
  const [avgServiceTime, setAvgServiceTime] = useState(5.5);
  const [hourOfDay, setHourOfDay] = useState(11);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [isHoliday, setIsHoliday] = useState(false);

  // Results State
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Update default service time when service type changes
  const handleServiceChange = (e) => {
    const selected = e.target.value;
    setServiceType(selected);
    const found = SERVICE_OPTIONS.find((s) => s.value === selected);
    if (found) {
      setAvgServiceTime(found.defaultTime);
    }
  };

  // Run initial prediction on load
  useEffect(() => {
    handlePredict();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        service_type: serviceType,
        people_waiting: parseInt(peopleWaiting, 10),
        active_counters: parseInt(activeCounters, 10),
        avg_service_time: parseFloat(avgServiceTime),
        hour_of_day: parseInt(hourOfDay, 10),
        day_of_week: dayOfWeek,
        is_holiday: isHoliday ? 1 : 0,
      };

      // 1. Fetch real-time prediction
      const pred = await predictQueueTime(payload);
      setPredictionResult(pred);

      // 2. Fetch future 9 AM - 5 PM slot forecast
      const forecast = await fetchFutureForecast({
        service_type: serviceType,
        avg_service_time: parseFloat(avgServiceTime),
        day_of_week: dayOfWeek,
        is_holiday: isHoliday ? 1 : 0,
        active_counters: parseInt(activeCounters, 10),
        current_queue: parseInt(peopleWaiting, 10),
      });
      setForecastData(forecast);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with prediction server.');
    } finally {
      setLoading(false);
    }
  };

  // Custom chart tooltip with Crimson & Peach styling
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: '#190f15',
          border: '1px solid rgba(254, 215, 170, 0.3)',
          borderRadius: '8px',
          padding: '12px 14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          fontSize: '0.85rem'
        }}>
          <p style={{ fontWeight: 700, color: '#fed7aa', marginBottom: '6px' }}>{label}</p>
          <p style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Predicted Wait:</span>
            <strong>{data.predicted_waiting_time} mins</strong>
          </p>
          <p style={{ color: '#fecdd3', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Estimated Queue:</span>
            <strong>{data.estimated_queue} people</strong>
          </p>
          <p style={{ color: data.color || '#fb923c', marginTop: '4px', fontWeight: 600 }}>
            {data.congestion_level} Congestion
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Overview */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(38, 20, 31, 0.8), rgba(20, 12, 17, 0.95))',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff1f2', marginBottom: '4px' }}>
            Queue Wait-Time Forecaster & Smart Scheduler
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time machine learning prediction using multi-server queue dynamics and temporal patterns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge-pill badge-crimson" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} /> Random Forest Regressor
          </span>
          <span className="badge-pill badge-peach">
            Software-Only Prototype
          </span>
        </div>
      </div>

      {/* Main Grid: Input Form (Left) & Prediction Output (Right) */}
      <div className="two-column-grid">
        {/* Left Column: Form */}
        <div className="glass-card">
          <div className="card-header-bar">
            <h3 className="card-title">
              <Clock size={20} color="#e11d48" />
              Queue Parameters
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Manual Input Data
            </span>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid rgba(225, 29, 72, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              color: '#f43f5e',
              fontSize: '0.85rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePredict}>
            <div className="form-grid" style={{ marginBottom: '18px' }}>
              {/* Service Type */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" htmlFor="service-type-select">
                  <span>Service Type</span>
                  <span className="hint">Affects average transaction length</span>
                </label>
                <select
                  id="service-type-select"
                  className="form-select"
                  value={serviceType}
                  onChange={handleServiceChange}
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} (~{opt.defaultTime} mins)
                    </option>
                  ))}
                </select>
              </div>

              {/* People Waiting */}
              <div className="form-group">
                <label className="form-label" htmlFor="people-waiting-input">
                  <span>People Waiting</span>
                  <span className="hint">{peopleWaiting} persons in line</span>
                </label>
                <input
                  id="people-waiting-input"
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  value={peopleWaiting}
                  onChange={(e) => setPeopleWaiting(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                />
              </div>

              {/* Active Counters */}
              <div className="form-group">
                <label className="form-label" htmlFor="active-counters-input">
                  <span>Active Counters</span>
                  <span className="hint">{activeCounters} desks open</span>
                </label>
                <input
                  id="active-counters-input"
                  type="number"
                  min="1"
                  max="12"
                  className="form-input"
                  value={activeCounters}
                  onChange={(e) => setActiveCounters(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>

              {/* Average Service Time */}
              <div className="form-group">
                <label className="form-label" htmlFor="avg-service-time-input">
                  <span>Avg Service Time (mins)</span>
                  <span className="hint">Per customer</span>
                </label>
                <input
                  id="avg-service-time-input"
                  type="number"
                  step="0.5"
                  min="1"
                  max="45"
                  className="form-input"
                  value={avgServiceTime}
                  onChange={(e) => setAvgServiceTime(Math.max(1.0, parseFloat(e.target.value) || 1.0))}
                  required
                />
              </div>

              {/* Current Time / Hour */}
              <div className="form-group">
                <label className="form-label" htmlFor="hour-of-day-select">
                  <span>Current Time / Hour</span>
                  <span className="hint">Service schedule</span>
                </label>
                <select
                  id="hour-of-day-select"
                  className="form-select"
                  value={hourOfDay}
                  onChange={(e) => setHourOfDay(parseInt(e.target.value, 10))}
                >
                  <option value={9}>9:00 AM (Opening)</option>
                  <option value={10}>10:00 AM (Morning Rush)</option>
                  <option value={11}>11:00 AM (Peak Rush)</option>
                  <option value={12}>12:00 PM (Midday)</option>
                  <option value={13}>1:00 PM (Lunch Surge)</option>
                  <option value={14}>2:00 PM (Afternoon)</option>
                  <option value={15}>3:00 PM (Lull Window)</option>
                  <option value={16}>4:00 PM (Late Session)</option>
                  <option value={17}>5:00 PM (Closing Rush)</option>
                </select>
              </div>

              {/* Day of the week */}
              <div className="form-group">
                <label className="form-label" htmlFor="day-of-week-select">
                  <span>Day of Week</span>
                  <span className="hint">Volume factor</span>
                </label>
                <select
                  id="day-of-week-select"
                  className="form-select"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Holiday Toggle */}
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <label className="form-label">
                  <span>Holiday / Special Day</span>
                </label>
                <label className="checkbox-toggle-wrapper">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.88rem', color: isHoliday ? '#fb923c' : 'var(--text-muted)' }}>
                    {isHoliday ? 'Holiday Schedule Active' : 'Standard Working Day'}
                  </span>
                </label>
              </div>
            </div>

            <button
              id="predict-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <>Calculating AI Prediction...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  Predict Waiting Time
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Prediction Results & Optimization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {predictionResult ? (
            <>
              {/* Primary Wait Time Card */}
              <div 
                className="hero-wait-box"
                style={{ 
                  '--hero-glow': predictionResult.congestion.color,
                  borderColor: `${predictionResult.congestion.color}55`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--peach-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Predicted Waiting Time
                  </span>
                  <div
                    className="congestion-badge"
                    style={{
                      background: `${predictionResult.congestion.color}25`,
                      color: predictionResult.congestion.color,
                      border: `1px solid ${predictionResult.congestion.color}60`
                    }}
                  >
                    <span 
                      className="dot-indicator" 
                      style={{ background: predictionResult.congestion.color }}
                    />
                    {predictionResult.congestion.level} Congestion
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span 
                    id="predicted-wait-value"
                    className="hero-wait-number"
                    style={{ color: '#fff1f2' }}
                  >
                    {predictionResult.predicted_waiting_time}
                  </span>
                  <span className="hero-wait-unit">minutes</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {predictionResult.congestion.description}
                </p>

                {/* Sub metrics strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(254, 215, 170, 0.1)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Current Queue</span>
                    <strong style={{ fontSize: '1.05rem', color: '#fed7aa' }}>{predictionResult.people_waiting} people</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Active Counters</span>
                    <strong style={{ fontSize: '1.05rem', color: '#fed7aa' }}>{predictionResult.active_counters} desks</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Service Pace</span>
                    <strong style={{ fontSize: '1.05rem', color: '#fed7aa' }}>~{predictionResult.avg_service_time} m/person</strong>
                  </div>
                </div>
              </div>

              {/* Best Recommended Future Visiting Time Banner */}
              {predictionResult.recommended_future_slot && (
                <div className="recommend-banner">
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(251, 146, 60, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <TrendingDown size={22} color="#fb923c" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: '#fed7aa' }}>
                        Recommended Future Visiting Time
                      </span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#fff1f2', margin: 0 }}>
                      Visit at <strong style={{ color: '#fed7aa' }}>{predictionResult.recommended_future_slot.time}</strong> with estimated wait of just{' '}
                      <strong style={{ color: '#fb923c' }}>{predictionResult.recommended_future_slot.predicted_waiting_time} minutes</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Service Counter Staffing Suggestion Card */}
              {predictionResult.counter_recommendation && (
                <div className="glass-card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Layers size={18} color="#fb923c" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff1f2' }}>
                      Service Counter Optimization
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {predictionResult.counter_recommendation.impact_summary}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    <span>Current: <strong style={{ color: '#fed7aa' }}>{predictionResult.counter_recommendation.current_counters} desks</strong></span>
                    <ArrowRight size={14} style={{ alignSelf: 'center', color: '#e11d48' }} />
                    <span>Suggested: <strong style={{ color: '#f43f5e' }}>{predictionResult.counter_recommendation.suggested_counters} desks</strong></span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.5, color: '#e11d48' }} />
                <p>Click "Predict Waiting Time" to run machine learning estimation.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FUTURE FORECAST: 9 AM to 5 PM Line/Bar Chart Section */}
      <div className="glass-card">
        <div className="card-header-bar">
          <div>
            <h3 className="card-title">
              <BarChart3 size={20} color="#e11d48" />
              Future Queue Delay Forecast (9:00 AM - 5:00 PM)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
              Hourly projection of expected waiting times based on historical queue arrival patterns.
            </p>
          </div>

          {forecastData?.best_slot && (
            <div style={{
              background: 'rgba(251, 146, 60, 0.18)',
              border: '1px solid rgba(251, 146, 60, 0.45)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              fontSize: '0.82rem',
              color: '#fed7aa',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={16} color="#fb923c" />
              Lowest Wait Slot: <strong>{forecastData.best_slot.time} ({forecastData.best_slot.predicted_waiting_time}m)</strong>
            </div>
          )}
        </div>

        {forecastData?.forecast_slots ? (
          <div>
            <div style={{ width: '100%', height: 320, marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={forecastData.forecast_slots}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(254, 215, 170, 0.08)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9f7d87" 
                    tick={{ fill: '#fecdd3', fontSize: 12 }} 
                  />
                  <YAxis 
                    stroke="#9f7d87" 
                    tick={{ fill: '#fecdd3', fontSize: 12 }}
                    unit="m"
                  />
                  <Tooltip content={<CustomForecastTooltip />} />
                  <Bar 
                    dataKey="predicted_waiting_time" 
                    name="Wait Time (mins)"
                    radius={[6, 6, 0, 0]}
                  >
                    {forecastData.forecast_slots.map((entry, index) => {
                      const isBest = entry.time === forecastData.best_slot.time;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isBest ? '#fb923c' : entry.predicted_waiting_time > 35 ? '#be123c' : '#e11d48'} 
                          stroke={isBest ? '#fed7aa' : 'transparent'}
                          strokeWidth={isBest ? 2 : 0}
                        />
                      );
                    })}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="predicted_waiting_time" 
                    stroke="#fed7aa" 
                    strokeWidth={2.5}
                    dot={{ fill: '#e11d48', r: 4, stroke: '#fed7aa', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#fb923c' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Time Slot Cards Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '12px',
              marginTop: '20px'
            }}>
              {forecastData.forecast_slots.map((slot) => {
                const isBest = slot.time === forecastData.best_slot.time;
                return (
                  <div
                    key={slot.time}
                    style={{
                      background: isBest ? 'rgba(251, 146, 60, 0.16)' : 'rgba(255, 255, 255, 0.02)',
                      border: isBest ? '1px solid rgba(251, 146, 60, 0.6)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 10px',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {isBest && (
                      <span style={{
                        position: 'absolute',
                        top: '-9px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#e11d48',
                        color: '#ffedd5',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        border: '1px solid #fb923c'
                      }}>
                        Best Slot
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: isBest ? '#fed7aa' : 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                      {slot.time}
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: isBest ? '#fb923c' : '#fff1f2', fontFamily: 'var(--font-mono)' }}>
                      {slot.predicted_waiting_time}m
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>
                      ~{slot.estimated_queue} in line
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading future slot forecasting...
          </div>
        )}
      </div>
    </div>
  );
}
