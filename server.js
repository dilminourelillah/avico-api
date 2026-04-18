import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

import userRoutes from './routes/users.js';
import metricsRoutes from './routes/metrics.js';
import controlsRoutes from './routes/controls.js';
import alertsRoutes from './routes/alerts.js';
import cycleRoutes from './routes/cycle.js';

const app = express();

// Middleware
app.use(bodyParser.json());

// فعل CORS (يسمح للواجهة تتصل بالسيرفر)
app.use(cors({
  origin: 'https://avico-dashboard.onrender.com', // رابط الواجهة
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

// اتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ربط الـ routes
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/control', controlsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/cycle', cycleRoutes);

// Route افتراضي للتأكد أن السيرفر يخدم
app.get('/', (req, res) => {
  res.send('API is running...');
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 AVICO API running on port ${PORT}`));
