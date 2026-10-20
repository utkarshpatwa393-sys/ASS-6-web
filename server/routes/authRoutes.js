// server/routes/authRoutes.js
// User login, register, and profile

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, dateOfBirth, city, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'donor',
      bloodGroup: role === 'admin' ? undefined : bloodGroup,
      dateOfBirth: role === 'admin' ? undefined : dateOfBirth,
      city: city || '',
      phone: phone || '',
    });

    res.status(201).json({ token: createToken(user._id), user });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let eligibility = null;
    if (user.role === 'donor') {
      const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
      eligibility = checkEligibility(user, gapSetting ? Number(gapSetting.value) : 90);
    }

    res.json({ token: createToken(user._id), user, eligibility });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me - Current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let eligibility = null;
    if (user.role === 'donor') {
      const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
      eligibility = checkEligibility(user, gapSetting ? Number(gapSetting.value) : 90);
    }

    res.json({ user, eligibility });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    Object.assign(user, req.body);
    await user.save();

    let eligibility = null;
    if (user.role === 'donor') {
      const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
      eligibility = checkEligibility(user, gapSetting ? Number(gapSetting.value) : 90);
    }

    res.json({ message: 'Profile updated', user, eligibility });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

module.exports = router;
