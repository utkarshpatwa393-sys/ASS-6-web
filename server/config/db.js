// server/config/db.js
// Handles MongoDB connection and automatic default admin setup

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_bank_db');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-create default admin if not present (Zero manual setup needed)
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const password = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@bloodbank.com',
        password,
        role: 'admin',
      });
      console.log('✅ Default Admin ready: admin@bloodbank.com / admin123');
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
