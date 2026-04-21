import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  nh3: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Metrics = mongoose.model('Metrics', metricsSchema);
export default Metrics;
