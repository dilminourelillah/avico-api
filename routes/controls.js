import express from 'express';
import Controls from '../models/controls.js';
import History from '../models/history.js'; // ✅ استدعاء موديل الهيستوريك

const router = express.Router();

// ✅ Route POST: يخزن أو يحدث القيم + يسجل الأحداث في History
router.post('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { fanStatus, heaterStatus, lightsStatus, autoMode } = req.body;

    const control = await Controls.findOneAndUpdate(
      { deviceId },
      { fanStatus, heaterStatus, lightsStatus, autoMode, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    // ✅ نسجل الأحداث في History
    if (fanStatus !== undefined) {
      await History.create({
        deviceId,
        event: fanStatus ? 'Fan turned ON' : 'Fan turned OFF',
        values: {},
        createdAt: new Date()
      });
    }
    if (heaterStatus !== undefined) {
      await History.create({
        deviceId,
        event: heaterStatus ? 'Heater turned ON' : 'Heater turned OFF',
        values: {},
        createdAt: new Date()
      });
    }
    if (lightsStatus !== undefined) {
      await History.create({
        deviceId,
        event: lightsStatus ? 'Lights turned ON' : 'Lights turned OFF',
        values: {},
        createdAt: new Date()
      });
    }
    if (autoMode !== undefined) {
      await History.create({
        deviceId,
        event: autoMode ? 'Auto Mode Activated' : 'Auto Mode Deactivated',
        values: {},
        createdAt: new Date()
      });
    }

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
