// server/routes/requestRoutes.js
// Blood requests creation, pending edits, and admin approvals

const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');
const { protect, adminOnly } = require('../middleware/auth');
const { getCompatibleGroups } = require('../utils/eligibility');

// POST /api/requests - Create a blood request
router.post('/', protect, async (req, res) => {
  try {
    const { patientName, bloodGroup, units, hospital, requiredByDate, remarks } = req.body;
    if (!patientName || !bloodGroup || !units || !hospital || !requiredByDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const request = await BloodRequest.create({
      requester: req.user._id,
      patientName,
      bloodGroup,
      units: Number(units),
      hospital,
      requiredByDate: new Date(requiredByDate),
      remarks: remarks || '',
    });

    res.status(201).json({ message: 'Blood request created', request });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request' });
  }
});

// GET /api/requests/my - Get user's own requests
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving your requests' });
  }
});

// GET /api/requests/:id - Get request by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('requester', 'name email phone');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving request' });
  }
});

// PUT /api/requests/:id - Edit pending request
router.put('/:id', protect, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending requests can be edited' });
    }

    Object.assign(request, req.body);
    await request.save();
    res.json({ message: 'Request updated', request });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request' });
  }
});

// GET /api/requests - Admin: Get all requests
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;

    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving requests' });
  }
});

// PUT /api/requests/:id/status - Admin: Approve or Reject
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    if (action === 'Approved') {
      const stock = await BloodStock.findOne({ bloodGroup: request.bloodGroup });
      const currentUnits = stock ? stock.units : 0;

      if (currentUnits < request.units) {
        return res.status(400).json({
          message: `Insufficient stock for ${request.bloodGroup}. Available: ${currentUnits}, Requested: ${request.units}`,
        });
      }

      stock.units -= request.units;
      await stock.save();

      request.status = 'Approved';
      await request.save();
      return res.json({ message: 'Request approved and stock deducted', request });
    }

    if (action === 'Rejected') {
      request.status = 'Rejected';
      request.rejectionReason = rejectionReason || 'Rejected by Admin';
      await request.save();
      return res.json({ message: 'Request rejected', request });
    }

    res.status(400).json({ message: 'Action must be Approved or Rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

module.exports = router;
