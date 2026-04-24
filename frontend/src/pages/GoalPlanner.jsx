import { useState, useEffect } from 'react';
import { fetchSummary, fetchGoalStrategy } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { EyeOff, Trash2, Plus, Sparkles, CheckSquare, Square, Loader2 } from 'lucide-react';

export default function GoalPlanner() {
  const { symbol } = useCurrency();
  const [netIncome, setNetIncome] = useState(0);
  const [netSpent, setNetSpent] = useState(0);
  const [aiStrategy, setAiStrategy] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [essentials, setEssentials] = useState([
    { id: 1, desc: 'Rent/Home Loan', amount: 0, checked: true },
    { id: 2, desc: 'Electricity Bill', amount: 0, checked: false },
    { id: 3, desc: 'Car EMI', amount: 0, checked: false }
  ]);
  const [newEssential, setNewEssential] = useState({ desc: '', amount: '' });
  const [showAddEssential, setShowAddEssential] = useState(false);

  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: '', target: '' });

  useEffect(() => {
    fetchSummary().then(res => {
      setNetIncome(res.data.totalIncome || 0);
      setNetSpent(res.data.totalSpent || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Only fetch strategy if there are goals, to save AI tokens on empty state
    if (goals.length > 0) {
      setIsAiLoading(true);
      fetchGoalStrategy({ goals, essentials })
        .then(res => setAiStrategy(res.data.strategy))
        .catch(() => setAiStrategy('Unable to generate strategy at this time.'))
        .finally(() => setIsAiLoading(false));
    } else {
      setAiStrategy('Add a goal above to get a personalized AI savings strategy based on your spending habits.');
    }
  }, [goals, essentials]);

  const totalEssentials = essentials.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const netSurplus = netIncome - netSpent;
  const allocatableSavings = Math.max(0, netSurplus - totalEssentials);

  const toggleCheck = (id) => {
    setEssentials(essentials.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  const removeEssential = (id) => {
    setEssentials(essentials.filter(e => e.id !== id));
  };

  const handleAddEssential = () => {
    if (!newEssential.desc || !newEssential.amount) return;
    setEssentials([...essentials, { id: Date.now(), desc: newEssential.desc, amount: parseFloat(newEssential.amount), checked: false }]);
    setNewEssential({ desc: '', amount: '' });
    setShowAddEssential(false);
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    setGoals([...goals, { id: Date.now(), name: newGoal.name, target: parseFloat(newGoal.target) }]);
    setNewGoal({ name: '', target: '' });
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 20px', paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, marginTop: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Goal Planner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>Manage your goals and monthly mandatory spends.</p>
        </div>
        <button className="btn-primary" style={{ background: 'rgba(108, 99, 255, 0.2)', color: '#a5b4fc', padding: '10px 20px', borderRadius: 24, fontSize: 13 }}>
          <EyeOff size={16} /> Hide Insights
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Monthly Essentials Table */}
        <div className="surface-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Monthly Essentials</h2>
            <button onClick={() => setShowAddEssential(!showAddEssential)} className="btn-primary" style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, gap: 6 }}>
              <Plus size={14} /> Add
            </button>
          </div>

          <table className="light-table" style={{ background: 'transparent' }}>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>ESSENTIAL DESCRIPTION</th>
                <th style={{ width: '30%' }}>AMOUNT ({symbol})</th>
                <th style={{ width: '20%', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {essentials.map(e => (
                <tr key={e.id}>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{e.desc}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                      {symbol}{parseFloat(e.amount).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      <button onClick={() => toggleCheck(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: e.checked ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                        {e.checked ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <button onClick={() => removeEssential(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--danger)', opacity: 0.7 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {showAddEssential && (
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td><input type="text" value={newEssential.desc} onChange={e => setNewEssential({...newEssential, desc: e.target.value})} placeholder="e.g. Internet Bill" className="light-input" style={{ padding: '8px 12px' }} /></td>
                  <td><input type="number" value={newEssential.amount} onChange={e => setNewEssential({...newEssential, amount: e.target.value})} placeholder="0.00" className="light-input" style={{ padding: '8px 12px' }} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={handleAddEssential} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>Save</button>
                  </td>
                </tr>
              )}

              <tr style={{ background: 'var(--bg-color)' }}>
                <td><span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Total Essentials Value:</span></td>
                <td colSpan={2}><span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>{symbol}{totalEssentials.toFixed(2)}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* New Saving Goal */}
        <div className="surface-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> New Saving Goal
          </h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <input type="text" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} placeholder="Goal name..." className="light-input" style={{ flex: 2, background: 'rgba(0,0,0,0.3)', borderRadius: 24 }} />
            <div style={{ position: 'relative', flex: 1 }}>
              <input type="number" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} placeholder="Target amount..." className="light-input" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 24 }} />
              <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>{symbol}</div>
            </div>
            <button onClick={handleAddGoal} className="btn-primary" style={{ borderRadius: 24, padding: '0 24px', whiteSpace: 'nowrap' }}>Add Goal</button>
          </div>
          
          {goals.length > 0 && (
             <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{symbol}{parseFloat(g.target).toFixed(2)}</span>
                      <button onClick={() => removeGoal(g.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>

        {/* Savings Strategy */}
        <div className="surface-card" style={{ padding: '24px', border: '1px solid rgba(108, 99, 255, 0.3)', background: 'linear-gradient(135deg, rgba(22, 22, 48, 0.8) 0%, rgba(108, 99, 255, 0.05) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} color="white" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '0.05em', margin: 0 }}>SAVINGS STRATEGY</h3>
          </div>
          {isAiLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              <Loader2 className="animate-spin" size={16} /> Generating personalized strategy...
            </div>
          ) : (
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: 0 }}>
              {aiStrategy}
            </p>
          )}
          <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, pointerEvents: 'none' }}>
            <Sparkles size={140} />
          </div>
        </div>

        {/* Allocatable Savings */}
        <div className="surface-card" style={{ padding: '48px 24px', textAlign: 'center', background: 'rgba(10, 10, 26, 0.4)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: '0 0 16px' }}>ALLOCATABLE SAVINGS</h3>
          <div style={{ fontSize: 48, fontWeight: 900, color: 'white', marginBottom: 16 }}>
            {symbol}{allocatableSavings.toFixed(2)}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>Monthly net surplus from statement data minus essentials.</p>
        </div>

      </div>
    </div>
  );
}
