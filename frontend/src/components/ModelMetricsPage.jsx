import React, { useState, useEffect } from 'react';
import { fetchModelMetrics } from '../api';
import { 
  ShieldCheck, 
  BarChart2, 
  Database, 
  Cpu, 
  FileCheck, 
  Layers,
  HelpCircle,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function ModelMetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetchModelMetrics();
        setMetrics(res);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to fetch model metrics');
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Activity className="spin" size={32} color="#e11d48" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Retrieving machine learning validation metrics...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass-card" style={{ padding: '30px', color: '#f43f5e' }}>
        Failed to load metrics: {errorMsg}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Overview Banner */}
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
            Machine Learning Evaluation & Model Transparency
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Authentic performance statistics evaluated on held-out test data ({metrics?.test_samples} unseen samples).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge-pill badge-crimson">Scikit-Learn 1.9.1</span>
          <span className="badge-pill badge-peach">
            120 Estimator Ensembles
          </span>
        </div>
      </div>

      {/* Primary 3 Evaluation Metrics */}
      <div className="stats-grid">
        {/* MAE */}
        <div className="stat-card" style={{ borderColor: 'rgba(225, 29, 72, 0.4)' }}>
          <div>
            <span className="stat-label">Mean Absolute Error (MAE)</span>
            <div className="stat-value" style={{ color: '#e11d48' }}>
              {metrics?.mae} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>mins</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Average prediction discrepancy across all test queues
            </p>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#e11d48' }}>
            <Activity size={22} />
          </div>
        </div>

        {/* RMSE */}
        <div className="stat-card" style={{ borderColor: 'rgba(251, 146, 60, 0.4)' }}>
          <div>
            <span className="stat-label">Root Mean Squared Error (RMSE)</span>
            <div className="stat-value" style={{ color: '#fb923c' }}>
              {metrics?.rmse} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>mins</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Penalizes extreme outliers and queue surge variance
            </p>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* R² Score */}
        <div className="stat-card" style={{ borderColor: 'rgba(254, 215, 170, 0.4)' }}>
          <div>
            <span className="stat-label">Coefficient of Determination (R²)</span>
            <div className="stat-value" style={{ color: '#fed7aa' }}>
              {metrics?.r2_score}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Explains {((metrics?.r2_score || 0) * 100).toFixed(2)}% of queue variance
            </p>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(254, 215, 170, 0.15)', color: '#fed7aa' }}>
            <BarChart2 size={22} />
          </div>
        </div>

        {/* Dataset Breakdown */}
        <div className="stat-card" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <div>
            <span className="stat-label">Dataset Split</span>
            <div className="stat-value" style={{ fontSize: '1.3rem', color: '#fff1f2', marginTop: '10px' }}>
              {metrics?.train_samples} / {metrics?.test_samples}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              80% Train, 20% Test ({metrics?.dataset_size} total records)
            </p>
          </div>
          <div className="stat-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
            <Database size={22} />
          </div>
        </div>
      </div>

      {/* Feature Importances & Architecture */}
      <div className="two-column-grid">
        {/* Feature Importances Chart */}
        <div className="glass-card">
          <div className="card-header-bar">
            <h3 className="card-title">
              <Cpu size={20} color="#e11d48" />
              Random Forest Feature Importances
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              MDI Gini Importance
            </span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            {metrics?.feature_importances ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.feature_importances}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(254, 215, 170, 0.08)" />
                  <XAxis 
                    type="number" 
                    stroke="#9f7d87" 
                    tick={{ fill: '#fecdd3', fontSize: 11 }}
                    domain={[0, 'dataMax + 0.05']}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="feature" 
                    stroke="#9f7d87" 
                    tick={{ fill: '#fecdd3', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ background: '#190f15', borderColor: 'rgba(254, 215, 170, 0.25)', borderRadius: '8px' }}
                    formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Weight']}
                  />
                  <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                    {metrics.feature_importances.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#e11d48' : index === 1 ? '#fb923c' : index === 2 ? '#fed7aa' : '#be123c'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Project Technical Architecture */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header-bar">
            <h3 className="card-title">
              <FileCheck size={20} color="#fb923c" />
              Queuing Theory & ML Architecture
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              PDD Technical Design
            </span>
          </div>

          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '12px' }}>
              The system integrates multi-server queuing kinetics (M/M/c approximation) with ensemble decision trees:
            </p>
            <div style={{
              background: 'rgba(15, 10, 13, 0.85)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#fed7aa',
              marginBottom: '14px'
            }}>
              W_q ≈ (People Waiting × Avg Service Time) / Active Counters + Friction(hour, day, holiday)
            </div>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: '#fed7aa' }}>Random Forest Regressor:</strong> 120 decision trees capture non-linear congestion surges and multi-factor interactions without overfitting.
              </li>
              <li>
                <strong style={{ color: '#fed7aa' }}>Strict Software-Only Architecture:</strong> Replaces expensive camera/IoT hardware with instant, manual inputs and real-time operational optimization.
              </li>
              <li>
                <strong style={{ color: '#fed7aa' }}>What-If Optimization:</strong> Dynamically simulates adding or reducing counter capacity to provide proactive staff scheduling recommendations.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
