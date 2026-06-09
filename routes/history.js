import express from 'express';
import History from '../models/history.js';

const router = express.Router();

// ===== جلب الهيستوريك حسب اليوم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { date } = req.query;

    const day = new Date(date).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await History.find({
      deviceId,
      createdAt: { $gte: thirtyDaysAgo },
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Africa/Algiers" } },
          day
        ]
      }
    }).sort({ createdAt: 1 }); // ✅ ascending باش الـ chart يكون من اليسار ليمين

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== جلب الهيستوريك حسب الشهر =====
router.get('/:deviceId/stats/month', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { month } = req.query; // format: YYYY-MM

    if (!month) return res.status(400).json({ success: false, error: 'month required (YYYY-MM)' });

    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1);           // أول يوم في الشهر
    const end   = new Date(year, m, 1);               // أول يوم الشهر الجاي

    const history = await History.find({
      deviceId,
      createdAt: { $gte: start, $lt: end },
      'values': { $exists: true }
    }).sort({ createdAt: 1 });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== جلب كل الهيستوريك (الدورة الكاملة = 30 يوم) =====
router.get('/:deviceId/stats/cycle', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await History.find({
      deviceId,
      createdAt: { $gte: thirtyDaysAgo },
      'values': { $exists: true }
    }).sort({ createdAt: 1 });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;