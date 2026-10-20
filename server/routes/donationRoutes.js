// server/routes/donationRoutes.js
// Record new donations and view donation logs

const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const Setting = require('../models/Setting');
const { protect, adminOnly } = require('../middleware/auth');
const { checkEligibility } = require('../utils/eligibility');

// POST /api/donations - Admin records a donation & auto-increments stock
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { donorId, units, donationDate, remarks } = req.body;
    const unitsCount = Number(units) || 1;

    const donor = await User.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    // Eligibility check
    const gapSetting = await Setting.findOne({ key: 'donationGapDays' });
    const eligibility = checkEligibility(donor, gapSetting ? Number(gapSetting.value) : 90);
    if (!eligibility.isEligible) {
      return res.status(400).json({ message: eligibility.reason });
    }

    const recordedDate = donationDate ? new Date(donationDate) : new Date();

    // 1. Create donation entry
    const donation = await Donation.create({
      donor: donor._id,
      bloodGroup: donor.bloodGroup,
      units: unitsCount,
      donationDate: recordedDate,
      remarks: remarks || '',
    });

    // 2. Update donor's last donation date
    donor.lastDonationDate = recordedDate;
    await donor.save();

    // 3. Increase blood stock
    await BloodStock.findOneAndUpdate(
      { bloodGroup: donor.bloodGroup },
      { $inc: { units: unitsCount } },
      { upsert: true }
    );

    res.status(201).json({ message: 'Donation recorded successfully', donation });
  } catch (error) {
    res.status(500).json({ message: 'Error recording donation' });
  }
});

// GET /api/donations - Get all donations
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email phone bloodGroup city')
      .sort({ donationDate: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving donations' });
  }
});

module.exports = router;
