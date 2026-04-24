import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, loginUser, verifyOTP, resendOTP } from '../services/api';
import { Eye, EyeOff, Zap, Brain, TrendingUp, Shield, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Reusable input style
  const inputStyle = {
    width: '100%',
    padding: '16px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: '"Inter", sans-serif', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      
      {/* Premium Noise Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.03, pointerEvents: 'none', zIndex: 999 }} />

      {/* Background Gradients */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 800, height: 800, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 800, height: 800, background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      {/* Left branding panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
            <Zap size={22} color="white" />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Dhan<span style={{ color: '#818cf8' }}>AI</span></span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          Your money,<br />
          <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>understood by AI.</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', marginBottom: 48, lineHeight: 1.6, maxWidth: 440, fontWeight: 400 }}>
          Upload your bank statements and let AI instantly categorize, analyze, and forecast your financial future.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {features.map(({ icon: Icon, text }, i) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color="#818cf8" />
              </div>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 10 }}>
        
        {/* 3D Glassmorphic Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}
          style={{ width: '100%', maxWidth: 460, background: 'rgba(20, 20, 25, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 48, boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
        >
          <AnimatePresence mode="wait">
            {/* OTP Screen */}
            {otpState.active ? (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => { setOtpState({ active: false, email: '', digits: ['','','','','',''] }); setError(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 40, padding: 0 }}>
                  <ArrowLeft size={16} /> Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Mail size={32} color="#818cf8" />
                  </div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Check your email</h1>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                    We sent a 6-digit code to<br />
                    <strong style={{ color: 'white' }}>{otpState.email}</strong>
                  </p>
                </div>

                {error && <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, fontSize: 14, color: '#f87171', textAlign: 'center', fontWeight: 500 }}>{error}</div>}

                {/* OTP digit inputs */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }} onPaste={handleOTPPaste}>
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
                        width: 50, height: 60, textAlign: 'center', fontSize: 24, fontWeight: 700,
                        background: 'rgba(0,0,0,0.4)',
                        border: `2px solid ${d ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 12, color: 'white', outline: 'none', transition: 'all 0.2s',
                        boxShadow: d ? '0 0 15px rgba(129, 140, 248, 0.3)' : 'none'
                      }}
                      onFocus={e => e.target.style.borderColor = '#818cf8'}
                      onBlur={e => e.target.style.borderColor = d ? '#818cf8' : 'rgba(255,255,255,0.1)'}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <button onClick={handleVerifyOTP} disabled={loading || otpState.digits.join('').length < 6} style={{ width: '100%', padding: '16px', background: 'linear-gradient(to right, #818cf8, #c084fc)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: (loading || otpState.digits.join('').length < 6) ? 'not-allowed' : 'pointer', opacity: (loading || otpState.digits.join('').length < 6) ? 0.7 : 1, transition: 'transform 0.2s, opacity 0.2s' }} onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.transform='scale(1.02)')} onMouseLeave={e => !e.currentTarget.disabled && (e.currentTarget.style.transform='scale(1)')}>
                  Verify & Continue
                </button>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button onClick={handleResendOTP} disabled={resendTimer > 0}
                    style={{ background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer', color: resendTimer > 0 ? 'rgba(255,255,255,0.4)' : '#818cf8', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <RefreshCw size={14} />
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Login/Register Form */
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div style={{ marginBottom: 40 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-1px' }}>
                    {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
                  </h1>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
                    {mode === 'login' ? 'Sign in to continue to Dhan AI' : 'Start your AI-powered financial journey'}
                  </p>
                </div>

                {error && <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, fontSize: 14, color: '#f87171', fontWeight: 500 }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {mode === 'register' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Full Name</label>
                      <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your Full Name" style={inputStyle} onFocus={e => e.target.style.borderColor='#818cf8'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                    </motion.div>
                  )}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor='#818cf8'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }} onFocus={e => e.target.style.borderColor='#818cf8'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                      <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', padding: 0 }}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{ padding: '16px', background: 'linear-gradient(to right, #818cf8, #c084fc)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e => !loading && (e.currentTarget.style.transform='scale(1.02)')} onMouseLeave={e => !loading && (e.currentTarget.style.transform='scale(1)')}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <p style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setForm({ name:'',email:'',password:'' }); }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#818cf8', fontWeight:700, fontSize:14, transition: 'color 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color='#c084fc'} onMouseLeave={e=>e.currentTarget.style.color='#818cf8'}>
                    {mode === 'login' ? 'Sign up free' : 'Log in'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
