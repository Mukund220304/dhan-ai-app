import { useState, useEffect } from 'react';
import { fetchSummary, fetchExpenses } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Loader2 } from 'lucide-react';

const Card = ({ title, amount, type, icon: Icon }) => (
  <div className="surface-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <div style={{ background: type === 'income' || type === 'net' ? 'var(--success-bg)' : 'var(--danger-bg)', padding: 8, borderRadius: 8, display: 'flex' }}>
        <Icon size={18} color={type === 'income' || type === 'net' ? 'var(--success)' : 'var(--danger)'} />
      </div>
    </div>
    <span style={{ fontSize: 36, fontWeight: 800, color: type === 'income' || type === 'net' ? 'var(--success)' : 'var(--danger)' }}>
      {amount}
    </span>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { format: fmt } = useCurrency();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary()
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  const totalIncome = summary?.totalIncome || 0;
  const totalSpends = summary?.totalSpent || 0;
  const netRemaining = summary?.netRemaining || 0;

  // Map category breakdown for chart
  const chartData = summary?.categoryBreakdown?.map(c => ({
    name: c._id,
    spending: c.total
  })) || [];

  return (
    <div className="fade-up" style={{ width: '100%' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <Card title="Total Income" amount={`+${fmt(totalIncome)}`} type="income" icon={ArrowUpRight} />
        <Card title="Total Spends" amount={`-${fmt(totalSpends)}`} type="expense" icon={ArrowDownRight} />
        <Card title="Net Remaining" amount={`${fmt(netRemaining)}`} type="net" icon={Activity} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        <div className="surface-card">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>Spending by Category</h2>
          <div style={{ height: 350 }}>
            {chartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => fmt(value)} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}
                    formatter={(value) => [fmt(value)]}
                    cursor={{ fill: 'var(--surface-hover)' }}
                  />
                  <Bar dataKey="spending" name="Spending" fill="var(--danger)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="surface-card">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Recent Transactions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(!summary?.recentExpenses || summary.recentExpenses.length === 0) ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No recent transactions.</p>
            ) : (
              summary.recentExpenses.slice(0, 7).map(tx => (
                <div key={tx._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: 4 }}>{tx.merchant || tx.category}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(tx.date).toISOString().split('T')[0]}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-color)', color: 'var(--text-secondary)', borderRadius: 12, fontWeight: 600 }}>{tx.category.toUpperCase()}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
