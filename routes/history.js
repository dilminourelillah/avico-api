import express from 'express';
import History from '../models/history.js';

const router = express.Router();

// ===== جلب الهيستوريك حسب اليوم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { date } = req.query; // التاريخ يجي من الواجهة

    // اليوم المطلوب بصيغة YYYY-MM-DD
    const day = new Date(date).toISOString().split('T')[0];

    // ✅ فلترة مباشرة باليوم فقط مع تحديد التوقيت المحلي
    const history = await History.find({
      deviceId,
      $expr: {
        $eq: [
          { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt", 
              timezone: "Africa/Algiers" // التوقيت المحلي
            } 
          },
          day
        ]
      }
    }).sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
