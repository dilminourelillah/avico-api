import express from 'express';
import Cycle from '../models/cycle.js';

const router = express.Router();

// إضافة دورة جديدة
router.post('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { chickensCount, startDate, durationWeeks } = req.body;

    const cycle = new Cycle({ deviceId, chickensCount, startDate, durationWeeks });
    await cycle.save();

    res.status(201).json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// جلب آخر دورة
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const cycle = await Cycle.findOne({ deviceId }).sort({ createdAt: -1 });
    res.json({ success: true, cycle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
