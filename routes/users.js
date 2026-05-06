import express from 'express';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = express.Router();

// تسجيل مستخدم جديد (Signup)
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, deviceId, password } = req.body;

    // ✅ تحقق من الحقول الأساسية
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: '❌ Missing required fields' });
    }

    // تحقق إذا البريد موجود مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '⚠️ Email already registered' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // توليد كود تحقق (OTP) من 6 أرقام
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // إنشاء مستخدم جديد بحالة غير متحقق
    const user = new User({
      fullName,
      email,
      phone: phone || null,
      deviceId: deviceId || null,
      password: hashedPassword,
      isVerified: false,
      verificationCode // نخزن الكود في قاعدة البيانات
    });

    await user.save();

    // 🔹 هنا تقدر تبعث الكود عبر البريد أو SMS (مثلاً Firebase أو Nodemailer)
    console.log(`📩 Verification code for ${email}: ${verificationCode}`);

    res.json({ success: true, message: '✅ User created, verification code sent', user });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: '❌ Server error', error: err.message });
  }
});

// التحقق عبر الإيميل بالكود
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: '❌ Email and code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: '❌ User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: '❌ Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null; // نمسح الكود بعد التحقق
    await user.save();

    res.json({ success: true, message: '✅ Email verified successfully', user });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, message: '❌ Server error', error: err.message });
  }
});

// تحديث حالة التحقق بعد نجاح Firebase (للـ phone)
router.post('/verify-phone', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '❌ Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: '❌ User not found' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: '✅ Phone verified successfully', user });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ success: false, message: '❌ Server error', error: err.message });
  }
});

// تسجيل الدخول (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '❌ Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: '❌ Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: '⚠️ Account not verified yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ Invalid credentials' });
    }

    res.json({ success: true, message: '✅ Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: '❌ Server error', error: err.message });
  }
});

export default router;
