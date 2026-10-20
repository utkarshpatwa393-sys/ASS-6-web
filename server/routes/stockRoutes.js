// server/routes/stockRoutes.js
// Blood stock inventory & compatibility

const express = require('express');
const router = express.Router();
const BloodStock = require('../models/BloodStock');
const { protect, adminOnly } = require('../middleware/auth');
const { getCompatibleGroups } = require('../utils/eligibility');

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// GET /api/stock - Get all blood stocks
router.get('/', async (req, res) => {
  try {
    let stocks = await BloodStock.find().sort({ bloodGroup: 1 });

    // Auto-initialize 8 groups if empty
    if (stocks.length < 8) {
      for (const bg of ALL_BLOOD_GROUPS) {
        if (!stocks.find((s) => s.bloodGroup === bg)) {
          const created = await BloodStock.create({ bloodGroup: bg, units: 10, minThreshold: 5 });
          stocks.push(created);
        }
      }
      stocks.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    }

    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving blood stock' });
  }
});

// PUT /api/stock/:bloodGroup - Admin updates stock units or threshold
router.put('/:bloodGroup', protect, adminOnly, async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { units, minThreshold } = req.body;

    const stock = await BloodStock.findOneAndUpdate(
      { bloodGroup },
      { $set: { ...(units !== undefined && { units }), ...(minThreshold !== undefined && { minThreshold }) } },
      { new: true, upsert: true }
    );

    res.json({ message: 'Stock updated', stock });
  } catch (error) {
    res.status(500).json({ message: 'Error updating blood stock' });
  }
});

// GET /api/stock/compatibility/:bloodGroup - Compatible donor groups
router.get('/compatibility/:bloodGroup', async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const compatibleGroupNames = getCompatibleGroups(bloodGroup);
    const stocks = await BloodStock.find({ bloodGroup: { $in: compatibleGroupNames } });

    const compatibleStock = compatibleGroupNames.map((bg) => {
      const match = stocks.find((s) => s.bloodGroup === bg);
      return {
        bloodGroup: bg,
        units: match ? match.units : 0,
        isUniversal: bg === 'O-',
      };
    });

    res.json({ targetBloodGroup: bloodGroup, compatibleGroups: compatibleStock });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving compatibility' });
  }
});

module.exports = router;
