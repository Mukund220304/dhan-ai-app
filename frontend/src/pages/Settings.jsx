import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Smartphone, ShieldAlert, ArrowLeft, Eye, EyeOff, LogOut, User as UserIcon, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} style={{
    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.25s',
    background: checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
  </button>
);

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications'); // default based on screenshot

  // Security state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [twoFactor, setTwoFactor] = useState(true);

  // Notification state
  const [spendingAlerts, setSpendingAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [useForecast, setUseForecast] = useState(true);
  const [threshold, setThreshold] = useState('2159.3');

  const toggleShow = (field) => setShowPass(p => ({ ...p, [field]: !p[field] }));

  const tabs = [
    { id: 'account', label: 'Account Details', icon: <UserIcon size={18} /> },
    { id: 'security', label: 'Security', icon: <ShieldAlert size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'banks', label: 'Connected Banks', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 700, margin: '0 auto', padding: '0 20px', paddingBottom: 60 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, marginTop: 20 }}>
        <Link to="/dashboard" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '4px 0 0' }}>Manage your preferences and account privacy.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Tab Header */}
              <div 
                onClick={() => setActiveTab(isActive ? null : tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', cursor: 'pointer',
                  background: isActive ? 'rgba(255,255,255,0.02)' : 'transparent',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  borderBottom: isActive ? 'none' : (tab.id !== 'banks' ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'),
                  borderRadius: isActive ? '16px 16px 0 0' : '8px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {tab.icon}
                  <span style={{ fontSize: 15, fontWeight: isActive ? 600 : 500 }}>{tab.label}</span>
                </div>
                <ChevronRight size={18} color="var(--text-tertiary)" style={{ transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>

              {/* Tab Content */}
              {isActive && (
                <div className="surface-card" style={{ padding: '32px', borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -1, borderTop: 'none' }}>
                  
                  {/* --- ACCOUNT DETAILS --- */}
                  {tab.id === 'account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Profile Information</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Update your account details here.</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email Address</label>
                        <input type="email" value={user?.email || ''} readOnly className="light-input" style={{ opacity: 0.7 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Currency Preference</label>
                        <select className="light-input" defaultValue="INR">
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: 24, fontSize: 14, width: 'fit-content' }}>Save Changes</button>
                    </div>
                  )}

                  {/* --- SECURITY --- */}
                  {tab.id === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {/* Change Password */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                          <Lock size={18} color="var(--text-primary)" />
                          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Change Password</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {['current', 'new', 'confirm'].map((field) => (
                            <div key={field} style={{ position: 'relative', width: '100%', maxWidth: 350 }}>
                              <input 
                                type={showPass[field] ? 'text' : 'password'} 
                                placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} Password`}
                                value={passwords[field]} 
                                onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))} 
                                className="light-input" 
                                style={{ paddingRight: 40 }} 
                              />
                              <button type="button" onClick={() => toggleShow(field)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex' }}>
                                {showPass[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          ))}
                          <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: 24, fontSize: 14, width: 'fit-content', marginTop: 8 }}>Update Password</button>
                        </div>
                      </div>

                      {/* 2FA */}
                      <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Two-Factor Authentication</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Add an extra layer of security.</p>
                        </div>
                        <Toggle checked={twoFactor} onChange={setTwoFactor} />
                      </div>

                      {/* Logout */}
                      <button onClick={logout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: 'fit-content' }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}

                  {/* --- NOTIFICATIONS --- */}
                  {tab.id === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>Notification Preferences</h3>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Receive alerts for low balance, high spending, or unusual activity.</p>
                      </div>

                      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px 0' }}>Spending Alerts</h4>
                          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>Notify when a category exceeds budget.</p>
                        </div>
                        <Toggle checked={spendingAlerts} onChange={setSpendingAlerts} />
                      </div>

                      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px 0' }}>Weekly Summary</h4>
                          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>Receive a personalized financial report every Sunday.</p>
                        </div>
                        <Toggle checked={weeklySummary} onChange={setWeeklySummary} />
                      </div>

                      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Spending Threshold (INR)</h4>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            Use Forecast
                            <input type="checkbox" checked={useForecast} onChange={e => setUseForecast(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                          </label>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            value={threshold} 
                            onChange={e => setThreshold(e.target.value)} 
                            disabled={useForecast}
                            className="light-input" 
                            style={{ opacity: useForecast ? 0.5 : 1, paddingRight: 40 }} 
                          />
                          <Lock size={14} color="var(--text-tertiary)" style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, marginBottom: 0 }}>
                          Current threshold is automatically calculated from your latest AI forecast.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* --- CONNECTED BANKS --- */}
                  {tab.id === 'banks' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Bank Email Sync (Gmail)</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Automatically sync transactions directly from your Gmail inbox securely via OAuth2.</p>
                      </div>
                      <button style={{ background: 'white', color: '#1f2937', border: 'none', padding: '12px 24px', borderRadius: 24, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Link with Google
                      </button>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>Note: We use secure Google OAuth2 login. No manual app passwords needed.</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
