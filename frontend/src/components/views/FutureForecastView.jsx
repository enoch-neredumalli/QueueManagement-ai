import React, { useState, useEffect } from 'react';
import { 
  LineChart as LineChartIcon, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  TrendingDown,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceDot
} from 'recharts';
import CongestionBadge from '../common/CongestionBadge';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import { fetchFutureForecast } from '../../api';

export default function FutureForecastView({ onNavigate }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeCounters, setActiveCounters] = useState(3);
  const [serviceType, setServiceType] = useState('Cash Transaction');

  const loadForecast = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchFutureForecast({
        service_type: serviceType,
        avg_service_time: 5.5,
        day_of_week: 'Monday',
        is_holiday: 0,
        active_counters: parseInt(activeCounters, 10),
        current_queue: 18,
      });
      setForecast(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Unable to retrieve future queue forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [activeCounters, serviceType]);

  const bestSlot = forecast?.best_slot || { time: '3:00 PM', predicted_waiting_time: 18 };

  // Custom Chart Tooltip
  const CustomForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'var(--chart-tooltip-bg)',
          color: 'var(--chart-tooltip-text)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.82rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            {label} Time Window
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', color: '#93c5fd' }}>
            <span>Predicted Delay:</span>
            <strong>{item.predicted_waiting_time} min</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', color: '#cbd5e1' }}>
            <span>Estimated Queue:</span>
            <span>~{item.estimated_queue} people</span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.75rem', fontWeight: 600, color: item.color || '#38bdf8' }}>
            {item.congestion_level} Congestion
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Future Queue Forecast
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            See how waiting times are expected to change throughout the day based on historical arrival profiles.
          </p>
        </div>

        {/* Counter Simulator Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Layers size={14} />
            <span>Simulate Active Desks:</span>
          </div>
          <select
            value={activeCounters}
            onChange={(e) => setActiveCounters(Number(e.target.value))}
            className="control-select"
            style={{ width: '130px', padding: '6px 10px', fontSize: '0.82rem' }}
          >
            <option value={1}>1 Counter</option>
            <option value={2}>2 Counters</option>
            <option value={3}>3 Counters</option>
            <option value={4}>4 Counters</option>
            <option value={5}>5 Counters</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={loadForecast}
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={13} />
            Recalculate
          </button>
        </div>
      </div>

      {errorMsg && (
        <ErrorState
          title="Forecasting Engine Interruption"
          message={errorMsg}
          onRetry={loadForecast}
        />
      )}

      {/* Main Chart Card */}
      <div className="saas-card" style={{ padding: '26px' }}>
        <div className="card-title-group" style={{ marginBottom: '16px' }}>
          <div>
            <h3 className="card-title">
              <LineChartIcon size={18} color="var(--brand-primary)" />
              Daily Waiting Time Projection (9:00 AM – 5:00 PM)
            </h3>
            <span className="card-subtitle">
              Calculated using Poisson-distributed customer arrival rates and multi-server service capacities
            </span>
          </div>

          {bestSlot && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--emerald-subtle)',
              border: '1px solid var(--emerald-border)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--emerald-text)'
            }}>
              <CheckCircle2 size={15} />
              <span>Lowest Delay: <strong>{bestSlot.time} ({bestSlot.predicted_waiting_time}m)</strong></span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingState message="Projecting hourly queue patterns..." />
          </div>
        ) : forecast?.forecast_slots ? (
          <>
            <div style={{ width: '100%', height: 340, marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={forecast.forecast_slots}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                    unit="m"
                  />
                  <Tooltip content={<CustomForecastTooltip />} />

                  {/* Subtle bar background indicator */}
                  <Bar 
                    dataKey="predicted_waiting_time" 
                    name="Wait Time" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {forecast.forecast_slots.map((entry, idx) => {
                      const isBest = entry.time === bestSlot.time;
                      return (
                        <Cell
                          key={`cell-${idx}`}
                          fill={isBest ? 'var(--emerald)' : entry.predicted_waiting_time > 35 ? 'var(--rose)' : 'var(--brand-primary)'}
                          opacity={isBest ? 0.9 : 0.25}
                        />
                      );
                    })}
                  </Bar>

                  {/* Smooth line */}
                  <Line 
                    type="monotone" 
                    dataKey="predicted_waiting_time" 
                    stroke="var(--brand-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--bg-surface)', stroke: 'var(--brand-primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 7, fill: 'var(--brand-primary)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* RECOMMENDED TIME CARD BELOW CHART */}
            <div style={{
              marginTop: '28px',
              padding: '24px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--emerald-border)',
              borderLeft: '5px solid var(--emerald)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald-text)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>
                  RECOMMENDED TIME
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {bestSlot.time}
                  </span>
                  <span style={{ fontSize: '1.05rem', color: 'var(--emerald-text)', fontWeight: 600 }}>
                    Expected Wait: {bestSlot.predicted_waiting_time} minutes
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  Best time to visit based on current predictions and historical turnaround times.
                </p>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => onNavigate('recommendations')}
              >
                View Recommendation
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Hourly Schedule Grid Breakdown */}
      {forecast?.forecast_slots && (
        <div className="saas-card">
          <div className="card-title-group" style={{ marginBottom: '16px' }}>
            <h3 className="card-title">Hourly Breakdown Overview</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              9 Business Slots
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {forecast.forecast_slots.map((slot) => {
              const isBest = slot.time === bestSlot.time;
              return (
                <div
                  key={slot.time}
                  style={{
                    backgroundColor: isBest ? 'var(--emerald-subtle)' : 'var(--bg-subtle)',
                    border: `1px solid ${isBest ? 'var(--emerald-border)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 10px',
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
                      backgroundColor: 'var(--emerald)',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      Lowest
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>
                    {slot.time}
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isBest ? 'var(--emerald-text)' : 'var(--text-primary)', margin: '4px 0' }}>
                    {slot.predicted_waiting_time}m
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                    ~{slot.estimated_queue} in queue
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
