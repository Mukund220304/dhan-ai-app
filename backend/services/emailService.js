const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email
const sendOTPEmail = async (to, name, otp) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a1a; margin: 0; padding: 0; }
    .wrapper { max-width: 520px; margin: 40px auto; }
    .card { background: #161630; border: 1px solid rgba(108,99,255,0.2); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6c63ff, #22d3ee); padding: 32px; text-align: center; }
    .logo { font-size: 24px; font-weight: 900; color: white; letter-spacing: -0.5px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: white; margin-bottom: 12px; }
    .text { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; margin-bottom: 28px; }
    .otp-box { background: rgba(108,99,255,0.1); border: 2px solid rgba(108,99,255,0.3); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 28px; }
    .otp { font-size: 48px; font-weight: 900; color: white; letter-spacing: 12px; font-family: monospace; }
    .otp-label { font-size: 12px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }
    .timer { font-size: 13px; color: #f59e0b; font-weight: 600; text-align: center; margin-bottom: 24px; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .footer-text { font-size: 12px; color: rgba(255,255,255,0.2); }
  </style></head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <div class="logo">⚡ Dhan AI</div>
        </div>
        <div class="body">
          <div class="greeting">Hey ${name}! 👋</div>
          <div class="text">
            Thanks for joining Dhan AI — your personal AI-powered expense tracker.<br><br>
            Use the OTP below to verify your email address and activate your account.
          </div>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="otp-label">Your One-Time Password</div>
          </div>
          <div class="timer">⏱ This OTP expires in 10 minutes</div>
          <div class="text" style="font-size:13px;">If you didn't create an account with Dhan AI, you can safely ignore this email.</div>
        </div>
        <div class="footer">
          <div class="footer-text">© ${new Date().getFullYear()} Dhan AI · Secure financial intelligence</div>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Dhan AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${otp} — Your Dhan AI Verification Code`,
    html,
  });
};

// Send weekly summary email
const sendWeeklySummary = async (user, stats) => {
  const sym = user.preferences?.currencySymbol || '₹';
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><style>
    body { font-family: -apple-system, sans-serif; background: #0a0a1a; margin: 0; }
    .wrapper { max-width: 520px; margin: 40px auto; }
    .card { background: #161630; border: 1px solid rgba(108,99,255,0.2); border-radius: 20px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6c63ff, #22d3ee); padding: 28px 32px; }
    .logo { font-size: 20px; font-weight: 900; color: white; }
    .week { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; }
    .body { padding: 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: white; margin-bottom: 24px; }
    .stat-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .stat { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; }
    .stat-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .stat-val { font-size: 22px; font-weight: 800; color: white; }
    .cat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .cat-name { font-size: 13px; color: rgba(255,255,255,0.6); }
    .cat-amt { font-size: 13px; font-weight: 700; color: white; }
    .cta { display: block; background: linear-gradient(135deg,#6c63ff,#4f46e5); color: white; text-decoration: none; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; margin-top: 24px; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 12px; color: rgba(255,255,255,0.2); }
  </style></head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <div class="logo">⚡ Dhan AI</div>
          <div class="week">Weekly Financial Summary</div>
        </div>
        <div class="body">
          <div class="greeting">Here's your week, ${user.name.split(' ')[0]} 📊</div>
          <div class="stat-row">
            <div class="stat">
              <div class="stat-label">This Week</div>
              <div class="stat-val">${sym}${stats.weeklyTotal.toFixed(2)}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Transactions</div>
              <div class="stat-val">${stats.count}</div>
            </div>
          </div>
          ${stats.categories.length > 0 ? `
          <div style="margin-top: 20px; margin-bottom: 8px; font-size: 12px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em;">Top Categories</div>
          ${stats.categories.slice(0, 4).map(c => `<div class="cat-item"><span class="cat-name">${c._id}</span><span class="cat-amt">${sym}${c.total.toFixed(2)}</span></div>`).join('')}
          ` : ''}
          <a href="http://localhost:5173/dashboard" class="cta">View Full Dashboard →</a>
        </div>
        <div class="footer">
          You're receiving this because you enabled weekly summaries.<br>
          <a href="http://localhost:5173/settings" style="color: rgba(108,99,255,0.8);">Manage preferences</a>
        </div>
      </div>
    </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: `"Dhan AI" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your Weekly Financial Summary — ${sym}${stats.weeklyTotal.toFixed(2)} spent this week`,
    html,
  });
};

// Send spending alert
const sendSpendingAlert = async (user, currentTotal, threshold) => {
  const sym = user.preferences?.currencySymbol || '₹';
  await transporter.sendMail({
    from: `"Dhan AI" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🚨 Spending Alert — You've crossed ${sym}${threshold}`,
    html: `
    <div style="font-family:sans-serif;background:#0a0a1a;padding:40px;">
      <div style="max-width:480px;margin:0 auto;background:#161630;border:1px solid rgba(239,68,68,0.3);border-radius:20px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px 32px;">
          <div style="font-size:20px;font-weight:900;color:white;">⚡ Dhan AI — Spending Alert</div>
        </div>
        <div style="padding:32px;">
          <p style="color:white;font-size:18px;font-weight:700;">Hey ${user.name.split(' ')[0]},</p>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;">
            Your total spending this month has crossed your set threshold of <strong style="color:#f59e0b;">${sym}${threshold}</strong>.
          </p>
          <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
            <div style="font-size:12px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">Current Monthly Spend</div>
            <div style="font-size:36px;font-weight:900;color:#f87171;margin-top:8px;">${sym}${currentTotal.toFixed(2)}</div>
          </div>
          <a href="http://localhost:5173/dashboard" style="display:block;background:linear-gradient(135deg,#6c63ff,#4f46e5);color:white;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:14px;">Review Your Spending →</a>
        </div>
      </div>
    </div>`,
  });
};

module.exports = { generateOTP, sendOTPEmail, sendWeeklySummary, sendSpendingAlert };
