import express from 'express';
import Metrics from '../models/metrics.js';

const router = express.Router();

// جلب آخر القيم
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const metrics = await Metrics.find({ deviceId }).sort({ createdAt: -1 }).limit(1);
    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// إضافة قيم جديدة من ESP32
router.post('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { temperature, humidity, nh3, light } = req.body; // ✅ استقبل الضوء

    // إنشاء سجل جديد
    const metric = new Metrics({ deviceId, temperature, humidity, nh3, light });
    await metric.save();

    res.status(201).json({ success: true, metric });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
