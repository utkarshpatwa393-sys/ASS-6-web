// server/models/BloodStock.js
// Stores current blood stock levels for each of the 8 blood groups

const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      unique: true,
    },
    units: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Units cannot be negative'],
    },
    minThreshold: {
      type: Number,
      default: 5, // Alert if stock drops below this threshold
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodStock', bloodStockSchema);
