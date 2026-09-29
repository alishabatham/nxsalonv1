const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Salon = require('../models/Salon');
const { protect, recordAudit } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'nx_salon_os_v1_jwt_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId can be email or mobile
    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide mobile/email and password' });
    }

    const query = loginId.includes('@') ? { email: loginId.toLowerCase().trim() } : { mobile: loginId.trim() };
    const user = await User.findOne(query);

    if (!user) {
      // Spec Section 4: Do not reveal whether email/mobile exists
      return res.status(401).json({ success: false, message: 'Invalid mobile/email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile/email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact salon admin.' });
    }

    const token = generateToken(user._id);
    const salon = user.salonId ? await Salon.findById(user.salonId) : await Salon.findOne();

    await recordAudit({
      user,
      action: 'LOGIN',
      entity: 'User',
      entityId: user._id,
      details: { role: user.role },
      salonId: salon ? salon._id : null
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profilePhoto: user.profilePhoto,
        salonId: salon ? salon._id : null
      },
      salon
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/auth/register (Owner / Admin setup)
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    let existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this mobile or email already exists' });
    }

    let salon = await Salon.findOne();
    if (!salon) {
      salon = await Salon.create({
        name: 'NX Salon',
        phone: mobile,
        email: email.toLowerCase(),
        address: 'Main Street, Tech Park',
        city: 'Mumbai',
        workingHours: [
          { day: 'Monday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Tuesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Wednesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Thursday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Friday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
          { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '20:00' }
        ]
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password,
      role: role || 'owner',
      salonId: salon._id
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        salonId: salon._id
      },
      salon
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/auth/forgot-password (Spec Section 5)
const otpStore = {}; // Temporary store for demo OTPs

router.post('/forgot-password', async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) {
      return res.status(400).json({ success: false, message: 'Mobile or Email is required' });
    }
    const query = loginId.includes('@') ? { email: loginId.toLowerCase().trim() } : { mobile: loginId.trim() };
    const user = await User.findOne(query);
    if (!user) {
      // Return generic message for security
      return res.json({ success: true, message: 'If an account exists, OTP has been sent.', simulatedOtp: '123456' });
    }

    const otp = '123456'; // Simulated standard test OTP
    otpStore[user._id.toString()] = { otp, expires: Date.now() + 10 * 60 * 1000 };

    res.json({
      success: true,
      message: `OTP sent to ${user.mobile || user.email}`,
      simulatedOtp: otp,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword, confirmPassword } = req.body;
    if (!userId || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password is too weak (minimum 6 characters required)' });
    }

    const storedOtp = otpStore[userId];
    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: 'OTP is incorrect' });
    }
    if (Date.now() > storedOtp.expires) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    delete otpStore[userId];

    res.json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const salon = req.user.salonId ? await Salon.findById(req.user.salonId) : await Salon.findOne();
    res.json({
      success: true,
      user: req.user,
      salon
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
