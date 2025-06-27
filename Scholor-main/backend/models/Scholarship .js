import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  amount: { type: Number, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scholarship', scholarshipSchema);
