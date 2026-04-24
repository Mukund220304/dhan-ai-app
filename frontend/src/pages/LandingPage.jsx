import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Shield, TrendingUp, MessageSquare, Upload, ChevronRight } from 'lucide-react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import Logo from '../components/Logo';

const features = [
  { icon: Brain, title: 'AI-Powered Intelligence', desc: 'Our AI reads your actual transactions, not generic data. Ask it anything about your money.', color: '#00f2fe' },
  { icon: BarChart3, title: 'Live Dynamic Analytics', desc: 'Area charts, donut charts, and bar graphs that update the moment you add a transaction.', color: '#4facfe' },
  { icon: Upload, title: 'Multi-Source Data', desc: 'Add manually, upload CSV, or paste SMS text. All data gets parsed and categorized automatically.', color: '#c084fc' },
  { icon: Shield, title: 'Secure & Encrypted', desc: 'JWT authentication and bcrypt encryption. Your financial data never leaves your account.', color: '#34d399' },
  { icon: TrendingUp, title: 'Trend Detection', desc: 'Spot recurring expenses and seasonal patterns. Stay ahead of your spending habits.', color: '#facc15' },
  { icon: MessageSquare, title: 'Persistent Memory', desc: 'Your AI advisor remembers every conversation. Pick up where you left off, anytime.', color: '#ec4899' },
];

