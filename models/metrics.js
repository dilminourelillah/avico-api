import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  temperature: Number,
  humidity: Number,
  nh3: Number,
  createdAt: { type: Date, default: Date.now }
});

const Metrics = mongoose.model('Metrics', metricsSchema);
export default Metrics;
