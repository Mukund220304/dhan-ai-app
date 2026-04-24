import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, TrendingUp, Receipt, Target, 
  FileSearch, MessageSquare, Settings, Zap, 
  LogOut, UploadCloud
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/goals', icon: Target, label: 'Goal Planner' },
  { to: '/extract', icon: FileSearch, label: 'AI Extract' },
  { to: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar-wrapper" style={{ 
      padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="white" />
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>Dhan <span style={{ color: 'var(--primary)' }}>AI</span></span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to} 
            to={to} 
            className={({ isActive }) => `top-nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/extract')} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, height: 'auto', borderRadius: 8 }}>
          <UploadCloud size={16} /> New Upload
        </button>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
