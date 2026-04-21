import express from 'express';
import Controls from '../models/controls.js';

const router = express.Router();

// ✅ Route POST: يخزن أو يحدث القيم
router.post('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { fanStatus, heaterStatus, lightsStatus, autoMode } = req.body;

    const control = await Controls.findOneAndUpdate(
      { deviceId },
      { fanStatus, heaterStatus, lightsStatus, autoMode, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({ success: true, control });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Route GET: يرجع القيم للـ ESP32
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const control = await Controls.findOne({ deviceId });
    if (!control) {
      return res.json({ success: false, message: 'No controls found' });
    }
    res.json({ success: true, controls: control });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

