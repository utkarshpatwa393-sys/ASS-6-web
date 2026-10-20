// server/routes/dashboardRoutes.js
// Admin Dashboard stats and gap settings

const express = require('express');
const router = express.Router();
const BloodStock = require('../models/BloodStock');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/dashboard/stats - Admin summary stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stocks = await BloodStock.find().sort({ bloodGroup: 1 });
    const lowStockGroups = stocks.filter((s) => s.units <= s.minThreshold);
    const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [donationsThisMonth, totalDonations, pendingRequestsCount, totalDonors, gapSetting] =
      await Promise.all([
        Donation.countDocuments({ donationDate: { $gte: startOfMonth } }),
        Donation.countDocuments(),
        BloodRequest.countDocuments({ status: 'Pending' }),
        User.countDocuments({ role: 'donor' }),
        Setting.findOne({ key: 'donationGapDays' }),
      ]);

    res.json({
      stocks,
      lowStockGroups,
      totalUnits,
      donationsThisMonth,
      totalDonations,
      pendingRequestsCount,
      totalDonors,
      donationGapDays: gapSetting ? Number(gapSetting.value) : 90,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stats' });
  }
});

// GET /api/dashboard/settings - Get donation gap setting
router.get('/settings', protect, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'donationGapDays' });
    res.json({ donationGapDays: setting ? Number(setting.value) : 90 });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings' });
  }
});

// PUT /api/dashboard/settings - Update donation gap setting
router.put('/settings', protect, adminOnly, async (req, res) => {
  try {
    const days = Number(req.body.donationGapDays) || 90;
    await Setting.findOneAndUpdate(
      { key: 'donationGapDays' },
      { value: days },
      { upsert: true, new: true }
    );
    res.json({ message: 'Setting updated', donationGapDays: days });
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting' });
  }
});

module.exports = router;
