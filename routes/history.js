import express from 'express';
import History from '../models/history.js';

const router = express.Router();

// ===== جلب الهيستوريك حسب اليوم مع تخزين 30 يوم =====
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { date } = req.query; // التاريخ يجي من الواجهة بصيغة YYYY-MM-DD

    // اليوم المطلوب
    const day = new Date(date).toISOString().split('T')[0];

    // بداية الفترة (30 يوم قبل)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await History.find({
      deviceId,
      createdAt: { $gte: thirtyDaysAgo }, // ✅ نخزن آخر 30 يوم
      $expr: {
        $eq: [
          { 
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt", 
              timezone: "Africa/Algiers" 
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
