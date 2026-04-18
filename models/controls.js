import mongoose from 'mongoose';

const controlsSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  fanStatus: { type: Boolean, default: false },
  heaterStatus: { type: Boolean, default: false },
  lightsStatus: { type: Boolean, default: false },
  autoMode: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

const Controls = mongoose.model('Controls', controlsSchema);
export default Controls;
