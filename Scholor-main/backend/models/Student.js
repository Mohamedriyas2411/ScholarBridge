import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  // Authentication information
  username: { 
    type: String, 
    required: function() { return process.env.NODE_ENV !== 'development'; }, 
    unique: true 
  },
  email: { 
    type: String, 
    required: function() { return process.env.NODE_ENV !== 'development'; }, 
    unique: true 
  },
  password: { 
    type: String, 
    required: function() { return process.env.NODE_ENV !== 'development'; } 
  },
  
  // Personal information
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  
  // Payment information
  upiId: { type: String },
  financialNeed: { type: Number, default: 0 },
  
  // Family information
  familyIncome: { type: Number },
  fatherOccupation: { type: String },
  motherOccupation: { type: String },
  isSingleParentChild: { type: Boolean, default: false },
  
  // Academic information
  currentDegree: { type: String },
  branch: { type: String },
  graduationYear: { type: Number },
  cgpa: { type: Number },
  backlogs: { type: Number, default: 0 },
  tuitionFee: { type: Number },
  tenthPercentage: { type: Number },
  twelfthPercentage: { type: Number },
  ugCgpa: { type: Number },
  
  // Document and additional information
  profilePicture: { type: String },
  certificates: [{ type: String }],
  bio: { type: String },
  
  // Reference to applications
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  
  // Metadata fields - automatically managed by Mongoose
}, { 
  timestamps: true,
  // Add virtuals to JSON representation
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add any virtual properties here if needed
// For example, full name virtual:
// studentSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

export default mongoose.model('Student', studentSchema);
