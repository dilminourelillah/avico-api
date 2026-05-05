import express from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/users.js';

const app = express();
app.use(express.json());

// تحميل ملف credentials.json
const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));

const oAuth2Client = new google.auth.OAuth2(
  CREDENTIALS.web.client_id,
  CREDENTIALS.web.client_secret,
  CREDENTIALS.web.redirect_uris[0]
);

// تخزين مؤقت للمستخدمين قبل التحقق
let pendingUsers = {};

// رابط الموافقة
app.get('/auth', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
  });
  res.redirect(url);
});

// استقبال الكود وتخزين tokens
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync('tokens.json', JSON.stringify(tokens));
  res.send('✅ Gmail API Authorized and tokens saved');
});

// تسجيل مستخدم جديد (Signup → إرسال كود)
app.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, deviceId, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '⚠️ Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 999999).toString();

    pendingUsers[email] = { fullName, email, phone, deviceId, password: hashedPassword, code };

    // تحميل tokens
    const tokens = JSON.parse(fs.readFileSync('tokens.json'));
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const message = [
      'From: "Avico" <dilminouari973@gmail.com>',
      `To: ${email}`,
      'Subject: Email Verification',
      '',
      `Your verification code is ${code}`,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    res.json({ success: true, message: '✅ Code sent to email' });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// التحقق من الكود
app.post('/verify-email', async (req, res) => {
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

app.listen(3000, () => console.log('Server running on port 3000'));