function TiltCard({ children, style }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [20, -20]);
  const rotateY = useTransform(x, [-150, 150], [-20, 20]);
  
  function onMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ perspective: 1200, ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          width: '100%',
          height: '100%',
          transition: 'all 0.1s ease-out'
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-400, 400], [15, -15]);
  const rotateY = useTransform(x, [-400, 400], [-15, 15]);

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
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', overflowX: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Hyper-Premium Animated Noise Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")', opacity: 0.04, pointerEvents: 'none', zIndex: 999 }} />

      {/* Futuristic Deep Space Grid */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(0, 242, 254, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 254, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0, transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)', opacity: 0.5 }} />

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(5, 5, 5, 0.5)', backdropFilter: 'blur(30px)', borderBottom: '1px solid rgba(0,242,254,0.1)', padding: '0 40px', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <Logo size="small" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: 20 }}
        >
          <Link to="/auth" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '8px 16px', borderRadius: 8, transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '1px' }} onMouseEnter={e => e.currentTarget.style.color='#00f2fe'} onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>Sign In</Link>
          <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '12px 28px', background: 'linear-gradient(to right, #00f2fe, #4facfe)', color: 'black', borderRadius: 12, fontSize: 14, fontWeight: 800, transition: 'all 0.3s', boxShadow: '0 10px 30px rgba(0,242,254,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05) translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1) translateY(0)'}>Get Started</Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 200, paddingBottom: 120, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        
        {/* Animated Background Orbs */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 1000, background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: 300, right: -300, width: 800, height: 800, background: 'radial-gradient(circle, rgba(192, 132, 252, 0.1) 0%, rgba(0,0,0,0) 60%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, type: 'spring' }} style={{ marginBottom: 40 }}>
            <Logo size="large" withTagline={true} />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 56, maxWidth: 700, fontWeight: 400 }}
          >
            Connect your accounts, upload receipts, and let a highly advanced AI categorize, forecast, and map out your financial trajectory in real-time.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            style={{ display: 'flex', gap: 20 }}
          >
            <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '20px 48px', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: 'black', borderRadius: 16, fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s', boxShadow: '0 20px 50px rgba(0, 242, 254, 0.4), inset 0 2px 0 rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05) translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1) translateY(0)'}>
              Launch App <ChevronRight size={22} strokeWidth={3} />
            </Link>
          </motion.div>
        </div>

        {/* 3D Interactive Floating Dashboard */}
        <motion.div 
          style={{ perspective: 1500, marginTop: 100, width: '100%', maxWidth: 1200, padding: '0 24px', zIndex: 10 }}
          initial={{ opacity: 0, y: 150 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.5, type: 'spring' }}
        >
          <motion.div 
            style={{ 
              rotateX, rotateY, 
              transformStyle: "preserve-3d",
              background: 'linear-gradient(145deg, rgba(20, 20, 25, 0.8), rgba(5, 5, 10, 0.9))', 
              border: '1px solid rgba(0,242,254,0.2)', 
              borderRadius: 32, 
              padding: 40, 
              boxShadow: '0 50px 100px rgba(0,0,0,0.8), 0 0 80px rgba(0,242,254,0.15), inset 0 2px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px)'
            }}
          >
            {/* Fake Dashboard Top Bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 40, transform: 'translateZ(30px)' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 10px #eab308' }} />
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
            </div>

            {/* Fake Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 40 }}>
              {[['Net Worth', '₹4,820,000', '#00f2fe'], ['Monthly Burn', '₹124,000', '#f43f5e'], ['AI Forecast', '+₹12,000', '#c084fc'], ['Anomalies', 'Zero', '#34d399']].map(([label, val, color], i) => (
                <motion.div 
                  key={label}
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 30, transform: 'translateZ(40px)', position: 'relative', overflow: 'hidden' }}
                  whileHover={{ translateZ: 80, scale: 1.05, borderColor: color, boxShadow: \`0 20px 40px \${color}40\` }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: color, filter: 'blur(50px)', opacity: 0.2 }} />
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>{label}</p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: 'white', margin: 0 }}>{val}</p>
                </motion.div>
              ))}
            </div>

            {/* AI Insight Box */}
            <motion.div 
              style={{ background: 'linear-gradient(135deg, rgba(0,242,254,0.1) 0%, rgba(0,0,0,0.8) 100%)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: 20, padding: 32, transform: 'translateZ(60px)', display: 'flex', alignItems: 'flex-start', gap: 24 }}
              whileHover={{ translateZ: 100, boxShadow: '0 30px 60px rgba(0,242,254,0.2)' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,242,254,0.4)' }}>
                <Brain color="black" size={32} />
              </div>
              <div>
                <h4 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: '#00f2fe', letterSpacing: '1px', textTransform: 'uppercase' }}>System Insight</h4>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>"Anomalous spending detected in 'Entertainment' this week (+34%). Based on your historical velocity, I've dynamically recalibrated your end-of-month savings projection."</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Extreme 3D Feature Grid */}
      <section style={{ padding: '160px 32px', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 100 }}>
          <h2 style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-2px', marginBottom: 24, textTransform: 'uppercase', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>The Future of</span><br/>
            Wealth Intelligence.
          </h2>
          <p style={{ fontSize: 22, color: 'rgba(0, 242, 254, 0.8)', maxWidth: 800, margin: '0 auto', fontWeight: 600, letterSpacing: '1px' }}>A deeply immersive, hyper-fast analytic engine.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 40 }}>
          {features.map((f, i) => (
            <TiltCard key={f.title}>
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                style={{ 
                  background: 'linear-gradient(160deg, rgba(30,30,35,0.8) 0%, rgba(10,10,12,0.9) 100%)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: 32, 
                  padding: 48, 
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'translateZ(20px)'
                }}
                whileHover={{ 
                  borderColor: \`\${f.color}60\`,
                  boxShadow: \`0 30px 60px rgba(0,0,0,0.8), inset 0 0 80px \${f.color}15\`
                }}
              >
                {/* Internal Card Glow */}
                <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: f.color, filter: 'blur(80px)', opacity: 0.15, transform: 'translateZ(0)' }} />
                
                <div style={{ width: 72, height: 72, borderRadius: 20, background: \`\${f.color}15\`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: \`1px solid \${f.color}40\`, transform: 'translateZ(40px)', boxShadow: \`0 10px 20px \${f.color}20\` }}>
                  <f.icon size={36} color={f.color} />
                </div>
                <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, color: 'white', transform: 'translateZ(30px)' }}>{f.title}</h3>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, fontWeight: 500, transform: 'translateZ(20px)' }}>{f.desc}</p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 32px', position: 'relative', zIndex: 10 }}>
        <TiltCard style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ 
              background: 'linear-gradient(135deg, #050505 0%, #111 100%)', 
              borderRadius: 40, 
              padding: '100px 40px', 
              textAlign: 'center', 
              position: 'relative', 
              overflow: 'hidden', 
              border: '1px solid rgba(0,242,254,0.3)',
              boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
              transform: 'translateZ(30px)'
            }}
          >
            {/* Abstract background shapes */}
            <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: '#00f2fe', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15 }} />
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: '#c084fc', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15 }} />

            <div style={{ position: 'relative', zIndex: 10, transform: 'translateZ(50px)' }}>
              <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-2px', marginBottom: 24, textTransform: 'uppercase' }}>Initialize Protocol.</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22, marginBottom: 50, maxWidth: 600, margin: '0 auto 50px', fontWeight: 500 }}>Bypass legacy banking. Enter the intelligence era.</p>
              <Link to="/auth?tab=register" style={{ textDecoration: 'none', padding: '24px 64px', background: 'white', color: 'black', borderRadius: 20, fontSize: 20, fontWeight: 900, display: 'inline-flex', alignItems: 'center', gap: 16, transition: 'all 0.3s', boxShadow: '0 20px 50px rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05) translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1) translateY(0)'}>
                Create Account <ChevronRight size={24} strokeWidth={3} />
              </Link>
            </div>
          </motion.div>
        </TiltCard>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginTop: 80, position: 'relative', zIndex: 10, background: '#050505' }}>
        <Logo size="small" withTagline={false} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600, marginTop: 24, letterSpacing: '2px', textTransform: 'uppercase' }}>© {new Date().getFullYear()} Dhan AI. All protocols active.</p>
      </footer>
    </div>
  );
}
