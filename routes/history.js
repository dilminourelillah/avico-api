import express from 'express';
import History from '../models/history.js';

const router = express.Router();

// ===== جلب الهيستوريك حسب اليوم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { date } = req.query; // التاريخ يجي من الواجهة

    // بداية اليوم
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    // نهاية اليوم
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const history = await History.find({
      deviceId,
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
