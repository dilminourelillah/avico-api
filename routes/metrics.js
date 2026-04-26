import express from 'express';
import Metrics from '../models/metrics.js';

const router = express.Router();

// ===== جلب آخر القيم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const metrics = await Metrics.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!metrics || metrics.length === 0) {
      return res.json({ success: false, message: 'No metrics found' });
    }

    res.json({ success: true, metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== إضافة قيم جديدة من ESP32 =====
router.post('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { temperature, humidity, nh3, light } = req.body;

    const metric = new Metrics({
      deviceId,
      temperature,
      humidity,
      nh3,
      light,
      createdAt: new Date()
    });

    await metric.save();

    res.status(201).json({ success: true, metric });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== جلب القيم اليومية (معدل لكل يوم) =====
router.get('/:deviceId/daily', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const dailyMetrics = await Metrics.aggregate([
      { $match: { deviceId } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 7=Saturday
          avgTemp: { $avg: "$temperature" },
          avgHumidity: { $avg: "$humidity" },
          avgNh3: { $avg: "$nh3" },
          avgLight: { $avg: "$light" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const daysMap = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const labels = dailyMetrics.map(m => daysMap[m._id - 1]);
    const temp = dailyMetrics.map(m => m.avgTemp);
    const humidity = dailyMetrics.map(m => m.avgHumidity);
    const nh3 = dailyMetrics.map(m => m.avgNh3);
    const light = dailyMetrics.map(m => m.avgLight);

    res.json({ success: true, days: labels, temp, humidity, nh3, light });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
