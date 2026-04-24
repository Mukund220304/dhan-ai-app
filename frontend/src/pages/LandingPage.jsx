import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Brain, BarChart3, Shield, TrendingUp, MessageSquare, ArrowRight, Upload, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const features = [
  { icon: Brain, title: 'AI-Powered Intelligence', desc: 'Our AI reads your actual transactions, not generic data. Ask it anything about your money.', color: '#818cf8' },
  { icon: BarChart3, title: 'Live Dynamic Analytics', desc: 'Area charts, donut charts, and bar graphs that update the moment you add a transaction.', color: '#22d3ee' },
  { icon: Upload, title: 'Multi-Source Data', desc: 'Add manually, upload CSV, or paste SMS text. All data gets parsed and categorized automatically.', color: '#facc15' },
  { icon: Shield, title: 'Secure & Encrypted', desc: 'JWT authentication and bcrypt encryption. Your financial data never leaves your account.', color: '#34d399' },
  { icon: TrendingUp, title: 'Trend Detection', desc: 'Spot recurring expenses and seasonal patterns. Stay ahead of your spending habits.', color: '#a78bfa' },
  { icon: MessageSquare, title: 'Persistent Memory', desc: 'Your AI advisor remembers every conversation. Pick up where you left off, anytime.', color: '#f472b6' },
];

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = document.body.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', overflowX: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Premium Noise Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.03, pointerEvents: 'none', zIndex: 999 }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Dhan<span style={{ color: '#818cf8' }}>AI</span></span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: 16 }}
        >
          <Link to="/auth" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='white'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>Sign In</Link>
          <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '10px 24px', background: 'white', color: 'black', borderRadius: 999, fontSize: 14, fontWeight: 700, transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(255,255,255,0.2)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>Get Started</Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 180, paddingBottom: 120, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 10 }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, backdropFilter: 'blur(10px)' }}
          >
            <div style={{ width: 8, height: 8, background: '#818cf8', borderRadius: '50%', boxShadow: '0 0 10px #818cf8', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, color: '#c7d2fe', fontWeight: 600, letterSpacing: '0.5px' }}>Meet your new AI Financial Advisor</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05, letterSpacing: '-3px', marginBottom: 24, textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          >
            Wealth tracking,<br />
            <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>reimagined by AI.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 48, maxWidth: 640, fontWeight: 400 }}
          >
            Connect your accounts, upload receipts, and let Dhan AI instantly categorize, forecast, and advise you on your financial future.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            style={{ display: 'flex', gap: 16 }}
          >
            <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '16px 36px', background: 'white', color: 'black', borderRadius: 999, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(255,255,255,0.15)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              Start for Free <ChevronRight size={18} />
            </Link>
          </motion.div>
        </div>

        {/* 3D Interactive Floating Dashboard */}
        <motion.div 
          style={{ perspective: 1200, marginTop: 80, width: '100%', maxWidth: 1100, padding: '0 24px', zIndex: 10 }}
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, type: 'spring' }}
        >
          <motion.div 
            style={{ 
              rotateX, rotateY, 
              transformStyle: "preserve-3d",
              background: 'rgba(20, 20, 25, 0.6)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 24, 
              padding: 32, 
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Fake Dashboard Top Bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, transform: 'translateZ(20px)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#eab308' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e' }} />
            </div>

            {/* Fake Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              {[['Total Balance', '₹4,820,000', '#10b981'], ['Monthly Spend', '₹124,000', '#ef4444'], ['AI Forecast', '+₹12,000', '#8b5cf6'], ['Top Category', 'Housing', '#f59e0b']].map(([label, val, color], i) => (
                <motion.div 
                  key={label}
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, transform: 'translateZ(30px)' }}
                  whileHover={{ translateZ: 50, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: color, margin: 0 }}>{val}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Insight Box */}
            <motion.div 
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0.5) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24, transform: 'translateZ(40px)', display: 'flex', alignItems: 'center', gap: 20 }}
              whileHover={{ translateZ: 60 }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain color="#818cf8" size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: '#e0e7ff' }}>Dhan AI Insight</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>I noticed you spent 30% more on Dining this week. Based on your current trajectory, you may miss your savings goal by ₹4,500.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '120px 32px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 20 }}>Beyond basic tracking.</h2>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto' }}>A completely reimagined financial intelligence stack built exclusively on top of modern AI.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
          {features.map((f, i) => (
            <motion.div 
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, transition: 'all 0.3s' }}
              whileHover={{ y: -8, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                <f.icon size={28} color={f.color} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', position: 'relative' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: 1000, margin: '0 auto', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: 32, padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.3)' }}
        >
          {/* Abstract background shapes */}
          <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: '#4f46e5', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, background: '#ec4899', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.5 }} />

          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 20 }}>Stop guessing. Start knowing.</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>Join the next generation of personal finance powered by advanced AI.</p>
            <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '18px 48px', background: 'white', color: 'black', borderRadius: 999, fontSize: 18, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
              Create Free Account <ChevronRight size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginTop: 40 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500 }}>© {new Date().getFullYear()} Dhan AI. Designed for clarity.</p>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; box-shadow: 0 0 10px #818cf8; } 50% { opacity: 0.5; box-shadow: 0 0 20px #818cf8; } }
      `}</style>
    </div>
  );
}
