import express from 'express';
import Alerts from '../models/alerts.js';

const router = express.Router();

router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const alerts = await Alerts.find({ deviceId }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
