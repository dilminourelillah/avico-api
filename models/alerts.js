import mongoose from 'mongoose';

const alertsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  message: String,
  level: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
  createdAt: { type: Date, default: Date.now }
});

const Alerts = mongoose.model('Alerts', alertsSchema);
export default Alerts;
