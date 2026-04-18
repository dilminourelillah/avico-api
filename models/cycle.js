import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  chickensCount: Number,
  startDate: Date,
  durationWeeks: Number,
  currentWeek: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Cycle = mongoose.model('Cycle', cycleSchema);
export default Cycle;
