// server/config/db.js
// Handles MongoDB connection and automatic default admin setup

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_bank_db';

    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ [WARNING] MONGODB_URI environment variable is not defined.');
      console.warn('⚠️ On Render, add MONGODB_URI in Dashboard > Environment (e.g. MongoDB Atlas URI).');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-create default admin if not present (Zero manual setup needed)
    try {
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
    } catch (adminErr) {
      console.error('Could not check/create default admin:', adminErr.message);
    }
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('👉 If deploying on Render: Please provide a valid MONGODB_URI in Render Environment Variables and allow Network Access (0.0.0.0/0) in MongoDB Atlas.');
    // Do NOT call process.exit(1) so the HTTP server stays online and Render does not return 502 Bad Gateway
  }
};

module.exports = connectDB;
