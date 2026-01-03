import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema({
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sender.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    },
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String
    }
  },
  receiver: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiver.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Alumni']
    },
    username: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
connectionRequestSchema.index({ 'sender.userId': 1, 'receiver.userId': 1 });
connectionRequestSchema.index({ 'receiver.userId': 1, status: 1 });

export default mongoose.model('ConnectionRequest', connectionRequestSchema);
