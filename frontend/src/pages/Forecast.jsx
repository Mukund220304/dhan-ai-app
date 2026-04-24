import { useState, useEffect } from 'react';
import { fetchForecast } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Forecast() {
  const { format: fmt } = useCurrency();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecast()
      .then(res => {
        if (res.data.error) setError(res.data.error);
        else setForecast(res.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load forecast due to an AI generation error.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>AI is crunching your numbers...</p>
      </div>
    );
  }

  const { analysis, predictedSpends, predictedSavings, categories } = forecast || {};

  const maxAmount = categories?.length > 0 ? categories[0].amount : 1;

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>AI Spending Forecast</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Predictive analysis for next month based on your history.</p>
      </div>

      {error ? (
        <div className="surface-card" style={{ padding: 40, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <h2 style={{ color: 'var(--danger)', fontSize: 20, marginBottom: 16 }}>AI Generation Failed</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>{error}</p>
        </div>
      ) : (
        <>
          {/* AI Insight Box */}
      <div className="surface-card" style={{ 
        background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.05) 0%, rgba(22, 22, 48, 0.8) 100%)',
        borderLeft: '4px solid var(--primary)',
        padding: 32, marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8, display: 'flex' }}>
            <Sparkles size={20} color="var(--primary)" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Forecast Analysis</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          {analysis}
        </p>
      </div>

      {/* Prediction Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="surface-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Predicted Spends</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--danger)', margin: 0 }}>{fmt(predictedSpends)}</p>
        </div>
        <div className="surface-card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Predicted Savings</p>
          <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--success)', margin: 0 }}>{fmt(predictedSavings)}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="surface-card" style={{ padding: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 32 }}>Category Breakdown</h2>
        
          <div style={{ width: '100%', height: 300, marginBottom: 40 }}>
            {categories && categories.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-tertiary)" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="var(--text-tertiary)" 
                    fontSize={12} 
                    tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    formatter={(value) => [fmt(value), 'Predicted']}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Detailed Breakdown</h3>
          {categories?.map((cat) => {
            const percentage = Math.min(100, (cat.amount / maxAmount) * 100);
            return (
              <div key={cat.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>{fmt(cat.amount)}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'var(--bg-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: 'var(--primary)',
                    borderRadius: 4,
                    transition: 'width 1s ease-out'
                  }} />
                </div>
              </div>
            )
          })}
          {(!categories || categories.length === 0) && <p style={{ color: 'var(--text-tertiary)', fontSize: 15, textAlign: 'center' }}>No data available for forecast.</p>}
        </div>
      </>
      )}
    </div>
  );
}
