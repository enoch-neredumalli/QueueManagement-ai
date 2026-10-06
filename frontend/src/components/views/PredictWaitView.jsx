import React, { useState } from 'react';
import { 
  Clock, 
  Sparkles, 
  Users, 
  Layers, 
  ArrowRight, 
  Calendar, 
  Info,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import CongestionBadge from '../common/CongestionBadge';
import CongestionMeter from '../common/CongestionMeter';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import { predictQueueTime, fetchFutureForecast } from '../../api';

const SERVICE_OPTIONS = [
  { value: 'General Inquiry', label: 'General Inquiry', defaultTime: 3.5, desc: 'Quick tokens & status queries' },
  { value: 'Cash Transaction', label: 'Cash Deposit / Withdrawal', defaultTime: 5.5, desc: 'Teller counting & payment receipt' },
  { value: 'Document Verification', label: 'Document Verification', defaultTime: 8.0, desc: 'KYC check & attested approvals' },
  { value: 'Account Opening', label: 'Account Opening', defaultTime: 14.0, desc: 'Biometric capture & documentation' },
  { value: 'Loan Consultation', label: 'Loan Consultation', defaultTime: 20.0, desc: 'Underwriting & advisory profiling' },
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function PredictWaitView({ onPredictionUpdated, onNavigate }) {
  // Form Inputs
  const [serviceType, setServiceType] = useState('Cash Transaction');
  const [peopleWaiting, setPeopleWaiting] = useState(23);
  const [activeCounters, setActiveCounters] = useState(2);
  const [avgServiceTime, setAvgServiceTime] = useState(5.5);
  const [hourOfDay, setHourOfDay] = useState(11);
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [isHoliday, setIsHoliday] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [result, setResult] = useState(null);

  const handleServiceChange = (e) => {
    const selected = e.target.value;
    setServiceType(selected);
    const found = SERVICE_OPTIONS.find((s) => s.value === selected);
    if (found) {
      setAvgServiceTime(found.defaultTime);
    }
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

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

      const pred = await predictQueueTime(payload);
      setResult(pred);
      if (onPredictionUpdated) {
        onPredictionUpdated(pred);
      }
    } catch (err) {
      console.error('Prediction failed:', err);
      setErrorMsg('Unable to generate prediction. Please check the queue information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Predict Your Waiting Time
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
          Enter the current queue information to estimate your waiting time using Machine Learning.
        </p>
      </div>

      {errorMsg && (
        <ErrorState 
          title="Prediction Engine Unavailable"
          message={errorMsg}
          onRetry={handlePredict}
        />
      )}

      {/* Main Grid: Form (Left) & Results (Right) */}
      <div className="grid-2">
        {/* Form Card */}
        <div className="saas-card">
          <div className="card-title-group">
            <h3 className="card-title">
              <Clock size={18} color="var(--brand-primary)" />
              Queue Input Parameters
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Step 1 of 2
            </span>
          </div>

          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Service Type */}
            <div className="form-control-group">
              <label className="control-label" htmlFor="service-type-field">
                <span>Service Type</span>
                <span className="control-helper">Transaction complexity</span>
              </label>
              <select
                id="service-type-field"
                className="control-select"
                value={serviceType}
                onChange={handleServiceChange}
              >
                {SERVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} (~{opt.defaultTime}m base turnaround)
                  </option>
                ))}
              </select>
            </div>

            {/* People Waiting & Range Slider */}
            <div className="form-control-group">
              <div className="control-label">
                <label htmlFor="people-waiting-field">People Waiting</label>
                <span style={{ fontWeight: 600, color: 'var(--brand-text)' }}>
                  {peopleWaiting} customers ahead
                </span>
              </div>
              <input
                id="people-waiting-field"
                type="number"
                min="0"
                max="80"
                className="control-input"
                value={peopleWaiting}
                onChange={(e) => setPeopleWaiting(Math.max(0, parseInt(e.target.value) || 0))}
                required
              />
              <input
                type="range"
                min="0"
                max="60"
                value={peopleWaiting}
                onChange={(e) => setPeopleWaiting(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)', marginTop: '4px' }}
              />
            </div>

            {/* Active Counters & Avg Service Time Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-control-group">
                <label className="control-label" htmlFor="active-counters-field">
                  <span>Active Counters</span>
                </label>
                <input
                  id="active-counters-field"
                  type="number"
                  min="1"
                  max="12"
                  className="control-input"
                  value={activeCounters}
                  onChange={(e) => setActiveCounters(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
              </div>

              <div className="form-control-group">
                <label className="control-label" htmlFor="avg-time-field">
                  <span>Avg Service Time (min)</span>
                </label>
                <input
                  id="avg-time-field"
                  type="number"
                  step="0.5"
                  min="1"
                  max="45"
                  className="control-input"
                  value={avgServiceTime}
                  onChange={(e) => setAvgServiceTime(Math.max(1.0, parseFloat(e.target.value) || 1.0))}
                  required
                />
              </div>
            </div>

            {/* Time of Day & Day of Week Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-control-group">
                <label className="control-label" htmlFor="hour-select">
                  <span>Current Time</span>
                </label>
                <select
                  id="hour-select"
                  className="control-select"
                  value={hourOfDay}
                  onChange={(e) => setHourOfDay(parseInt(e.target.value, 10))}
                >
                  <option value={9}>9:00 AM (Opening)</option>
                  <option value={10}>10:00 AM (Morning Surge)</option>
                  <option value={11}>11:00 AM (Peak Rush)</option>
                  <option value={12}>12:00 PM (Midday)</option>
                  <option value={13}>1:00 PM (Lunch Rush)</option>
                  <option value={14}>2:00 PM (Afternoon)</option>
                  <option value={15}>3:00 PM (Lull Window)</option>
                  <option value={16}>4:00 PM (Late Shift)</option>
                  <option value={17}>5:00 PM (Closing Shift)</option>
                </select>
              </div>

              <div className="form-control-group">
                <label className="control-label" htmlFor="day-select">
                  <span>Day of Week</span>
                </label>
                <select
                  id="day-select"
                  className="control-select"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Holiday Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>Holiday Schedule</span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Special staffing or surge adjustments</span>
              </div>
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
            </div>

            {/* Submit Button */}
            <button
              id="btn-predict-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '6px' }}
            >
              {loading ? (
                <>Analyzing queue conditions...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  Predict Waiting Time
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div>
          {loading ? (
            <div className="saas-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
              <LoadingState message="Analyzing queue conditions..." />
            </div>
          ) : result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Premium Result Card */}
              <div className="saas-card" style={{ padding: '28px', borderTop: '4px solid var(--brand-primary)' }}>
                <div className="card-title-group" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Prediction Output
                  </span>
                  <CongestionBadge level={result.congestion?.level || 'Moderate'} />
                </div>

                {/* Estimated wait large display */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ESTIMATED WAIT
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '3.8rem', 
                      fontWeight: 800, 
                      letterSpacing: '-0.04em',
                      lineHeight: 1.1,
                      fontFeatureSettings: '"tnum"',
                      color: result.predicted_waiting_time > 35 ? 'var(--rose-text)' : result.predicted_waiting_time > 20 ? 'var(--amber-text)' : 'var(--emerald-text)'
                    }}>
                      {result.predicted_waiting_time}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      minutes
                    </span>
                  </div>
                </div>

                {/* Meter bar */}
                <CongestionMeter waitMinutes={result.predicted_waiting_time} />

                {/* Detailed breakdown strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginTop: '22px',
                  paddingTop: '18px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      CONGESTION
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {result.congestion?.level?.toUpperCase() || 'MODERATE'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      CURRENT QUEUE
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {result.people_waiting} people
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      ACTIVE COUNTERS
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {result.active_counters} desks
                    </strong>
                  </div>
                </div>
              </div>

              {/* Service Counter Staffing Recommendation */}
              {result.counter_recommendation && (
                <div className="saas-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Layers size={18} color="var(--brand-primary)" />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Staffing & Counter Optimization</h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {result.counter_recommendation.impact_summary}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Current: <strong>{result.counter_recommendation.current_counters} desks</strong></span>
                    <ArrowRight size={13} />
                    <span>Suggested: <strong style={{ color: 'var(--brand-text)' }}>{result.counter_recommendation.suggested_counters} desks</strong></span>
                  </div>
                </div>
              )}

              {/* Recommended visiting time link banner */}
              {result.recommended_future_slot && (
                <div style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--emerald-border)',
                  borderLeft: '4px solid var(--emerald)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TrendingDown size={20} color="var(--emerald)" />
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--emerald-text)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                        Recommended Time Slot
                      </span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Visit around <strong>{result.recommended_future_slot.time}</strong> (~{result.recommended_future_slot.predicted_waiting_time} min wait)
                      </span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => onNavigate('recommendations')}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="saas-card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
              textAlign: 'center',
              padding: '40px 24px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--text-dim)'
              }}>
                <Clock size={28} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No prediction generated yet
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto 16px' }}>
                Enter the current queue parameters on the left and click "Predict Waiting Time" to compute the estimated wait.
              </p>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handlePredict}
              >
                Run Default Prediction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
