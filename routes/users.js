import express from 'express';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// تخزين مؤقت للمستخدمين قبل التحقق
let pendingUsers = {};

// تسجيل مستخدم جديد (Signup → إرسال كود)
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, deviceId, password } = req.body;

    // تحقق إذا البريد موجود مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '⚠️ Email already registered' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // توليد كود 6 أرقام
    const code = crypto.randomInt(100000, 999999).toString();

    // تخزين مؤقت
    pendingUsers[email] = { fullName, email, phone, deviceId, password: hashedPassword, code };

    // إرسال البريد عبر Elastic Email
    await axios.post("https://api.elasticemail.com/v2/email/send", null, {
      params: {
        apikey: "83AE7B90B776EF501F6F04EBFECD2EA6E6071E3206FB164F6838092526C7D18BD0A3E0B6F828FD7B2CDD7DF4EF5359E4",
        subject: "Email Verification",
        from: "dilminouari973@gmail.com", // لازم يكون verified sender
        to: email,
        bodyText: `Your verification code is ${code}`,
      },
    });

    res.json({ success: true, message: '✅ Code sent to email' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// التحقق من الكود (Verify → تسجيل نهائي)
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

// تسجيل الدخول (Login)
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

// البحث عن مستخدم عبر Device ID
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
