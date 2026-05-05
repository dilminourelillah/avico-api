import express from 'express';
import History from '../models/history.js';

const router = express.Router();

// ===== جلب الهيستوريك حسب اليوم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { date } = req.query; // التاريخ يجي من الواجهة

    const start = new Date(date);

    // ✅ فلترة مباشرة باليوم فقط (YYYY-MM-DD)
    const history = await History.find({
      deviceId,
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          start.toISOString().split('T')[0]
        ]
      }
    }).sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
