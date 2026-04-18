import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String },          // ✅ رقم الهاتف
  deviceId: { type: String },          // ✅ معرف الجهاز ESP32
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
export default User;
