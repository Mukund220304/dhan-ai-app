const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateOTP, sendOTPEmail } = require('../services/emailService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const safeUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isEmailVerified: user.isEmailVerified,
  preferences: user.preferences,
  notifications: user.notifications,
  token,
});

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // If not verified, allow re-sending OTP
      if (!existing.isEmailVerified) {
        const otp = generateOTP();
        existing.otp = otp;
        existing.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await existing.save();
        try { await sendOTPEmail(email, name, otp); } catch (e) { console.warn('Email failed:', e.message); }
        return res.status(200).json({ requiresOTP: true, email, message: 'OTP resent to your email.' });
      }
      return res.status(400).json({ message: 'Email already registered. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      isEmailVerified: false,
    });

    // Try to send OTP email (non-blocking)
    try { await sendOTPEmail(email, name, otp); } catch (e) { console.warn('Email send failed (check EMAIL_USER/EMAIL_PASS in .env):', e.message); }

    res.status(201).json({ requiresOTP: true, email, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested. Please register again.' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    if (user.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP. Please check your email.' });

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json(safeUser(user, generateToken(user._id)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try { await sendOTPEmail(email, user.name, otp); } catch (e) { console.warn('Email send failed:', e.message); }
    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isEmailVerified) {
      // Resend OTP silently
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      try { await sendOTPEmail(email, user.name, otp); } catch (e) {}
      return res.status(403).json({ requiresOTP: true, email, message: 'Please verify your email. OTP resent.' });
    }

    res.json(safeUser(user, generateToken(user._id)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
  res.json(safeUser(user, null));
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    try { await sendOTPEmail(email, user.name, otp); } catch (e) { console.warn('Email failed:', e.message); }
    res.json({ message: 'OTP sent to your email for password reset.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP requested.' });

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired.' });

    if (user.otp !== otp.trim())
      return res.status(400).json({ message: 'Invalid OTP.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = { registerUser, loginUser, verifyOTP, resendOTP, getMe, forgotPassword, resetPassword };
