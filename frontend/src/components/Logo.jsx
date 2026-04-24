import React from 'react';

export default function Logo({ size = 'medium', withTagline = false }) {
  const isSmall = size === 'small';
  const width = isSmall ? 36 : 64;
  const height = isSmall ? 36 : 64;
  const textScale = isSmall ? 0.6 : 1;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 10 : 16 }}>
      {/* 3D App Icon Logo */}
      <div style={{
        width, height,
        background: 'linear-gradient(135deg, #111 0%, #000 100%)',
        borderRadius: isSmall ? 10 : 20,
        boxShadow: `0 0 20px rgba(0, 242, 254, ${isSmall ? 0.2 : 0.4}), inset 0 1px 0 rgba(255,255,255,0.1)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        flexShrink: 0
      }}>
        {/* Glow behind icon */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(79, 172, 254, 0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(10px)' }} />
        
        <svg viewBox="0 0 100 100" width="70%" height="70%" style={{ position: 'relative', zIndex: 10 }}>
          <defs>
            <linearGradient id="cyanGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
            <linearGradient id="cyanGreenVertical" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00f2fe" />
              <stop offset="100%" stopColor="#4facfe" />
            </linearGradient>
          </defs>
          
          {/* Sparkle */}
          <path d="M 20 25 L 25 35 L 35 40 L 25 45 L 20 55 L 15 45 L 5 40 L 15 35 Z" fill="url(#cyanGreen)" opacity="0.9" />
          
          {/* Outer 'D' Arc */}
          <path d="M 25 30 Q 85 20 85 60 Q 85 90 35 90" fill="none" stroke="url(#cyanGreen)" strokeWidth="10" strokeLinecap="round" />
          
          {/* Inner Bar Chart */}
          <rect x="35" y="70" width="8" height="20" rx="4" fill="url(#cyanGreenVertical)" />
          <rect x="50" y="55" width="8" height="35" rx="4" fill="url(#cyanGreenVertical)" />
          <rect x="65" y="40" width="8" height="50" rx="4" fill="url(#cyanGreenVertical)" />
        </svg>
      </div>

      {/* Typography */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: isSmall ? 22 : 42, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
          <span style={{ color: 'white' }}>Dhan</span>
          <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </div>
        {withTagline && !isSmall && (
          <div style={{ fontSize: 10, color: '#00f2fe', fontWeight: 700, letterSpacing: '3px', marginTop: 8 }}>
            SMART FINANCE. BETTER YOU.
          </div>
        )}
      </div>
    </div>
  );
}
