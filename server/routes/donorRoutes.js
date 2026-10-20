// server/routes/donorRoutes.js
// Donor list, search, and donor history

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Setting = require('../models/Setting');
const { protect, adminOnly } = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');

// GET /api/donors - Get all donors with optional filters
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { bloodGroup, city, eligibleOnly } = req.query;
    let query = { role: 'donor' };

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(city.trim(), 'i');

    const donors = await User.find(query).select('-password').sort({ createdAt: -1 });

    const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
    const gapDays = gapSetting ? Number(gapSetting.value) : 90;

    let result = donors.map((d) => ({
      ...d.toObject(),
      eligibility: checkEligibility(d, gapDays),
    }));

    if (eligibleOnly === 'true') {
      result = result.filter((d) => d.eligibility.isEligible);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving donors' });
  }
});

// GET /api/donors/my/donations - Logged in donor's own history
router.get('/my/donations', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({ donationDate: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving donations' });
  }
});

// GET /api/donors/:id - Donor profile & past donation history
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const donor = await User.findById(req.params.id).select('-password');
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    const donations = await Donation.find({ donor: donor._id }).sort({ donationDate: -1 });
    const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
    const eligibility = checkEligibility(donor, gapSetting ? Number(gapSetting.value) : 90);

    res.json({ donor, eligibility, donations });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving donor' });
  }
});

module.exports = router;
