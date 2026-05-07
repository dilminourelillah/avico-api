import express from 'express';
import User from '../models/users.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// تخزين مؤقت للمستخدمين قبل التحقق
let pendingUsers = {};

// 🟢 تسجيل مستخدم جديد (Signup → إرسال كود عبر MailerLite)
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

    // 🔹 إرسال البريد عبر MailerLite API
    await axios.post('https://connect.mailerlite.com/api/transactional/messages', {
      from: { email: 'dilminouari973@gmail.com', name: 'avico' }, // Sender Email + Name
      to: [{ email }],
      subject: 'Email Verification',
      text: `Your verification code is ${code}`,
      html: `<p>Your verification code is <b>${code}</b></p>`
    }, {
      headers: {
        'Authorization': `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiYTg1YjczZWFiYTkwMDk4N2IyOTQ4MjgyN2E3ZmIyNDE3MzVmNWUwMWQyZmMxZDA0MTkxM2Q0ZDE3N2M5Njc0N2RmYmRkOTg1OTI4ZTg1YjQiLCJpYXQiOjE3NzgxNTUyMDcuOTAyMzU0LCJuYmYiOjE3NzgxNTUyMDcuOTAyMzU2LCJleHAiOjQ5MzM4Mjg4MDcuODk2NDIzLCJzdWIiOiIyMzQ2Mjk3Iiwic2NvcGVzIjpbXX0.OOnhaMDW2mjeeaKYZsEc14N4TC9gGpm9FTM7wBURm4n1p6Gk2jFs_6U8R6DXcSVH04Z2xI7ZFp3XT5gZuXgglJ_wFSqJcA4765-a5CQ0sGiIvHLMEVz7KCZ78Eej1DHi53jY1npTAcEe-fmRazSWdPLosOZc1RwtDMojEAXcXb82IfnjLjvk7H3YUYHy1QG6auZtDdhu1fjduQNUAnnmLW5CRg381EaRenA70Ov9zesbHaJ5MInBsgq0GdztppvAzbIcFbM2aTi5nNsXyiCcZBHsf8bL3D3tEjQGmDdj_zDRpnXfvr8Rm1uK4VH1D8IHxuvTiNPPhz-7wWuVd7hDv1Hwf58t0YQgVsfJhI_arNB-6exWDbKJD9dw7m3XG5nCnUwxNZcO9UrnSOSBygg_Fpu8Rc6-KhL3fa_qSS8XwlbQdC2iarRikbdx3XKavN8yMAk1VhHqmPSyZQ5nJKdA_6RR7X-doArgwS3IJOXi_6gNDdJBIZwhMBjLsqk6PAzcdLtXKu0s1mSImqnzgPCJhhy4NU-lFDSKTYOUI4vnsOtCiXlq1cIrF_yEi4VPwaFRLQ8sEHAKaR7XykcQ6U33ljAEXL4zRcRi6ty1Zd6v1bD95QJIFnjBKM6oh6-IC70eJz5bD2tIEvAHOaAq_dakW_GZy5AjdyDokjQg8vum32A `,
        'Content-Type': 'application/json'
      }
    });

    res.json({ success: true, message: '✅ Code sent to email' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🟢 التحقق من الكود (Verify → تسجيل نهائي)
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

export default router;
