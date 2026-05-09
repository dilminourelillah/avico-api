import express from 'express';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dilminouari973@gmail.com',
    pass: 'gond weti ypgb snyp'
  }
});

let pendingUsers = {};

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, deviceId, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '⚠️ Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 999999).toString();
    pendingUsers[email] = { fullName, email, phone, deviceId, password: hashedPassword, code };
    await transporter.sendMail({
      from: 'dilminouari973@gmail.com',
      to: email,
      subject: 'Email Verification - AVICO',
      html: `<p>Your verification code is <b>${code}</b></p>`
    });
    res.json({ success: true, message: '✅ Code sent to email' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (pendingUsers[email] && pendingUsers[email].code === code) {
      const user = new User(pendingUsers[email]);
      await user.save();
      delete pendingUsers[email];
      return res.json({ success: true, message: '✅ Email verified successfully', user });
    }
    res.json({ success: false, message: '❌ Invalid code' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: '❌ Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ Invalid credentials' });
    }
    res.json({ success: true, message: '✅ Login successful', user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const user = await User.findOne({ deviceId });
    if (!user) {
      return res.status(404).json({ success: false, message: '❌ No user found for this device' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;