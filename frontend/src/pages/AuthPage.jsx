import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser, verifyOTP, resendOTP } from '../services/api';
import { Eye, EyeOff, Zap, Brain, TrendingUp, Shield, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

const features = [
  { icon: Brain, text: 'AI-powered spending insights' },
  { icon: TrendingUp, text: 'Real-time analytics & charts' },
  { icon: Shield, text: 'Bank-grade security' },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otpState, setOtpState] = useState({ active: false, email: '', digits: ['', '', '', '', '', ''] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode === 'login') {
        const res = await loginUser({ email: form.email, password: form.password });
        if (res.data.requiresOTP) {
          setOtpState({ active: true, email: res.data.email || form.email, digits: ['', '', '', '', '', ''] });
          setResendTimer(60);
        } else {
          localStorage.setItem('dhanai_token', res.data.token);
          window.location.href = '/dashboard';
        }
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        const res = await registerUser({ name: form.name, email: form.email, password: form.password });
        if (res.data.requiresOTP) {
          setOtpState({ active: true, email: res.data.email || form.email, digits: ['', '', '', '', '', ''] });
          setResendTimer(60);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleOTPDigit = (index, value) => {
    const v = value.replace(/\D/g, '').slice(-1);
    const digits = [...otpState.digits];
    digits[index] = v;
    setOtpState(p => ({ ...p, digits }));
    setError('');
    if (v && index < 5) otpRefs.current[index + 1]?.focus();
    if (!v && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const digits = [...otpState.digits];
    pasted.forEach((d, i) => { if (i < 6) digits[i] = d; });
    setOtpState(p => ({ ...p, digits }));
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otp = otpState.digits.join('');
    if (otp.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyOTP({ email: otpState.email, otp });
      localStorage.setItem('dhanai_token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOTP({ email: otpState.email });
      setResendTimer(60);
      setOtpState(p => ({ ...p, digits: ['', '', '', '', '', ''] }));
      setError('');
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)' }}>
      {/* Left branding panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Dhan <span style={{ color: 'var(--primary)' }}>AI</span></span>
        </div>

        <h2 style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Your money,<br />
          <span style={{ color: 'var(--primary)' }}>understood by AI.</span>
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 48, lineHeight: 1.6, maxWidth: 400 }}>
          Upload your bank statements and let Gemini instantly categorize, analyze, and forecast your financial future.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {features.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
                <Icon size={18} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', background: 'var(--bg-color)' }}>

        {/* OTP Screen */}
        {otpState.active ? (
          <div>
            <button onClick={() => { setOtpState({ active: false, email: '', digits: ['','','','','',''] }); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 40, padding: 0 }}>
              <ArrowLeft size={16} /> Back
            </button>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Mail size={32} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Check your email</h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                We sent a 6-digit code to<br />
                <strong style={{ color: 'var(--text-primary)' }}>{otpState.email}</strong>
              </p>
            </div>

            {error && <div style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--danger)', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

            {/* OTP digit inputs */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }} onPaste={handleOTPPaste}>
              {otpState.digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOTPDigit(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) otpRefs.current[i-1]?.focus(); }}
                  style={{
                    width: 56, height: 64, textAlign: 'center', fontSize: 28, fontWeight: 700,
                    background: 'var(--bg-color)',
                    border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button onClick={handleVerifyOTP} disabled={loading || otpState.digits.join('').length < 6} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, marginBottom: 24 }}>
              Verify & Continue
            </button>

            <div style={{ textAlign: 'center' }}>
              <button onClick={handleResendOTP} disabled={resendTimer > 0}
                style={{ background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer', color: resendTimer > 0 ? 'var(--text-tertiary)' : 'var(--primary)', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={14} />
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        ) : (
          /* Login/Register Form */
          <div>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Start your financial journey'}
              </p>
            </div>

            {error && <div style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--danger)', fontWeight: 500 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
                  <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your Full Name" className="light-input" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="light-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="••••••••" className="light-input" style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 0 }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '16px', fontSize: 16, marginTop: 8 }}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p style={{ marginTop: 32, textAlign: 'center', fontSize: 15, color: 'var(--text-secondary)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setForm({ name:'',email:'',password:'' }); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontWeight:700, fontSize:15 }}>
                {mode === 'login' ? 'Sign up free' : 'Log in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
