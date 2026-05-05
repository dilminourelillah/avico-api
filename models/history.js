import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  event: { type: String, required: true }, // وصف الحدث
  values: {
    temperature: Number,
    humidity: Number,
    nh3: Number,
    light: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);
export default History;
