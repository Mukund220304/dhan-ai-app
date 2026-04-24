import { useState, useEffect } from 'react';
import { fetchExpenses, addExpense, deleteExpense } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Trash2, Loader2, Sparkles } from 'lucide-react';

const CATEGORIES = ['Salary', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health', 'Education', 'Travel', 'Other'];

export default function Transactions() {
  const { format: fmt, symbol } = useCurrency();
  const [activeTab, setActiveTab] = useState('list');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ amount: '', category: 'Food & Dining', merchant: '', type: 'expense', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchExpenses()
      .then(r => setExpenses(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return;
    setSaving(true);
    try {
      const r = await addExpense(form);
      setExpenses(p => [r.data, ...p]);
      setForm({ amount: '', category: 'Food & Dining', merchant: '', type: 'expense', date: new Date().toISOString().split('T')[0] });
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setExpenses(p => p.filter(e => e._id !== id));
    } catch { }
  };

  let filtered = expenses;
  if (filter === 'Income') filtered = expenses.filter(e => e.type === 'income');
  if (filter === 'Expense') filtered = expenses.filter(e => e.type === 'expense');
  if (filter === 'HighLow') filtered = [...expenses].sort((a, b) => b.amount - a.amount);
  
  const highestSpend = [...expenses].filter(e => e.type === 'expense').sort((a,b) => b.amount - a.amount)[0];

  return (
    <div className="fade-up" style={{ padding: '0 32px 32px 32px', minHeight: '100vh', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Header & Filters */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>All Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Detailed view of your financial records.</p>
        </div>
        
        {activeTab === 'list' && (
          <div style={{ display: 'flex', gap: 8, background: 'var(--surface)', padding: 8, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            {['All', 'Income', 'Expense', 'HighLow'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-secondary)',
              }}>{f === 'HighLow' ? 'High → Low' : f}</button>
            ))}
            <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
            <button onClick={() => setActiveTab('add')} style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: 'var(--surface-hover)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6
            }}><Plus size={14}/> Add Manual</button>
          </div>
        )}
        {activeTab === 'add' && (
          <button onClick={() => setActiveTab('list')} className="btn-ghost">Back to List</button>
        )}
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="fade-up-1">
          {/* AI Insight Box */}
          {expenses.length > 0 && (
            <div className="surface-card" style={{ 
              background: 'linear-gradient(to right, #fffbeb, #ffffff)',
              borderLeft: '4px solid var(--warning)',
              marginBottom: 32
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ background: 'var(--warning-bg)', padding: 6, borderRadius: 8, display: 'flex' }}>
                  <Sparkles size={16} color="var(--warning)" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Spending Habit Analysis</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                You have {expenses.length} recorded transactions. {highestSpend ? `${highestSpend.merchant || highestSpend.category} (${fmt(highestSpend.amount)}) is your highest single spend. ` : ''}
              </p>
            </div>
          )}

          <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                <Loader2 size={32} className="animate-spin" color="var(--primary)" />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-tertiary)' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No transactions found</p>
              </div>
            ) : (
              <table className="light-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e._id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {new Date(e.date).toISOString().split('T')[0]}
                      </td>
                      <td>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, margin: 0 }}>{e.merchant || e.category}</p>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, padding: '4px 10px', background: 'var(--bg-color)', color: 'var(--text-secondary)', borderRadius: 12, fontWeight: 600 }}>
                          {e.category.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: e.type === 'income' ? 'var(--success)' : 'var(--text-primary)', fontSize: 15 }}>
                        {e.type === 'income' ? '+' : '-'}{fmt(e.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleDelete(e._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add Form */}
      {activeTab === 'add' && (
        <div className="surface-card fade-up-2" style={{ padding: 40, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 24, marginBottom: 32 }}>Add Manual Transaction</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="type" checked={form.type === 'expense'} onChange={() => setForm(p => ({...p, type: 'expense'}))} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Expense</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="type" checked={form.type === 'income'} onChange={() => setForm(p => ({...p, type: 'income'}))} />
                <span style={{ fontWeight: 600, fontSize: 14 }}>Income</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Amount ({symbol})</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required className="light-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="light-input" />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Description</label>
              <input type="text" value={form.merchant} onChange={e => setForm(p => ({ ...p, merchant: e.target.value }))} className="light-input" />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="light-input">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '14px', fontSize: 16, marginTop: 16 }}>
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {saving ? 'Saving...' : 'Save Transaction'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
