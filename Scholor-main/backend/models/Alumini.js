import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  aluminiId: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  batch: { type: Number },
  company: { type: String },
  designation: { type: String },
  qualification: { type: String },
  experience: { type: Number },
  skills: { type: String },
  bio: { type: String },
  profilePicture: { type: String },
  upiId: { type: String },
  filterPreferences: {
    department: { type: String, default: 'all' },
    incomeThreshold: { type: Number, default: 0 },
    financialNeedMin: { type: Number, default: 0 },
    financialNeedMax: { type: Number, default: 0 },
    noPreference: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('Alumni', alumniSchema);
