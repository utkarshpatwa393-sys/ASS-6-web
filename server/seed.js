// server/seed.js - Simple Admin Setup
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blood_bank_db');

  const adminExists = await User.findOne({ email: 'admin@bloodbank.com' });
  if (!adminExists) {
    const password = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'System Admin',
      email: 'admin@bloodbank.com',
      password,
      role: 'admin',
    });
    console.log('✅ Admin account ready: admin@bloodbank.com / admin123');
  } else {
    console.log('Admin account already exists.');
  }

  process.exit();
};

createAdmin();
